import { request, Request, Response } from 'express';
import { RoleRepository } from '../repositories/role-repository';
import moment from 'moment';

export class RoleService {

    private readonly rolerepository: RoleRepository;
    private readonly format: string = 'YYYY-MM-DD HH:mm:ss';

    public constructor(rolerepository: RoleRepository) {
        this.rolerepository = rolerepository;
    }

    public async getComponentsByRole(req: Request, res: Response) {
        const params = req.query;
        if (params.role_id == undefined && params.role_name == undefined) {
            return res.status(400).send("Missing parameters");
        }
        const role_id = params.role_id ? params.role_id : 0;
        const role_name = params.role_name ? params.role_name : 'null';
        let role: any;
        try {
            role = await this.rolerepository.getComponentsByRole(role_id, role_name);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(200).json(role);
    }

    public async getRoles(req: Request, res: Response) {
        let roles: any;
        try {
            roles = await this.rolerepository.getRoles();
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(200).json(roles);
    }
}