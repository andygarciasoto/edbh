import { Request, Response } from 'express';
import { WorkcellRepository } from '../repositories/workcell-repository';
import { AssetRepository } from '../repositories/asset-repository';
import { DTReasonRepository } from '../repositories/dtreason-repository';
import { ShiftRepository } from '../repositories/shift-repository';
import { TagRepository } from '../repositories/tag-repository';
import { CommonParametersRepository } from '../repositories/commonparameters-repository';
import { UomRepository } from '../repositories/uom-repository';
import { UnavailableRepository } from '../repositories/unavailable-repository';
import { UserRepository } from '../repositories/user-repository';
import { AssetDisplaySystemRepository } from '../repositories/assetdisplaysystem-repository';
import { DxHDataRepository } from '../repositories/dxhdata-repository';
import { headers, getParametersOfTable, getValuesFromHeaderTable } from '../configurations/datatoolutils';
import Excel from 'exceljs';
import * as _ from 'lodash';

export class DataToolService {

    private readonly workcellrepository: WorkcellRepository;
    private readonly assetrepository: AssetRepository;
    private readonly dtreasonrepository: DTReasonRepository;
    private readonly shiftrepository: ShiftRepository;
    private readonly tagrepository: TagRepository;
    private readonly commonparametersrepository: CommonParametersRepository;
    private readonly uomrepository: UomRepository;
    private readonly unavailablerepository: UnavailableRepository;
    private readonly userrepository: UserRepository;
    private readonly assetdisplaysystemrepository: AssetDisplaySystemRepository;
    private readonly dxhdatarepository: DxHDataRepository;

    public constructor(
        workcellrepository: WorkcellRepository,
        assetrepository: AssetRepository,
        dtreasonrepository: DTReasonRepository,
        shiftrepository: ShiftRepository,
        tagrepository: TagRepository,
        commonparametersrepository: CommonParametersRepository,
        uomrepository: UomRepository,
        unavailablerepository: UnavailableRepository,
        userrepository: UserRepository,
        assetdisplaysystemrepository: AssetDisplaySystemRepository,
        dxhdatarepository: DxHDataRepository) {
        this.workcellrepository = workcellrepository;
        this.assetrepository = assetrepository;
        this.dtreasonrepository = dtreasonrepository;
        this.shiftrepository = shiftrepository;
        this.tagrepository = tagrepository;
        this.commonparametersrepository = commonparametersrepository;
        this.uomrepository = uomrepository;
        this.unavailablerepository = unavailablerepository;
        this.userrepository = userrepository;
        this.assetdisplaysystemrepository = assetdisplaysystemrepository;
        this.dxhdatarepository = dxhdatarepository;
    }

    public async importData(req, res: Response) {
        try {
            const file = req.file;
            const arrayItems = JSON.parse(req.body.configurationItems);
            const site_id = JSON.parse(req.body.site_id);
            let mergeQuery = '';

            if (!file) {
                return res.status(400).json({ message: "Bad Request - Missing Excel file to import." });
            }
            if (!arrayItems || !site_id) {
                return res.status(400).json({ message: "Bad Request - Missing data to import." });
            }

            // read from a file
            let workbook = new Excel.Workbook();
            workbook.xlsx.readFile(file.path).then(async () => {
                workbook.eachSheet((worksheet, sheetId) => {
                    arrayItems.forEach((value) => {
                        if (worksheet.name == value.id) {
                            if (!headers[worksheet.name]) return res.status(400).json({ message: "Bad Request - Invalid tab name" + " " + worksheet.name });
                            let columns = headers[worksheet.name];
                            let tableSourcesValues: any[] = [];
                            let parameters = getParametersOfTable(worksheet.name, site_id);
                            mergeQuery = mergeQuery ? mergeQuery + ` MERGE [dbo].[${worksheet.name}] t USING (SELECT ${'s.' + columns.map(e => e.header).join(', s.') + parameters.extraColumns} FROM (VALUES` : ` MERGE [dbo].[${worksheet.name}] t USING (SELECT ${'s.' + columns.map(e => e.header).join(', s.') + parameters.extraColumns} FROM (VALUES`;
                            //Read and get data from each row of the sheet
                            worksheet.eachRow((row, rowNumber) => {
                                let updateRow = '';
                                let validRow = false;
                                columns.forEach((col, colNumber) => {
                                    if (rowNumber === 1) {
                                        if (row.getCell(colNumber + 1).value === 'NULL') return res.status(400).json({ message: "Bad Request - Please review that the all the columns have names" });
                                    } else {
                                        if (row.getCell(colNumber + 1).value !== 'NULL') validRow = true;
                                        updateRow += getValuesFromHeaderTable(headers[worksheet.name], headers[worksheet.name][colNumber], row.getCell(colNumber + 1).value);
                                    }
                                });
                                if (rowNumber !== 1) {
                                    if (!validRow) return res.status(400).json({ message: 'Bad Request - Invalid file format contains a entire empty row. Please check file' });
                                    tableSourcesValues.push('(' + updateRow + ')');
                                }
                            });
                            //create merge sentence with the data extracted from the sheet
                            mergeQuery += tableSourcesValues.join(',') + `) AS S(${columns.map(e => e.header)}) ${parameters.joinSentence}) as s ON (${parameters.matchParameters}) WHEN MATCHED THEN UPDATE SET ${parameters.updateSentence} WHEN NOT MATCHED BY TARGET THEN INSERT ${parameters.insertSentence};`;
                        }
                    });
                });
                console.log(mergeQuery);
                //call execution
                await this.dxhdatarepository.executeGeneralImportQuery(mergeQuery);
                //
                return res.status(200).send('Excel File ' + file.filename + ' Entered Succesfully');
            }).catch((e) => {
                return res.status(500).send({ message: 'Error ' + e.message });
            });
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }
    }

    public async exportData(req: Request, res: Response) {

        let site_id = req.query.site_id;

        res.writeHead(200, {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="Report.xlsx"',
            'Transfer-Encoding': 'chunked'
        });

        let workbook = new Excel.stream.xlsx.WorkbookWriter({ stream: res });
        let results: any[] = [];
        try {
            //create array of results
            results.push({ result: await this.workcellrepository.getWorkcellBySite(site_id), table: 'Workcell' });
            results.push({ result: await this.assetrepository.getAssetBySiteExport(site_id), table: 'Asset' });
            results.push({ result: await this.dtreasonrepository.getDTReasonBySite(site_id), table: 'DTReason' });
            results.push({ result: await this.shiftrepository.getShiftBySiteExport(site_id), table: 'Shift' });
            results.push({ result: await this.tagrepository.getTagBySite(site_id), table: 'Tag' });
            results.push({ result: await this.commonparametersrepository.getCommonParametersBySite(site_id), table: 'CommonParameters' });
            results.push({ result: await this.uomrepository.getUomBySite(site_id), table: 'UOM' });
            results.push({ result: await this.unavailablerepository.getUnavailableBySite(site_id), table: 'Unavailable' });
            results.push({ result: await this.userrepository.findUserBySite(site_id), table: 'TFDUsers' });
            results.push({ result: await this.assetdisplaysystemrepository.getAssetDisplaySystemBySite(site_id), table: 'AssetDisplaySystem' });

            _.forEach(results, response => {
                let worksheet = workbook.addWorksheet(response.table);
                worksheet.columns = headers[response.table];
                _.forEach(response.result, element => {
                    worksheet.addRow(element);
                });
                worksheet.commit();
            });
            workbook.commit();
        } catch (err) {
            res.status(500).send(err.message);
        }

    }

}