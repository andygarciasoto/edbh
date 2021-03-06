import { Request, Response } from 'express';
import { DTReasonRepository } from '../repositories/dtreason-repository';
import { AssetRepository } from '../repositories/asset-repository';
import { DxHDataRepository } from '../repositories/dxhdata-repository';
import { getReasonParameters } from '../validators/reasonValidator';
import moment from 'moment';

export class DTReasonService {
    private readonly dtreasonrepository: DTReasonRepository;
    private readonly assetrepository: AssetRepository;
    private readonly dxhdatarepository: DxHDataRepository;
    private readonly format: string = 'YYYY-MM-DD HH:mm:ss';

    public constructor(dtreasonrepository: DTReasonRepository, assetrepository: AssetRepository, dxhdatarepository: DxHDataRepository) {
        this.dtreasonrepository = dtreasonrepository;
        this.assetrepository = assetrepository;
        this.dxhdatarepository = dxhdatarepository;
    }

    public async getReasons(req: Request, res: Response) {
        let machine = req.query.mc;
        let type = req.query.type;
        if (!machine || machine === null || machine === undefined || !type) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        if (machine !== 'No Data') {
            let asset: any;
            let reasons: any;
            try {
                asset = await this.assetrepository.getAssetByCode(machine);
                reasons = await this.dtreasonrepository.getReasons(asset[0].asset_id, type);
            } catch (err) {
                res.status(500).json({ message: err.message });
                return;
            }
            return res.status(200).json(reasons);
        }
    }

    public async getDxhData(req: Request, res: Response) {
        let dxh_data_id = req.query.dxh_data_id;
        let productiondata_id = req.query.productiondata_id ? req.query.productiondata_id : null;
        let type = req.query.type;
        if (!dxh_data_id || dxh_data_id === null || dxh_data_id === undefined || !type) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let dtdata: any;
        try {
            dtdata = await this.dtreasonrepository.getDxhData(dxh_data_id, productiondata_id, type);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(dtdata);
    }
    public async getAssetsReasonCode(req: Request, res: Response) {
        let site_id = req.query.site_id;
        let dtreason_code = req.query.dtreason_code;
        let dtreason_name = req.query.dtreason_name;
        let dtreason_description = req.query.dtreason_description ? `N'${req.query.dtreason_description}'` : `N''`;
        let dtreason_category = req.query.dtreason_category;
        let reason1 = req.query.reason1 ? `N'${req.query.reason1}'` : `N''`;
        let reason2 = req.query.reason2 ? `N'${req.query.reason2}'` : `N''`;
        let status = req.query.status;
        let type = req.query.type;
        let level = req.query.level ? `N'${req.query.level}'` : `N''`;

        if (!site_id || !dtreason_code || !dtreason_name || !status || !type) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let unavailable: any;
        try {
            unavailable = await this.dtreasonrepository.getAssetsReasonCode(site_id, dtreason_code, dtreason_name, dtreason_description, dtreason_category, reason1, reason2,
                status, type, level);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(unavailable);
    }
    public async putDtData(req: Request, res: Response) {
        let dxh_data_id = req.body.dxh_data_id ? parseInt(req.body.dxh_data_id) : undefined;
        let productiondata_id = req.body.productiondata_id ? parseInt(req.body.productiondata_id) : null;
        let dt_reason_id = req.body.dt_reason_id ? parseInt(req.body.dt_reason_id) : undefined;
        const dt_minutes = req.body.dt_minutes ? parseFloat(req.body.dt_minutes) : null;
        const clocknumber = req.body.clocknumber;
        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const timestamp = moment(new Date(req.body.timestamp)).format(this.format);
        const update = req.body.dtdata_id ? parseInt(req.body.dtdata_id) : 0;
        const asset_code = req.body.asset_code ? req.body.asset_code : undefined;
        const row_timestamp = req.body.row_timestamp;
        const quantity = req.body.quantity ? req.body.quantity : null;
        const responsible = req.body.responsible ? req.body.responsible : null;

        if (dt_reason_id === undefined) {
            return res.status(400).send("Bad Request - Missing Parameters");
        }
        if (!clocknumber) {
            if (!(first_name || last_name)) {
                return res.status(400).json({ message: "Bad Request - Missing Parameters" });
            }
        }
        let asset: any;
        let dxhData: any;
        try {
            if (dxh_data_id === undefined) {
                if (asset_code === undefined) {
                    return res.status(400).json({ message: "Bad Request - Missing asset_code parameter" });
                } else {
                    asset = await this.assetrepository.getAssetByCode(asset_code);
                    dxhData = await this.dxhdatarepository.getDxHDataId(asset[0].asset_id, row_timestamp);
                    dxh_data_id = dxhData[0].dxhdata_id;
                    if (clocknumber) {
                        await this.dtreasonrepository.putDtDataByClockNumber(dxh_data_id, productiondata_id, dt_reason_id, dt_minutes, quantity, responsible, clocknumber, timestamp, update);
                    } else {
                        await this.dtreasonrepository.putDtDataByName(dxh_data_id, productiondata_id, dt_reason_id, dt_minutes, quantity, responsible, first_name, last_name, timestamp, update);
                    }
                }
            } else {
                if (clocknumber) {
                    await this.dtreasonrepository.putDtDataByClockNumber(dxh_data_id, productiondata_id, dt_reason_id, dt_minutes, quantity, responsible, clocknumber, timestamp, update);
                } else {
                    await this.dtreasonrepository.putDtDataByName(dxh_data_id, productiondata_id, dt_reason_id, dt_minutes, quantity, responsible, first_name, last_name, timestamp, update);
                }
            }
            return res.status(200).send('Message Entered Succesfully');
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    public async putDtDataUpdate(req: Request, res: Response) {
        let dxh_data_id = req.body.dxh_data_id ? parseInt(req.body.dxh_data_id) : undefined;
        let productiondata_id = req.body.dxh_data_id ? parseInt(req.body.dxh_data_id) : null;
        const dt_reason_id = req.body.dt_reason_id ? parseInt(req.body.dt_reason_id) : undefined;
        const dt_minutes = req.body.dt_minutes ? parseFloat(req.body.dt_minutes) : null;
        const clocknumber = req.body.clocknumber;
        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const timestamp = moment(new Date(req.body.timestamp)).format(this.format);
        const dtdata_id = req.body.dtdata_id ? parseInt(req.body.dtdata_id) : undefined;
        const quantity = req.body.quantity ? req.body.quantity : null;
        const responsible = req.body.responsible ? req.body.responsible : null;

        if (dxh_data_id === undefined || dt_reason_id === undefined || dtdata_id === undefined) {
            return res.status(400).send("Missing parameters");
        }
        if (!clocknumber) {
            if (!(first_name || last_name)) {
                return res.status(400).json({ message: "Bad Request - Missing Parameters" });
            }
        }
        try {
            if (clocknumber) {
                await this.dtreasonrepository.putDtDataByClockNumber(dxh_data_id, productiondata_id, dt_reason_id, dt_minutes, quantity, responsible, clocknumber, timestamp, dtdata_id);
            } else {
                await this.dtreasonrepository.putDtDataByName(dxh_data_id, productiondata_id, dt_reason_id, dt_minutes, quantity, responsible, first_name, last_name, timestamp, dtdata_id);
            }
            return res.status(200).send('Message Entered Succesfully');
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    public async getUniqueReasonBySite(req: Request, res: Response) {
        let site = req.query.site;
        let asset_id = req.query.asset_id ? req.query.asset_id : undefined;
        if (!site || site === null || site === undefined || asset_id === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let reasons: any;
        try {
            reasons = await this.dtreasonrepository.getUniqueReasonBySite(site, asset_id);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(reasons);
    }

    public async getReasonsBySite(req: Request, res: Response) {
        let site = req.query.site;
        let dtreason_id = req.query.dtreason_id ? req.query.dtreason_id : null;
        if (!site || site === null || site === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let reasons: any;
        try {
            if (!dtreason_id) {
                reasons = await this.dtreasonrepository.getDTReasonBySite(site);
            } else {
                reasons = await this.dtreasonrepository.getDTReasonById(site, dtreason_id);
            }
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(reasons);
    }

    public async getReasonsByFilter(req: Request, res: Response) {
        let site_id = req.query.site_id;
        if (!site_id || site_id === null || site_id === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let reasons: any;
        try {
            reasons = await this.dtreasonrepository.findReasonByFilter(getReasonParameters(req.query));
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(reasons);
    }
}

