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
        if (params.dt == undefined || params.mc == undefined || params.hr == undefined || params.sf == undefined || params.st == undefined) {
            return res.status(400).send("Missing parameters");
        }
        let date = params.dt;
        params.dt = moment(params.dt, 'YYYYMMDD').format('YYYYMMDD');
        let data: any;
        let asset: any;
        try {
            asset = await this.assetrepository.getAssetByCode(params.mc);
            data = await this.dxhdatarepository.getShiftData(asset[0].asset_id, params.dt, params.sf, params.st);
            data = utils.createUnallocatedTime2(data, params.hr, date);
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

        if (!clocknumber) {
            if (!(first_name || !last_name)) {
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
            user = await this.userrepository.findUserByBadgeAndAsset(clocknumber, asset_code);
            const role = user[0].role;
            if (role === 'Supervisor') {
                if (dxh_data_id == undefined) {
                    asset = await this.assetrepository.getAssetByCode(asset_code);
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
            } else {
                return res.status(400).json({ message: "Bad Request - Unauthorized Role to SignOff" });
            }
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }

    }

}