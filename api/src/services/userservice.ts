import { Request, Response } from 'express';
import { RoleRepository } from '../repositories/role-repository';
import { UserRepository } from '../repositories/user-repository';
import { getUserParameters } from '../validators/userValidator';

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

    public async getUsersBySite(req: Request, res: Response) {
        let params = req.query;
        const site_id = params.site_id ? params.site_id : null;
        const role_id = params.role_id ? params.role_id : null;
        const status = params.status ? params.status : null;
        const badge = params.badge ? params.badge : null;
        if (site_id === null) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let users: any;
        try {
            if (badge !== null) {
                users = await this.userrepository.findUserByBadgeAndSite(site_id, badge);
            } else {
                users = await this.userrepository.findUserByFilter(getUserParameters(params));
            }
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(200).json(users);
    }

    public async putUser(req: Request, res: Response) {
        const badge = req.body.badge ? req.body.badge : undefined;
        const username = req.body.username ? req.body.username : undefined;
        const first_name = req.body.first_name ? req.body.first_name : undefined;
        const last_name = req.body.last_name ? req.body.last_name : undefined;
        const role_id = req.body.role_id ? req.body.role_id : undefined;
        const status = req.body.status ? req.body.status : undefined;
        const site_id = req.body.site_id ? req.body.site_id : undefined;
        const escalation_id = req.body.escalation_id ? req.body.escalation_id : null;

        if (badge === undefined || username === undefined || first_name === undefined || last_name === undefined || role_id === undefined || status === undefined || site_id === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters - Badge, Asset or Timestamp" });
        }
        let user: any;
        try {
            user = await this.userrepository.putUser(badge, username, first_name, last_name, role_id, status, site_id, escalation_id);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).send('Message Entered Succesfully');
    }
}