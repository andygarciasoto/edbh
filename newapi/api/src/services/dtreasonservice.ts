import { Request, Response } from 'express';
import { DTReasonRepository } from '../repositories/dtreason-repository';
import { AssetRepository } from '../repositories/asset-repository';
import { DxHDataRepository } from '../repositories/dxhdata-repository';
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

    public async getTimelostReasons(req: Request, res: Response) {
        let machine = req.query.mc;
        if (!machine || machine === null || machine === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        if (machine !== 'No Data') {
            let asset: any;
            let timelost: any;
            try {
                asset = await this.assetrepository.getAssetByCode(machine);
                timelost = await this.dtreasonrepository.getTimelostReasons(asset[0].asset_id);
            } catch (err) {
                res.status(500).json({ message: err.message });
                return;
            }
            return res.status(200).json(timelost);
        }
    }

    public async getTimelostDxhData(req: Request, res: Response) {
        let dxh_data_id = req.query.dxh_data_id;
        if (!dxh_data_id || dxh_data_id === null || dxh_data_id === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let dtdata: any;
        try {
            dtdata = await this.dtreasonrepository.getTimelostDxhData(dxh_data_id);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(dtdata);
    }

    public async putDtData(req: Request, res: Response) {
        let dxh_data_id = req.body.dxh_data_id ? parseInt(req.body.dxh_data_id) : undefined;
        const dt_reason_id = req.body.dt_reason_id ? parseInt(req.body.dt_reason_id) : undefined;
        const dt_minutes = req.body.dt_minutes ? parseFloat(req.body.dt_minutes) : undefined;
        const clocknumber = req.body.clocknumber;
        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const timestamp = moment(new Date(req.body.timestamp)).format(this.format);
        const update = req.body.dtdata_id ? parseInt(req.body.dtdata_id) : 0;
        const asset_code = req.body.asset_code ? req.body.asset_code : undefined;
        const row_timestamp = req.body.row_timestamp;

        if (dt_reason_id === undefined || dt_minutes === undefined) {
            return res.status(400).send("Missing parameters");
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
                        await this.dtreasonrepository.putDtDataByClockNumber(dxh_data_id, dt_reason_id, dt_minutes, clocknumber, timestamp, update);
                    } else {
                        await this.dtreasonrepository.putDtDataByName(dxh_data_id, dt_reason_id, dt_minutes, first_name, last_name, timestamp, update);
                    }
                }
            } else {
                if (clocknumber) {
                    await this.dtreasonrepository.putDtDataByClockNumber(dxh_data_id, dt_reason_id, dt_minutes, clocknumber, timestamp, update);
                } else {
                    await this.dtreasonrepository.putDtDataByName(dxh_data_id, dt_reason_id, dt_minutes, first_name, last_name, timestamp, update);
                }
            }
            return res.status(200).send('Message Entered Succesfully');
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    public async putDtDataUpdate(req: Request, res: Response) {
        let dxh_data_id = req.body.dxh_data_id ? parseInt(req.body.dxh_data_id) : undefined;
        const dt_reason_id = req.body.dt_reason_id ? parseInt(req.body.dt_reason_id) : undefined;
        const dt_minutes = req.body.dt_minutes ? parseFloat(req.body.dt_minutes) : undefined;
        const clocknumber = req.body.clocknumber;
        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const timestamp = moment(new Date(req.body.timestamp)).format(this.format);
        const dtdata_id = req.body.dtdata_id ? parseInt(req.body.dtdata_id) : 0;

        if (dxh_data_id === undefined || dt_reason_id === undefined || dt_minutes === undefined || dtdata_id === 0) {
            return res.status(400).send("Missing parameters");
        }
        if (!clocknumber) {
            if (!(first_name || last_name)) {
                return res.status(400).json({ message: "Bad Request - Missing Parameters" });
            }
        }
        try {
            if (clocknumber) {
                await this.dtreasonrepository.putDtDataByClockNumber(dxh_data_id, dt_reason_id, dt_minutes, clocknumber, timestamp, dtdata_id);
            } else {
                await this.dtreasonrepository.putDtDataByName(dxh_data_id, dt_reason_id, dt_minutes, first_name, last_name, timestamp, dtdata_id);
            }
            return res.status(200).send('Message Entered Succesfully');
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
}
