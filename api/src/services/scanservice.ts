import { request, Request, Response } from 'express';
import { ScanRepository } from '../repositories/scan-repository';
import moment from 'moment';

export class ScanService {

    private readonly scanrepository: ScanRepository;
    private readonly format: string = 'YYYY-MM-DD HH:mm:ss';

    public constructor(scanrepository: ScanRepository) {
        this.scanrepository = scanrepository;
    }

    public async putScan(req: Request, res: Response) {
        const badge = req.body.badge ? req.body.badge : undefined;
        const closed_by = req.body.closed_by ? req.body.closed_by : undefined; 
        const first_name = req.body.first_name ? req.body.first_name : undefined;
        const last_name = req.body.last_name ? req.body.last_name : undefined;
        const asset_id = req.body.asset_id ? req.body.asset_id : undefined;
        const timestamp = moment(new Date(req.body.timestamp)).format(this.format);
        const reason = req.body.reason ? req.body.reason : undefined;
        const status = req.body.status ? req.body.status : undefined;
        const site_id = req.body.site_id ? req.body.site_id : undefined;
        const break_minutes = req.body.break_minutes ? req.body.break_minutes : 0;
        const lunch_minutes = req.body.lunch_minutes ? req.body.lunch_minutes : 0;

        if (badge === undefined || closed_by === undefined || asset_id === undefined || timestamp === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters - Badge, Asset or Timestamp" });
        }
        let scan: any;
        try {
            scan = await this.scanrepository.putScan(badge, closed_by, first_name, last_name, asset_id, timestamp, reason, status, site_id, break_minutes, lunch_minutes);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).send('Message Entered Succesfully');
    }

    public async getScanByAsset(req: Request, res: Response) {
        const params = req.query;
        if (params.start_time == undefined || params.end_time == undefined || params.asset_id == undefined) {
            return res.status(400).send("Missing parameters");
        }
        let start_time = moment(new Date(params.start_time)).format(this.format);
        let end_time = moment(new Date(params.end_time)).format(this.format);
        let asset_id = params.asset_id;
        
        let scan: any;
        try {
            scan = await this.scanrepository.getScan(start_time, end_time, asset_id);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(200).json(scan);
    }
}