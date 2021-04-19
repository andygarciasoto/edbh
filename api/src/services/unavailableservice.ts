import { Request, Response } from 'express';
import { UnavailableRepository } from '../repositories/unavailable-repository';
import { getUnavailableParameters } from '../validators/unavailableValidator';

export class UnavailableService {
    private readonly unavailablerepository: UnavailableRepository;

    public constructor(unavailablerepository: UnavailableRepository) {
        this.unavailablerepository = unavailablerepository;
    }

    public async getUniqueUnavailableBySite(req: Request, res: Response) {
        let site_id = req.query.site_id;
        if (!site_id) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let unavailable: any;
        try {
            unavailable = await this.unavailablerepository.findUnavailableByFilter(getUnavailableParameters(req.query));
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(unavailable);
    }
    public async getAssetsUnavailableCode(req: Request, res: Response) {
        let unavailable_code = req.query.unavailable_code;
        if (!unavailable_code) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let unavailable: any;
        try {
            unavailable = await this.unavailablerepository.getAssetsUnavailableCode(unavailable_code);
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

