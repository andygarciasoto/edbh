import { Request, Response } from 'express';
import { CommonParametersRepository } from '../repositories/commonparameters-repository';

export class CommonParametersService {

    private readonly commonparametersrepository: CommonParametersRepository;

    public constructor(commonparametersrepository: CommonParametersRepository) {
        this.commonparametersrepository = commonparametersrepository;
    }

    public async putCommonParameter(req: Request, res: Response) {
        const site_id = req.body.site_id ? req.body.site_id : undefined;
        const site_name = req.body.site_name ? req.body.site_name : undefined;
        const production_day_offset_minutes = req.body.production_day_offset_minutes ? req.body.production_day_offset_minutes : 0;
        const default_target_percent_of_ideal = req.body.default_target_percent_of_ideal ? req.body.default_target_percent_of_ideal : 0;
        const default_setup_minutes = req.body.default_setup_minutes ? req.body.default_setup_minutes : 0;
        const default_routed_cycle_time = req.body.default_routed_cycle_time ? req.body.default_routed_cycle_time : 0;
        const inactive_timeout_minutes = req.body.inactive_timeout_minutes ? req.body.inactive_timeout_minutes : 0;
        const summary_timeout = req.body.summary_timeout ? req.body.summary_timeout : 0;
        const break_minutes = req.body.break_minutes ? req.body.break_minutes : 0;
        const lunch_minutes = req.body.lunch_minutes ? req.body.lunch_minutes : 0;
        const site_prefix = req.body.site_prefix ? req.body.site_prefix : null;
        const status = req.body.status ? req.body.status : 'Active';
        const assembly_url = req.body.assembly_url;
        const timezone_id = req.body.timezone_id ? req.body.timezone_id : null;
        const language_id = req.body.language_id ? req.body.language_id : null;

        if (site_id === undefined || site_name === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let commonparameters: any;
        try {
            commonparameters = await this.commonparametersrepository.putCommonParameter(site_id, site_name, production_day_offset_minutes, default_target_percent_of_ideal, default_setup_minutes, default_routed_cycle_time, inactive_timeout_minutes, status, summary_timeout, break_minutes, lunch_minutes, site_prefix, assembly_url, timezone_id, language_id);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).send('Message Entered Succesfully');
    }

    public async getCommonParameterBySite(req: Request, res: Response) {
        const site = req.query.site;
        if (!site || site === undefined || site === null) {
            return res.status(400).send("Bad Request - Missing parameters");
        }
        let commonparameters: any;
        try {
            commonparameters = await this.commonparametersrepository.getCommonParametersBySite(site);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(commonparameters);
    }
}