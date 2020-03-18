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

}