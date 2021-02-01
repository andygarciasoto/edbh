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
        if (params.role_id == undefined) {
            return res.status(400).send("Missing parameters");
        }
        let role_id = params.role_id;        
        let role: any;
        try {
            role = await this.rolerepository.getComponentsByRole(role_id);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(200).json(role);
    }
}