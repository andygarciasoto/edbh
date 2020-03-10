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
            return res.status(500).json({ message: err.message });
        }
        return res.status(200).json(shifts);
    }

    public async putIntershiftData(req: Request, res: Response) {
        let dxh_data_id = req.body.dxh_data_id ? parseInt(req.body.dxh_data_id) : undefined;
        const comment = req.body.comment;
        const clocknumber = req.body.clocknumber;
        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const timestamp = moment(new Date(req.body.timestamp)).format(this.format);
        const update = req.body.inter_shift_id ? parseInt(req.body.inter_shift_id) : 0;
        const asset_code = req.body.asset_code ? req.body.asset_code : undefined;
        const row_timestamp = req.body.row_timestamp;

        if (comment === undefined) {
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
                        await this.intershiftdatarepository.putInterShiftDataByClocknumber(dxh_data_id, comment, clocknumber, timestamp, update);
                    } else {
                        await this.intershiftdatarepository.putInterShiftDataByUsername(dxh_data_id, comment, first_name, last_name, timestamp, update);
                    }
                }
            } else {
                if (clocknumber) {
                    await this.intershiftdatarepository.putInterShiftDataByClocknumber(dxh_data_id, comment, clocknumber, timestamp, update);
                } else {
                    await this.intershiftdatarepository.putInterShiftDataByUsername(dxh_data_id, comment, first_name, last_name, timestamp, update);
                }
            }
            return res.status(200).send('Message Entered Succesfully');
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }

    }
}