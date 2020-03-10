import { Request, Response } from 'express';
import { UomRepository } from '../repositories/uom-repository';
import { AssetRepository } from '../repositories/asset-repository';

export class UomService {

    private readonly uomrepository: UomRepository;
    private readonly assetrepository: AssetRepository;

    public constructor(uomrepository: UomRepository, assetrepository: AssetRepository) {
        this.uomrepository = uomrepository;
        this.assetrepository = assetrepository;
    }

    public async getUomBySite(req: Request, res: Response) {
        let site = req.query.site;
        if (!site) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let uoms: any;
        try {
            uoms = await this.uomrepository.getUomBySite(site);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(uoms);
    }

    public async getUomByAsset(req: Request, res: Response) {
        let params = req.query;
        if (!params.mc) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let uoms: any;
        let asset: any;
        try {
            asset = await this.assetrepository.getAssetByCode(params.mc);
            uoms = await this.uomrepository.getUomByAsset(asset[0].asset_id);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(uoms);
    }

}