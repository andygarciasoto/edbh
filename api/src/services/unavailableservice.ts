import { Request, Response } from 'express';
import { UnavailableRepository } from '../repositories/unavailable-repository';

export class UnavailableService {
    private readonly unavailablerepository: UnavailableRepository;

    public constructor(unavailablerepository: UnavailableRepository) {
        this.unavailablerepository = unavailablerepository;
    }

    public async getUniqueUnavailableBySite(req: Request, res: Response) {
        let site = req.query.site;
        if (!site || site === null || site === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let unavailable: any;
        try {
            unavailable = await this.unavailablerepository.getUniqueUnavailableBySite(site);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(unavailable);
    }
}

