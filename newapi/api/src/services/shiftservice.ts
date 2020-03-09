import { Request, Response } from 'express';
import { ShiftRepository } from '../repositories/shift-repository';

export class ShiftService {

    private readonly shiftrepository: ShiftRepository;

    public constructor(shiftrepository: ShiftRepository) {
        this.shiftrepository = shiftrepository;
    }

    public async GetShiftBySite(req: Request, res: Response) {
        const site = req.query.site;
        if (!site) {
            return res.status(400).send("Bad Request - Missing parameters");
        }
        let shifts: any;
        try {
            shifts = await this.shiftrepository.GetShiftBySite(site);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(shifts);
    }

}