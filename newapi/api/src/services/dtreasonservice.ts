import { Request, Response } from 'express';
import { DTReasonRepository } from '../repositories/dtreason-repository';
import { AssetRepository } from '../repositories/asset-repository';

export class DTReasonService {
    private readonly dtreasonrepository: DTReasonRepository;
    private readonly assetrepository: AssetRepository;

    public constructor(dtreasonrepository: DTReasonRepository, assetrepository: AssetRepository) {
        this.dtreasonrepository = dtreasonrepository;
        this.assetrepository = assetrepository;
    }

    public async getTimelostReasons(req: Request, res: Response) {
        let machine = req.query.mc;
        if (!machine || machine == null || machine == undefined) {
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
        if (!dxh_data_id || dxh_data_id == null || dxh_data_id == undefined) {
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
}



