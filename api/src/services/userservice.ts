import { Request, Response } from 'express';
import { UserRepository } from '../repositories/user-repository';

export class UserService {

    private readonly userrepository: UserRepository;

    public constructor(userrepository: UserRepository) {
        this.userrepository = userrepository;
    }

    public async findUserByBadge(req: Request, res: Response) {
        let badge = req.query.clock_number;
        if (!badge) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let users: any;
        try {
            users = await this.userrepository.findUserByBadge(badge);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(200).json(users);
    }

    public async findUserById(req: Request, res: Response) {
        let params = req.query;
        if (!params.user_id) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let users: any;
        try {
            users = await this.userrepository.findUserById(params.user_id);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(200).json(users);
    }

    public async findUserInformation(req: Request, res: Response) {
        let params = req.query;
        if (!params.badge) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters Badge is require" });
        }

        let badge: string = params.badge;
        let machine: string = params.machine || '0';
        let asset_id: number = params.asset_id || 0;
        let site_id: number = params.site_id || 0;
        let user: any;
        try {
            user = await this.userrepository.findUserInformation(badge, machine, asset_id, site_id);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(200).json(user);
    }

}