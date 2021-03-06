import { Request, Response } from 'express';
import { DxHDataRepository } from '../repositories/dxhdata-repository';
import { AssetRepository } from '../repositories/asset-repository';
import { UserRepository } from '../repositories/user-repository';
import * as utils from '../configurations/utils';
import moment from 'moment';

export class DxHDataService {

    private readonly dxhdatarepository: DxHDataRepository;
    private readonly assetrepository: AssetRepository;
    private readonly userrepository: UserRepository;
    private readonly format: string = 'YYYY-MM-DD HH:mm:ss';

    public constructor(dxhdatarepository: DxHDataRepository, assetrepository: AssetRepository, userrepository: UserRepository) {
        this.dxhdatarepository = dxhdatarepository;
        this.assetrepository = assetrepository;
        this.userrepository = userrepository;
    }

    public async getShiftData(req: Request, res: Response) {
        const params = req.query;
        if (params.mc == undefined || params.start_date_time == undefined || params.end_date_time == undefined || params.st == undefined || params.dt == undefined) {
            return res.status(400).send("Missing parameters");
        }
        let date = params.dt;
        params.dt = moment(params.dt, 'YYYYMMDD').format('YYYYMMDD');
        params.start_date_time = moment(new Date(params.start_date_time)).format(this.format);
        params.end_date_time = moment(new Date(params.end_date_time)).format(this.format);
        let data: any[] = [];
        let asset: any;
        try {
            asset = await this.assetrepository.getAssetByCode(params.mc);
            asset = asset[0] || {};
            asset.asset_id = asset.asset_id || null;
            data = await this.dxhdatarepository.getShiftData(asset.asset_id, params.dt, params.start_date_time, params.end_date_time, params.st);
            data = utils.createUnallocatedTime(data, params.hr, date);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(200).json(data);
    }

    public async operatorSignoff(req: Request, res: Response) {
        let dxh_data_id = req.body.dxh_data_id ? parseInt(req.body.dxh_data_id) : undefined;
        const clocknumber = req.body.clocknumber;
        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const timestamp = moment(new Date(req.body.timestamp)).format(this.format);
        const row_timestamp = req.body.row_timestamp;
        const asset_code = req.body.asset_code;

        if (!clocknumber) {
            if (!(first_name || last_name)) {
                return res.status(400).json({ message: "Bad Request - Missing Parameters" });
            }
        }

        let asset: any;
        let dxhData: any;
        try {
            if (dxh_data_id == undefined) {
                if (asset_code === undefined || asset_code === 'No Data') {
                    return res.status(400).json({ message: "Bad Request - Missing asset_code parameter" });
                } else {
                    asset = await this.assetrepository.getAssetByCode(asset_code);
                    dxhData = await this.dxhdatarepository.getDxHDataId(asset[0].asset_id, row_timestamp);
                    dxh_data_id = dxhData[0].dxhdata_id;
                    if (clocknumber) {
                        await this.dxhdatarepository.putOperatorSignOffByClocknumber(dxh_data_id, clocknumber, timestamp);
                    } else {
                        await this.dxhdatarepository.putOperatorSignOffByUsername(dxh_data_id, first_name, last_name, timestamp);
                    }
                }
            } else {
                if (clocknumber) {
                    await this.dxhdatarepository.putOperatorSignOffByClocknumber(dxh_data_id, clocknumber, timestamp);
                } else {
                    await this.dxhdatarepository.putOperatorSignOffByUsername(dxh_data_id, first_name, last_name, timestamp);
                }
            }
            return res.status(200).send('Message Entered Succesfully');
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }

    }

    public async supervisorSignoff(req: Request, res: Response) {
        let dxh_data_id = req.body.dxh_data_id ? parseInt(req.body.dxh_data_id) : undefined;
        const clocknumber = req.body.clocknumber;
        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const timestamp = moment(new Date(req.body.timestamp)).format(this.format);
        const row_timestamp = req.body.row_timestamp;
        const asset_code = req.body.asset_code;

        if (!clocknumber || clocknumber === null || clocknumber === undefined || clocknumber === '') {
            if (!first_name || !last_name || first_name === undefined || last_name === undefined) {
                return res.status(400).json({ message: "Bad Request - Missing Parameters" });
            }
        }

        if (asset_code === undefined || asset_code === 'No Data') {
            return res.status(400).json({ message: "Bad Request - Missing asset_code parameter" });
        }

        let user: any;
        let asset: any;
        let dxhData: any;
        try {
            asset = await this.assetrepository.getAssetByCode(asset_code);
            user = await this.userrepository.findUserInformation(clocknumber, '', asset[0].asset_id, 0);
            if (dxh_data_id == undefined) {
                dxhData = await this.dxhdatarepository.getDxHDataId(asset[0].asset_id, row_timestamp);
                dxh_data_id = dxhData[0].dxhdata_id;
                if (clocknumber) {
                    await this.dxhdatarepository.putSupervisorSignOffByClocknumber(dxh_data_id, clocknumber, timestamp);
                } else {
                    await this.dxhdatarepository.putSupervisorSignOffByUsername(dxh_data_id, first_name, last_name, timestamp);
                }
            } else {
                if (clocknumber) {
                    await this.dxhdatarepository.putSupervisorSignOffByClocknumber(dxh_data_id, clocknumber, timestamp);
                } else {
                    await this.dxhdatarepository.putSupervisorSignOffByUsername(dxh_data_id, first_name, last_name, timestamp);
                }
            }
            return res.status(200).send('Message Entered Succesfully');
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }

    }

}