import { Request, Response } from 'express';
import { UserRepository } from '../repositories/user-repository';

export class UserService {

    private readonly userrepository: UserRepository;

    public constructor(userrepository: UserRepository) {
        this.userrepository = userrepository;
    }

    public async getUserByBadge(req: Request, res: Response) {
        let badge = req.query.clock_number;
        if (!badge) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let users: any;
        try {
            users = await this.userrepository.findUserByBadgeAndMachine(badge, '0');
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(users);
    }

}