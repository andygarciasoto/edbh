import { Request, Response } from 'express';
import { ShiftRepository } from '../repositories/shift-repository';
import moment from 'moment';

export class ShiftService {

    private readonly shiftrepository: ShiftRepository;
    private readonly format: string = 'YYYY-MM-DD HH:mm:ss';

    public constructor(shiftrepository: ShiftRepository) {
        this.shiftrepository = shiftrepository;
    }

    public async getShiftBySite(req: Request, res: Response) {
        const site = req.query.site;
        if (!site) {
            return res.status(400).send("Bad Request - Missing parameters");
        }
        let shifts: any;
        try {
            shifts = await this.shiftrepository.getShiftBySite(site);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(shifts);
    }

    public async putShifts(req: Request, res: Response) {
        const shift_id = req.body.shift_id ? req.body.shift_id : undefined;
        const shift_code = req.body.shift_code ? req.body.shift_code : undefined;
        const shift_name = req.body.shift_name ? req.body.shift_name : undefined;
        const shift_description = req.body.shift_description ? req.body.shift_description: null;
        const shift_sequence = req.body.shift_sequence ? req.body.shift_sequence : undefined;
        const start_time = req.body.start_time ? req.body.start_time : undefined;
        const start_time_offset_days = req.body.start_time_offset_days ? req.body.start_time_offset_days : undefined;
        const end_time = req.body.end_time ? req.body.end_time : undefined;
        const end_time_offset_days = req.body.end_time_offset_days ? req.body.end_time_offset_days : undefined;
        const duration_in_minutes = req.body.duration_in_minutes ? req.body.duration_in_minutes : null;
        const valid_from = req.body.valid_from ? moment(new Date(req.body.valid_from)).format(this.format) : undefined;
        const valid_to = req.body.valid_to ? moment(new Date(req.body.valid_to)).format(this.format) : null;
        const is_first_shift_of_day = req.body.is_first_shift_of_day ? req.body.is_first_shift_of_day : 0;
        const status = req.body.status ? req.body.status : 'Active';
        const site_id = req.body.site_id ? req.body.site_id : undefined;
 
        if (shift_id === undefined || shift_code === undefined || shift_name === undefined || shift_sequence === undefined || start_time === undefined || end_time === undefined || start_time_offset_days === undefined || end_time_offset_days === undefined || valid_from === undefined || site_id === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let shifts: any;
        try {
            shifts = await this.shiftrepository.putShifts(shift_id, shift_code, shift_name, shift_description, shift_sequence, start_time, start_time_offset_days, end_time, end_time_offset_days, duration_in_minutes, valid_from, valid_to, is_first_shift_of_day, status, site_id);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).send('Message Entered Succesfully');
    }
}