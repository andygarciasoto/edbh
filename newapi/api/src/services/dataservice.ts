import { Request, Response } from 'express';
import { DataRepository } from '../repositories/data-repository';
import moment from 'moment';
import { AssetRepository } from '../repositories/asset-repository';
import * as utils from '../configurations/utils';

export class DataService {

    private readonly datarepository: DataRepository;
    private readonly assetrepository: AssetRepository;

    public constructor(datarepository: DataRepository, assetrepository: AssetRepository) {
        this.datarepository = datarepository;
        this.assetrepository = assetrepository;
    }

    public async getShiftData(req: Request, res: Response) {
        const params = req.query;
        if (params.dt == undefined || params.mc == undefined || params.hr == undefined || params.sf == undefined || params.st == undefined) {
            return res.status(400).send("Missing parameters");
        }
        var date = params.dt;
        params.dt = moment(params.dt, 'YYYYMMDD').format('YYYYMMDD');
        let data: any;
        let asset: any;
        try {
            asset = await this.assetrepository.GetAssetByCode(params.mc);
            data = await this.datarepository.getShiftData(asset[0].asset_id, params.dt, params.sf, params.st);
            data = utils.createUnallocatedTime2(data, params.hr, date);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(data);
    }

}