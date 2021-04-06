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
        let uoms: any[] = [];
        let asset: any;
        try {
            asset = await this.assetrepository.getAssetByCode(params.mc);
            if (asset[0]) {
                uoms = await this.uomrepository.getUomByAsset(asset[0].asset_id);
            }
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(200).json(uoms);
    }

    public async putUOM(req: Request, res: Response) {
        const uom_id = req.body.uom_id ? req.body.uom_id : null;
        const uom_code = req.body.uom_code ? req.body.uom_code : undefined;
        const uom_name = req.body.uom_name ? req.body.uom_name : undefined;
        const uom_description = req.body.uom_description ? req.body.uom_description : null;
        const status = req.body.status ? req.body.status : 'Active';
        const site_id = req.body.site_id ? req.body.site_id : undefined;
        const decimals = req.body.decimals ? req.body.decimals : 0;

        if (uom_code === undefined || uom_name === undefined || site_id === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let uom: any;
        try {
            uom = await this.uomrepository.putUOM(uom_id, uom_code, uom_name, uom_description, status, site_id, decimals);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).send('Message Entered Succesfully');
    }

}