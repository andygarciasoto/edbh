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
    public async putUnavailable(req: Request, res: Response) {
        let unavailable_code = req.body.unavailable_code;
        let unavailable_id = req.body.unavailable_id ? req.body.unavailable_id : 0;
        let unavailable_name = req.body.unavailable_name ? req.body.unavailable_name : undefined;
        let unavailable_description = req.body.unavailable_description;
        let start_time = req.body.start_time ? req.body.start_time : undefined;
        let end_time = req.body.end_time ? req.body.end_time : undefined;
        let duration_in_minutes = req.body.duration_in_minutes ? req.body.duration_in_minutes : undefined;
        let valid_from = req.body.valid_from ? req.body.valid_from : undefined;
        let status = req.body.status ? req.body.status : undefined;
        let asset_id = req.body.asset_id !== 0 ? req.body.asset_id : undefined;
        let site_id = req.body.site_id !== 0 ? req.body.site_id : undefined;
        if (unavailable_name === undefined || start_time === undefined || end_time === undefined || duration_in_minutes === undefined || valid_from === undefined ||
            status === undefined || asset_id === undefined || site_id === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let unavailable: any;
        try {
            unavailable = await this.unavailablerepository.putUnavailable(unavailable_code, unavailable_id, unavailable_name, unavailable_description, start_time, end_time,
                duration_in_minutes, valid_from, status, asset_id, site_id);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).send('Message Entered Succesfully');
    }
}

