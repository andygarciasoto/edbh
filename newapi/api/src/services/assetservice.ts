import { Request, Response } from 'express';
import { AssetRepository } from '../repositories/asset-repository';


export class AssetService {

    private readonly assetrepository: AssetRepository;

    public constructor(assetrepository: AssetRepository) {
        this.assetrepository = assetrepository;
    }

    public async GetAssetByAssetDisplaySystem(req: Request, res: Response) {
        let display_system_name = req.query.st;
        if (!display_system_name || display_system_name == 'null') {
            // return res.status(400).json({ message: "Bad Request - Missing Parameters" });
            display_system_name = 'CR2080435W1';
        }
        let assets: any;
        try {
            assets = await this.assetrepository.GetAssetByAssetDisplaySystem(display_system_name);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(assets);
    }

    public async GetAssetBySite(req: Request, res: Response) {
        const site = req.query.site;
        if (!site) {
            res.status(400).json({ message: "Bad Request - Missing Parameters" });
            return;
        }
        let assets: any;
        try {
            assets = await this.assetrepository.GetAssetBySite(site);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(assets);
    }

    public async GetAssetByWorkcell(req: Request, res: Response) {
        let params = req.query;
        if (!params.st == null) {
            params.st = 'Null';
        }
        if (!params.site || params.site == null || params.site == undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let assets: any;
        try {
            assets = await this.assetrepository.GetAssetByWorkcell(params.st, params.site);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(assets);
    }

}