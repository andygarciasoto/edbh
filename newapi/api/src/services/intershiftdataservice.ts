import { Request, Response } from 'express';
import { InterShiftDataRepository } from '../repositories/intershiftdata-repository';
import { AssetRepository } from '../repositories/asset-repository';
import moment from 'moment';

export class InterShiftDataService {

    private readonly intershiftdatarepository: InterShiftDataRepository;
    private readonly assetrepository: AssetRepository;

    public constructor(intershiftdatarepository: InterShiftDataRepository, assetrepository: AssetRepository) {
        this.intershiftdatarepository = intershiftdatarepository;
        this.assetrepository = assetrepository;
    }

    public async getInterShiftDataByAssetProdDayShift(req: Request, res: Response) {
        const asset_code = req.query.mc;
        const production_day = moment(new Date(req.query.dt)).format('YYYY-MM-DD');
        const shift_id = req.query.sf;
        if (asset_code === undefined || production_day === undefined || shift_id === undefined) {
            return res.status(400).send("Bad Request - Missing parameters");
        }
        let shifts: any;
        let asset: any;
        try {
            asset = await this.assetrepository.getAssetByCode(asset_code);
            shifts = await this.intershiftdatarepository.getInterShiftDataByAssetProdDayShift(asset[0].asset_id, production_day, shift_id);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(shifts);
    }

    public async putIntershiftData(req: Request, res: Response) {

    }

}