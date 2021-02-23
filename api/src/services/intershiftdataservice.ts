import { Request, Response } from 'express';
import { InterShiftDataRepository } from '../repositories/intershiftdata-repository';
import { AssetRepository } from '../repositories/asset-repository';
import { DxHDataRepository } from '../repositories/dxhdata-repository';
import moment from 'moment';

export class InterShiftDataService {

    private readonly intershiftdatarepository: InterShiftDataRepository;
    private readonly assetrepository: AssetRepository;
    private readonly dxhdatarepository: DxHDataRepository;
    private readonly format: string = 'YYYY-MM-DD HH:mm:ss';

    public constructor(intershiftdatarepository: InterShiftDataRepository, assetrepository: AssetRepository, dxhdatarepository: DxHDataRepository) {
        this.intershiftdatarepository = intershiftdatarepository;
        this.assetrepository = assetrepository;
        this.dxhdatarepository = dxhdatarepository;
    }

    public async getInterShiftDataByAssetProdDayShift(req: Request, res: Response) {
        const params = req.query;
        if (params.mc === undefined || params.start_date_time === undefined || params.end_date_time === undefined || params.site_id === undefined) {
            return res.status(400).send("Bad Request - Missing parameters");
        }
        let shifts: any[] = [];
        let asset: any;
        try {
            asset = await this.assetrepository.getAssetByCode(params.mc);
            if (asset[0]) {
                shifts = await this.intershiftdatarepository.getInterShiftDataByAssetProdDayShift(params.site_id, asset[0].asset_id, params.start_date_time, params.end_date_time);
            }
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(200).json(shifts);
    }

    public async putIntershiftData(req: Request, res: Response) {
        const comment = req.body.comment;
        const clocknumber = req.body.clocknumber;
        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const update = req.body.inter_shift_id ? parseInt(req.body.inter_shift_id) : 0;
        const asset_code = req.body.asset_code ? req.body.asset_code : undefined;

        if (comment === undefined || asset_code === undefined) {
            return res.status(400).send("Missing parameters");
        }
        if (!clocknumber) {
            if (!(first_name || last_name)) {
                return res.status(400).json({ message: "Bad Request - Missing Parameters" });
            }
        }

        let asset: any;
        try {
            asset = await this.assetrepository.getAssetByCode(asset_code);
            if (clocknumber) {
                await this.intershiftdatarepository.putInterShiftDataByClocknumber(asset[0].asset_id, comment, clocknumber, update);
            } else {
                await this.intershiftdatarepository.putInterShiftDataByUsername(asset[0].asset_id, comment, first_name, last_name, update);
            }
            return res.status(200).send('Message Entered Succesfully');
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }

    }
}