import { Request, Response } from 'express';
import { EscalationRepository } from '../repositories/escalation-repository';

export class EscalationService {

    private readonly escalationrepository: EscalationRepository;

    public constructor(escalationrepository: EscalationRepository) {
        this.escalationrepository = escalationrepository;
    }

    public async getEscalation(req: Request, res: Response) {
        const site_id = req.query.site_id ? req.query.site_id : undefined;
        let escalation: any;
        try {
            if (!site_id || site_id === null || site_id === undefined) {
                escalation = await this.escalationrepository.getEscalation();
            } else {
                escalation = await this.escalationrepository.getEscalationBySite(site_id);
            }
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(200).json(escalation);
    }

    public async putEscalation(req: Request, res: Response) {
        const escalation_name = req.body.escalation_name ? req.body.escalation_name : undefined;
        const escalation_group = req.body.escalation_group ? req.body.escalation_group : undefined;
        const escalation_level = req.body.escalation_level ? req.body.escalation_level : undefined;
        const escalation_hours = req.body.escalation_hours ? req.body.escalation_hours : undefined;
        const status = req.body.status ? req.body.status : 'Active';
        const escalation_id = req.body.escalation_id ? req.body.escalation_id : null;

        if (escalation_name === undefined || escalation_group === undefined || escalation_level === undefined || escalation_hours === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters"});
        }
        let escalation: any;
        try {
            escalation = await this.escalationrepository.putEscalation(escalation_id, escalation_name, escalation_group, escalation_level, escalation_hours, status);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).send('Message Entered Succesfully');
    }
}