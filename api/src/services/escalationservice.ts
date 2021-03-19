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
}