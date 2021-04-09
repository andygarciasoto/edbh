import { Request, Response } from 'express';
import { UnavailableRepository } from '../repositories/unavailable-repository';

export class UnavailableService {
    private readonly unavailablerepository: UnavailableRepository;

    public constructor(unavailablerepository: UnavailableRepository) {
        this.unavailablerepository = unavailablerepository;
    }

    public async getUniqueUnavailableBySite(req: Request, res: Response) {
        let site = req.query.site;
        let asset_id = req.query.asset_id ? req.query.asset_id : undefined;
        if (!site || site === null || site === undefined || asset_id === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let unavailable: any;
        try {
            unavailable = await this.unavailablerepository.getUniqueUnavailableBySite(site, asset_id);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(unavailable);
    }
    public async getUnavailableBySite(req: Request, res: Response) {
        let site = req.query.site;
        let unavailable_id = req.query.unavailable_id ? req.query.unavailable_id : null;
        if (!site || site === null || site === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let unavailable: any;
        try {
            if (!unavailable_id) {
                unavailable = await this.unavailablerepository.getUnavailableBySite(site);
            } else {
                unavailable = await this.unavailablerepository.getUnavailableById(unavailable_id);
            }
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(unavailable);
    }
    public async getUnavailableByAsset(req: Request, res: Response) {
        let asset_id = req.query.asset_id ? req.query.asset_id : undefined;
        if (asset_id === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let unavailable: any;
        try {
            unavailable = await this.unavailablerepository.getUnavailableByAsset(asset_id);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(unavailable);
    }
}

