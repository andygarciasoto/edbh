import { Request, Response } from 'express';
import { TimezoneRepository } from '../repositories/timezone-repository';


export class TimezoneService {

    private readonly timezonerepository: TimezoneRepository;

    public constructor(timezonerepository: TimezoneRepository) {
        this.timezonerepository = timezonerepository;
    }

    public async getTimezones(req: Request, res: Response) {
        let timezones: any;
        try {
            timezones = await this.timezonerepository.getTimezones();
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(200).json(timezones);
    }
}