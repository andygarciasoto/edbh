import { Request, Response } from 'express';
import { AssetRepository } from '../repositories/asset-repository';
import { ShiftRepository } from '../repositories/shift-repository';
import { UomRepository } from '../repositories/uom-repository';
import { SiteRepository } from '../repositories/site-repository';
import { EscalationRepository } from '../repositories/escalation-repository';
import { WorkcellRepository } from '../repositories/workcell-repository';
import { headers, getParametersOfTable, getValuesFromHeaderTable } from '../configurations/datatoolutils';
import _ from 'lodash';

export class SiteService {

    private readonly assetrepository: AssetRepository;
    private readonly shiftsrepository: ShiftRepository;
    private readonly uomrepository: UomRepository;
    private readonly siterepository: SiteRepository;
    private readonly escalationrepository: EscalationRepository;
    private readonly workcellrepository: WorkcellRepository;

    public constructor(assetRepository: AssetRepository, shiftsRepository: ShiftRepository, uomRepository: UomRepository,
        siteRepository: SiteRepository, escalationRepository: EscalationRepository, workcellRepository: WorkcellRepository) {
        this.assetrepository = assetRepository;
        this.shiftsrepository = shiftsRepository;
        this.uomrepository = uomRepository;
        this.siterepository = siteRepository;
        this.escalationrepository = escalationRepository;
        this.workcellrepository = workcellRepository;
    }

    public async loadSiteConfiguration(req: Request, res: Response) {
        let site_id = req.query.site_id;
        let station = req.query.station;
        if (!site_id) {
            return res.status(400).json({ message: 'Bad Request - Missing Site id Parameter' });
        }

        let siteInformation = { dsystems: [], shifts: [], site_assets: [], machines: [], uoms: [], workcell: [], assets_workcell: [], escalations: [] };

        try {
            if (station) {
                siteInformation.dsystems = await this.assetrepository.getAssetByAssetDisplaySystem(station);
            }

            siteInformation.shifts = await this.shiftsrepository.getShiftBySite(site_id);
            siteInformation.site_assets = await this.assetrepository.getAssetBySite(site_id, 'All', 'All');
            siteInformation.machines = _.filter(siteInformation.site_assets, { asset_level: 'Cell' });
            siteInformation.uoms = await this.uomrepository.getUomBySite(site_id);
            siteInformation.workcell = await this.workcellrepository.getWorkcellBySite(site_id);
            siteInformation.assets_workcell = await this.assetrepository.getAssetByWorkcell(station || 'Null', site_id);
            siteInformation.escalations = await this.escalationrepository.getEscalationBySite(site_id);

        } catch (ex) {
            return res.status(500).json({ message: ex.message });
        }
        return res.status(200).json(siteInformation);
    }

    public async getRowsBySite(req: Request, res: Response) {
        let params = req.query;
        if (!params.site_id || params.site_id === null || params.site_id === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let rows: any;
        try {
            rows = await this.siterepository.getRowsBySite(params.site_id);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(rows);
    }
    public async getParkerSites(req: Request, res: Response) {
        let sites: any;
        try {
            sites = await this.siterepository.getParkerSites();
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(sites);
    }

    public async dragAndDropAdminTool(req, res: Response) {
        console.log("entro");
        const site_id = req.body.site_id ? req.body.site_id : undefined;
        const table = req.body.table ? req.body.table : undefined
        const data = req.body.data ? req.body.data : null;

        if (!site_id || site_id === undefined || site_id === null || table === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing data to proceed" });
        }

        console.log(data);
        //         const parameters = getParametersOfTable(table, site_id);
        //         let queries = [];
        //         arrayItems.forEach((value) => {
        //             const startMergeQuery = `MERGE [dbo].[${table}] t USING (SELECT ${'s.' + columns.map(e => e.header).join(', s.') + parameters.extraColumns} FROM (VALUES`;
        //             const endMergeQuery = `) AS S(${columns.map(e => e.header)}) ${parameters.joinSentence}) as s ON (${parameters.matchParameters}) WHEN MATCHED THEN UPDATE SET ${parameters.updateSentence} WHEN NOT MATCHED BY TARGET THEN INSERT ${parameters.insertSentence};`;
        //             const initialLength = startMergeQuery.length + endMergeQuery.length;
        //             const rowCount = worksheet.rowCount;

        //             //Initialize query to store the values of the merge sentence
        //             let valuesMergeQuery = '';

        //             worksheet.eachRow((row, rowNumber) => {
        //                 let updateRow = (valuesMergeQuery.length !== 0 ? ',' : '') + '(';
        //                 let validRow = false;
        //                 columns.forEach((col, colNumber) => {
        //                     if (rowNumber === 1) {
        //                         if (row.getCell(colNumber + 1).value === 'NULL') return res.status(400).json({ message: "Bad Request - Please review that the all the columns have names" });
        //                     } else {
        //                         if (row.getCell(colNumber + 1).value !== 'NULL') validRow = true;

        //                         updateRow += getValuesFromHeaderTable(headers[worksheet.name], headers[worksheet.name][colNumber], row.getCell(colNumber + 1).value);
        //                     }
        //                 });
        //                 updateRow += ')';
        //                 if (rowNumber !== 1) {
        //                     if (!validRow) return res.status(400).json({ message: 'Bad Request - Invalid file format contains a entire empty row. Please check file' });

        //                     const newLength = valuesMergeQuery.length + updateRow.length + initialLength;
        //                     if (newLength < 4000 && rowNumber < rowCount) {
        //                         valuesMergeQuery += updateRow;
        //                     } else {
        //                         if (newLength >= 4000) {
        //                             queries.push(startMergeQuery + valuesMergeQuery + endMergeQuery);
        //                             valuesMergeQuery = updateRow.slice(1);
        //                         }
        //                         if (newLength < 4000) {
        //                             valuesMergeQuery += updateRow;
        //                         }
        //                         if (rowNumber === rowCount) {
        //                             queries.push(startMergeQuery + valuesMergeQuery + endMergeQuery);
        //                         }
        //                     }
        //                 }
        //             });
        //         }
        //                 });
        // });
        // //call execution
        // if (!_.isEmpty(queries)) {
        //     const queriesLength = queries.length;
        //     console.log('Queries execution begin');
        //     console.log('Queries to execute: ', queriesLength);
        //     _.forEach(queries, async (query, index) => {
        //         try {
        //             await this.dxhdatarepository.executeGeneralImportQuery(query);
        //         } catch (e) {
        //             return res.status(500).send({ message: 'Error ' + e.message });
        //         }
        //         if ((queriesLength - 1) === index) {
        //             console.log('Queries execution end');
        //             console.log('Queries count: ', queriesLength);
        //             return res.status(200).send('Excel File ' + file.filename + ' Entered Succesfully');
        //         }
        //     });
        // } else {
        //     return res.status(200).send('Excel File ' + file.filename + ' Entered Succesfully');
        // }
        //         }).catch ((e) => {
        //     return res.status(500).send({ message: 'Error ' + e.message });
        // });
    }
}