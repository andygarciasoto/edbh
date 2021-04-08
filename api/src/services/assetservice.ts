import { Request, Response } from 'express';
import { AssetRepository } from '../repositories/asset-repository';


export class AssetService {

    private readonly assetrepository: AssetRepository;

    public constructor(assetrepository: AssetRepository) {
        this.assetrepository = assetrepository;
    }

    public async getAssetByAssetDisplaySystem(req: Request, res: Response) {
        if (!req.query.st || req.query.st === undefined || req.query.st === null) {
            res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
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
        const level = req.query.level ? req.query.level : 'Cell';
        const automation_level = req.query.automation_level ? req.query.automation_level : 'All';
        if (!site) {
            res.status(400).json({ message: "Bad Request - Missing Parameters" });
            return;
        }
        let assets: any;
        try {
            assets = await this.assetrepository.getAssetBySite(site, level, automation_level);
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
        if (!params.site || params.site === null || params.site === undefined) {
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

    public async getAssetBySiteExport(req: Request, res: Response) {
        const site = req.query.site;
        if (!site) {
            res.status(400).json({ message: "Bad Request - Missing Parameters" });
            return;
        }
        let assets: any;
        try {
            assets = await this.assetrepository.getAssetBySiteExport(site);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(assets);
    }
    public async putAsset(req: Request, res: Response) {
        const asset_code = req.body.asset_code ? req.body.asset_code : undefined;
        const asset_id = req.body.asset_id ? req.body.asset_id : null;
        const asset_name = req.body.asset_name ? req.body.asset_name : undefined;
        const asset_description = req.body.asset_description ? req.body.asset_description : null;
        const asset_level = req.body.asset_level ? req.body.asset_level : undefined;
        const site_code = req.body.site_code ? req.body.site_code : undefined;
        const parent_asset_code = req.body.parent_asset_code ? req.body.parent_asset_code : undefined;
        const automation_level = req.body.automation_level ? req.body.automation_level : 'Automated';
        const include_in_escalation = req.body.include_in_escalation ? req.body.include_in_escalation : 0;
        const grouping1 = req.body.grouping1 ? req.body.grouping1 : null;
        const grouping2 = req.body.grouping2 ? req.body.grouping2 : null;
        const grouping3 = req.body.grouping3 ? req.body.grouping3 : null;
        const grouping4 = req.body.grouping4 ? req.body.grouping4 : null;
        const grouping5 = req.body.grouping5 ? req.body.grouping5 : null;
        const status = req.body.status ? req.body.status : 'Active';
        const target_percent_of_ideal = req.body.target_percent_of_ideal ? req.body.target_percent_of_ideal : null;
        const is_multiple = req.body.is_multiple ? req.body.is_multiple : 0;

        if (asset_code === undefined || asset_name === undefined || asset_level === undefined || site_code === undefined || parent_asset_code === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let asset: any;
        try {
            asset = await this.assetrepository.putAsset(asset_id, asset_code, asset_name, asset_description, asset_level, site_code, parent_asset_code, automation_level, include_in_escalation, grouping1, grouping2, grouping3, grouping4, grouping5, status, target_percent_of_ideal, is_multiple);;
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).send('Message Entered Succesfully');
    }
}