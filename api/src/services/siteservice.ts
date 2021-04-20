import { Request, Response } from 'express';
import { AssetRepository } from '../repositories/asset-repository';
import { ShiftRepository } from '../repositories/shift-repository';
import { UomRepository } from '../repositories/uom-repository';
import { SiteRepository } from '../repositories/site-repository';
import { EscalationRepository } from '../repositories/escalation-repository';
import { WorkcellRepository } from '../repositories/workcell-repository';
import { DxHDataRepository } from '../repositories/dxhdata-repository';
import { headers, getParametersOfTable, getValuesFromHeaderTable, getColumns } from '../configurations/datatoolutils';
import { getWorkcellParameters } from '../validators/workcellValidator';
import { getUOMParameters } from '../validators/uomValidator';
import _ from 'lodash';

export class SiteService {

    private readonly assetrepository: AssetRepository;
    private readonly shiftsrepository: ShiftRepository;
    private readonly uomrepository: UomRepository;
    private readonly siterepository: SiteRepository;
    private readonly escalationrepository: EscalationRepository;
    private readonly workcellrepository: WorkcellRepository;
    private readonly dxhdatarepository: DxHDataRepository;

    public constructor(assetRepository: AssetRepository, shiftsRepository: ShiftRepository, uomRepository: UomRepository,
        siteRepository: SiteRepository, escalationRepository: EscalationRepository, workcellRepository: WorkcellRepository,
        dxhdataRepository: DxHDataRepository) {
        this.assetrepository = assetRepository;
        this.shiftsrepository = shiftsRepository;
        this.uomrepository = uomRepository;
        this.siterepository = siteRepository;
        this.escalationrepository = escalationRepository;
        this.workcellrepository = workcellRepository;
        this.dxhdatarepository = dxhdataRepository;
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
            siteInformation.uoms = await this.uomrepository.findUomByFilter(getUOMParameters(req.query));
            siteInformation.workcell = await this.workcellrepository.findWorkByFilter(getWorkcellParameters(req.query));
            siteInformation.assets_workcell = await this.assetrepository.getAssetByWorkcell(station || 'Null', site_id);
            siteInformation.escalations = await this.escalationrepository.getEscalationBySite(site_id);

        } catch (ex) {
            console.log(ex);
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
        const site_id = req.body.site_id ? req.body.site_id : undefined;
        const table = req.body.table ? req.body.table : undefined
        const data = req.body.data ? req.body.data : null;

        if (!site_id || site_id === undefined || site_id === null || table === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing data to proceed" });
        }

        let queries = [];
        const columns = getColumns(table);
        const parameters = getParametersOfTable(table, site_id);
        const startMergeQuery = `MERGE [dbo].[${table}] t USING (SELECT ${'s.' + columns.map(e => e).join(', s.') + parameters.extraColumns} FROM (VALUES`;
        const endMergeQuery = `) AS S(${columns.map(e => e)}) ${parameters.joinSentence}) as s ON (${parameters.matchParameters}) WHEN MATCHED THEN UPDATE SET ${parameters.updateSentence} WHEN NOT MATCHED BY TARGET THEN INSERT ${parameters.insertSentence};`;
        //Initialize query to store the values of the merge sentence
        let valuesMergeQuery = '';
        try {
            _.forEach(data, item => {
                const tableHeaders = headers[table];
                let updateRow = (valuesMergeQuery.length !== 0 ? ',' : '') + '(';
                _.forEach(tableHeaders, header => {
                    updateRow += getValuesFromHeaderTable(tableHeaders, header, item[header.key]);
                });
                updateRow += ')';
                valuesMergeQuery += updateRow;
            });
            queries.push(startMergeQuery + valuesMergeQuery + endMergeQuery);
            //console.log(queries);
            const queriesLength = queries.length;
            _.forEach(queries, async (query, index) => {
                try {
                    await this.dxhdatarepository.executeGeneralImportQuery(query);
                } catch (e) {
                    return res.status(500).send({ message: 'Error ' + e.message });
                }
                if ((queriesLength - 1) === index) {
                    console.log('Queries execution end');
                    console.log('Queries count: ', queriesLength);
                    return res.status(200).send('Queries Entered Succesfully');
                }
            });
        } catch (e) {
            return res.status(500).send({ message: 'Error ' + e.message });
        }
    }
}