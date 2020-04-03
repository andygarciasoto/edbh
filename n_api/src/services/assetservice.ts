import { Request, Response } from 'express';
import { AssetRepository } from '../repositories/asset-repository';


export class AssetService {

    private readonly assetrepository: AssetRepository;

    public constructor(assetrepository: AssetRepository) {
        this.assetrepository = assetrepository;
    }

    public async getAssetByAssetDisplaySystem(req: Request, res: Response) {
        let display_system_name = req.query.st;
        let assets: any;
        try {
            assets = await this.assetrepository.getAssetByAssetDisplaySystem(display_system_name);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(200).json(assets);
    }

    public async getAssetBySite(req: Request, res: Response) {
        const site = req.query.site;
        if (!site) {
            res.status(400).json({ message: "Bad Request - Missing Parameters" });
            return;
        }
        let assets: any;
        try {
            assets = await this.assetrepository.getAssetBySite(site);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(assets);
    }

    public async getAssetByWorkcell(req: Request, res: Response) {
        let params = req.query;
        if (!params.st == null) {
            params.st = 'Null';
        }
        if (!params.site || params.site == null || params.site == undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let assets: any;
        try {
            assets = await this.assetrepository.getAssetByWorkcell(params.st, params.site);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(assets);
    }

}