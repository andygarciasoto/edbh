import { Request, Response } from 'express';
import { RoleRepository } from '../repositories/role-repository';
import { UserRepository } from '../repositories/user-repository';

export class UserService {

    private readonly userrepository: UserRepository;
    private readonly rolerepository: RoleRepository;

    public constructor(userrepository: UserRepository, rolerepository: RoleRepository) {
        this.userrepository = userrepository;
        this.rolerepository = rolerepository;
    }

    public async findSitesByUser(req: Request, res: Response) {
        let badge = req.query.clock_number;
        if (!badge) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let users: any;
        try {
            users = await this.userrepository.findSitesByUser(badge);
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
            user[0].permissions = await this.rolerepository.getComponentsByRole(user[0].role_id, 'null');
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(200).json(user);
    }

}