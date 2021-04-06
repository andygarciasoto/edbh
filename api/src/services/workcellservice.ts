import { Request, Response } from 'express';
import { WorkcellRepository } from '../repositories/workcell-repository';

export class WorkcellService {

    private readonly workcellrepository : WorkcellRepository;

    public constructor(workcellrepository: WorkcellRepository) {
        this.workcellrepository = workcellrepository;
    }

    public async getWorkcellBySite(req: Request, res: Response) {
        let site = req.query.site;
        if (!site) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let workcell: any;
        try {
            workcell = await this.workcellrepository.getWorkcellBySite(site);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(workcell);
    }

    public async putWorkcell(req: Request, res: Response) {
        const workcell_id = req.body.workcell_id ? req.body.workcell_id : null;
        const workcell_name = req.body.workcell_name ? req.body.workcell_name : undefined;
        const workcell_description = req.body.workcell_description ? req.body.workcell_description : null;
        const site_id = req.body.site_id ? req.body.site_id : undefined;

        if (workcell_name === undefined ||site_id === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let workcell: any;
        try {
            workcell = await this.workcellrepository.putWorkcell(workcell_id, workcell_name, workcell_description, site_id);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).send('Message Entered Succesfully');
    }
}