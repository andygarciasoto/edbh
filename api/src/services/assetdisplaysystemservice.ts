import { Request, Response } from 'express';
import { AssetDisplaySystemRepository } from '../repositories/assetdisplaysystem-repository';

export class AssetDisplaySystemService {
    private readonly assetdisplaysystemrepository : AssetDisplaySystemRepository;

    public constructor(assetdisplaysystemrepository: AssetDisplaySystemRepository) {
        this.assetdisplaysystemrepository = assetdisplaysystemrepository;
    }

    public async getAssetDisplayBySite(req: Request, res: Response) {
        let site = req.query.site;
        if (!site || site === null || site === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let assetdisplay: any;
        try {
            assetdisplay = await this.assetdisplaysystemrepository.getAssetDisplaySystemBySite(site);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(assetdisplay);
    }
    public async putAssetDisplaySystem(req: Request, res: Response) {
        const assetdisplaysystem_id = req.body.assetdisplaysystem_id ? req.body.assetdisplaysystem_id : null;
        const asset_id = req.body.asset_id ? req.body.asset_id : undefined;
        const displaysystem_name = req.body.displaysystem_name ? req.body.displaysystem_name : undefined;
        const status = req.body.status ? req.body.status : 'Active';
        const site_id = req.body.site_id ? req.body.site_id : undefined;

        if (asset_id === undefined || displaysystem_name === undefined || site_id === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let assetdisplaysystem: any;
        try {
            assetdisplaysystem = await this.assetdisplaysystemrepository.putAssetDisplaySystem(assetdisplaysystem_id, asset_id, displaysystem_name, site_id, status);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).send('Message Entered Succesfully');
    }
}

