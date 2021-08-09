import { Request, Response } from 'express';
import { UserRepository } from '../repositories/user-repository';
import { ScanRepository } from '../repositories/scan-repository';
import { AssetRepository } from '../repositories/asset-repository';
import { RoleRepository } from '../repositories/role-repository';
import jwt from 'jsonwebtoken';
import localStorage from 'localStorage';
let nJwt = require('njwt');
let request = require('request');


export class AuthService {

    private readonly userrepository: UserRepository;
    private readonly assetrepository: AssetRepository;
    private readonly scanrepository: ScanRepository;
    private readonly rolerepository: RoleRepository;
    private readonly config: any;

    public constructor(userrepository: UserRepository, assetrepository: AssetRepository, scanrepository: ScanRepository, rolerepository: RoleRepository, config: any) {
        this.userrepository = userrepository;
        this.assetrepository = assetrepository;
        this.scanrepository = scanrepository;
        this.rolerepository = rolerepository;
        this.config = config;
    }

    public async badLogin(req: Request, res: Response) {
        return res.redirect(401, this.config.app_section.loginURL);
    }

    public async loginWithBadgeAndMachine(req: Request, res: Response) {
        const params = req.query;
        let machine = '';
        if (!params.badge) {
            return res.status(400).json({ message: "Bad Request - Missing Clock Number" });
        }
        machine = params.st == 'null' || params.st == 'undefined' ? 0 : params.st;
        let responseUser: any;
        try {
            responseUser = await this.userrepository.findUserInformation(params.badge, machine, 0, 0);
            responseUser = responseUser[0];
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }

        if (responseUser === undefined) {
            return res.redirect(303, this.config.app_section.badLogin);
        }

        let role = responseUser.role;
        let claimsList = {
            user: {
                iss: this.config.app_section.URL,
                sub: 'users/' + responseUser.badge,
                scope: role,
                user_id: responseUser.id,
                user_badge: responseUser.badge,
                user_machine: machine,
                assign_role: null
            },
        }
        if (machine) {
            let assetInformation = await this.assetrepository.getAssetByAssetDisplaySystem(machine);
            assetInformation = assetInformation[0];
            if ((assetInformation.is_multiple || assetInformation.is_dynamic) && role === 'Operator') {
                this.scanrepository.putScan(responseUser.badge, responseUser.badge, responseUser.first_name, responseUser.last_name, assetInformation.asset_id, responseUser.current_date_time,
                    'Check-In', 'Active', responseUser.site, 0, 0);
            }
        }
        let jwt = nJwt.create(claimsList.user, this.config.authentication_section.signingKey);
        jwt.setExpiration(new Date().getTime() + (responseUser.inactive_timeout_minutes * 60000));
        let token = jwt.compact();
        //let url = machine != '0' ? `?st=${machine}` + `#token=${token}` : `#token=${token}`;
        return res.redirect(302, this.config.app_section.loginURL + `#token=${token}`);
    }

    public async processActiveDirectoryResponse(req: Request, res: Response) {
        const param = req.query;
        if (!param.code) {
            return res.status(400).json({ message: "Bad Request - Missing Token" });
        }
        const code = param.code;
        const url = `https://login.microsoftonline.com/${this.config.ad_authentication_section.tenant_id}/oauth2/token`;
        let params = {
            client_id: this.config.ad_authentication_section.client_id,
            client_secret: this.config.ad_authentication_section.secret,
            grant_type: 'authorization_code',
            redirect_uri: this.config.app_section.redirect_uri,
            code: code
        };
        const config = this.config;
        request({
            url: url,
            method: "POST",
            form: params,
            timeout: 10000
        }, async (error, resp, body) => {
            if (error) {
                console.log(error);
                res.status(500).send({ message: 'Error', error });
                return;
            }
            body = JSON.parse(body);
            if (!('id_token' in body)) {
                return res.status(400).json({ message: "Bad Request - Missing Token" });
            }
            let jsonwebtoken = jwt.decode(body['id_token']);
            if (jsonwebtoken.aud && jsonwebtoken.aud != config.ad_authentication_section.client_id) {
                return res.status(400).json({ message: "JWT audience mismatch" });
            }
            if ((jsonwebtoken.exp + 5 * 60) * 1000 < Date.now()) {
                return res.status(400).json({ message: "Expired JWT" });
            }
            jsonwebtoken.user_id = localStorage.getItem('user_id');
            jsonwebtoken.user_badge = localStorage.getItem('user_badge');
            jsonwebtoken.user_machine = localStorage.getItem('user_machine');
            const expirationToken = localStorage.getItem('inactive_timeout_minutes');
            localStorage.removeItem('user_id');
            localStorage.removeItem('user_badge');
            localStorage.removeItem('inactive_timeout_minutes');
            let machine = localStorage.getItem('user_machine') !== '0' ? localStorage.getItem('user_machine') : null;
            let role = localStorage.getItem('role');

            if (machine && role === 'Supervisor') {
                let assetInformation = await this.assetrepository.getAssetByAssetDisplaySystem(machine);
                assetInformation = assetInformation[0];
                jsonwebtoken.assign_role = (assetInformation.is_multiple || assetInformation.is_dynamic) ? null : role;
            } else if (role === 'Supervisor') {
                jsonwebtoken.assign_role = role;
            }
            let jwtx = nJwt.create(jsonwebtoken, config.authentication_section.signingKey);
            jwtx.setExpiration(new Date().getTime() + (expirationToken * 60000));
            let token = jwtx.compact();

            if (localStorage.getItem("user_machine")) {
                let st = localStorage.getItem("user_machine");
                localStorage.removeItem("user_machine");
                return res.redirect(302, config.app_section.loginURL + `?st=${st}` + `#token=${token}`);
            }
            return res.redirect(302, config.app_section.loginURL + `#token=${token}`);
        });
    }

    public async loginWithUsername(req: Request, res: Response) {
        const params = req.body;
        let machine = '';
        if (!params.username) {
            return res.status(400).json({ message: "Bad Request - Missing Username" });
        }
        machine = params.st == 'null' || params.st == 'undefined' || params.st === '' ? 0 : params.st;
        let responseUser: any;
        try {
            responseUser = await this.userrepository.findUserByUsernameAndMachine(params.username, machine);
            responseUser = responseUser[0];
        } catch (err) {
            return res.redirect(303, this.config.app_section.badLoginUser);
        }

        if (responseUser === undefined) {
            return res.redirect(303, this.config.app_section.badLoginUser);
        }

        let role = responseUser.role;
        let claimsList = {
            user: {
                iss: this.config.app_section.URL,
                sub: 'users/' + responseUser.badge,
                scope: role,
                user_id: responseUser.id,
                user_badge: responseUser.badge,
                user_machine: machine,
                assign_role: null
            },
        }

        try {
            if (claimsList.user && params.password === 'parkerdxh2019') {
                if (machine) {
                    let assetInformation = await this.assetrepository.getAssetByAssetDisplaySystem(machine);
                    assetInformation = assetInformation[0];
                    if ((assetInformation.is_multiple || assetInformation.is_dynamic) && role === 'Operator') {
                        this.scanrepository.putScan(responseUser.badge, responseUser.badge, responseUser.first_name, responseUser.last_name, assetInformation.asset_id, responseUser.current_date_time,
                            'Check-In', 'Active', responseUser.site, 0, 0);
                    }
                } else {
                    claimsList.user.assign_role = role;
                }
                let jwt = nJwt.create(claimsList.user, this.config.authentication_section.signingKey);
                jwt.setExpiration(new Date().getTime() + ((responseUser.role === 'Summary' ? responseUser.summary_timeout : responseUser.inactive_timeout_minutes) * 60000));
                let token = jwt.compact();
                const url = `${req.get('origin')}/${responseUser.role === 'Summary' ? 'summary' : 'dashboard'}#token=${token}`;
                return res.redirect(302, url);
            }
            return res.redirect(401, this.config.app_section.loginURL);
        } catch (e) {
            console.log(e);
            return res.redirect(401, this.config.app_section.loginURL);
        }

    }

    public async extractInformationFromToken(req: Request, res: Response) {
        let token = req.header('Authorization');

        if (token && token.startsWith('Bearer ')) {
            token = token.slice(7, token.length).trimLeft();
        }
        if (token) {
            let payload = { body: { sub: null, user_id: null, user_badge: null, user_machine: null, assign_role: null } };
            try {
                payload = await this.proccessToken(token);
            } catch (e) {
                res.status(401);
                return res.json({
                    success: false,
                    message: e.message
                });
            }
            if (payload.body.sub) {
                req.query.station = req.query.station && req.query.station !== 'null' ? req.query.station : null;
                let badge = payload.body.user_badge;
                let machine = payload.body.user_machine || req.query.station || 0;
                let site = req.query.site_id || 0;
                let responseUser: any;
                try {
                    responseUser = await this.userrepository.findUserInformation(badge, machine, 0, site);
                    const differentRole = payload.body.assign_role && responseUser[0].role !== payload.body.assign_role;
                    responseUser[0].role = payload.body.assign_role || responseUser[0].role;
                    responseUser[0].assing_role = payload.body.assign_role;
                    responseUser[0].permissions = await this.rolerepository.getComponentsByRole((differentRole ? 0 : responseUser[0].role_id), payload.body.assign_role);
                    responseUser[0].sites = await this.userrepository.findSitesByUser(badge);
                    return res.status(200).json(responseUser);
                } catch (err) {
                    console.log(err);
                    res.status(500).json({ message: err.message });
                    return;
                }
            } else {
                res.status(401);
                return res.json({
                    success: false,
                    message: 'Auth token is invalid'
                });
            }
        } else {
            res.status(401);
            return res.json({
                success: false,
                message: 'Auth token is not supplied'
            });
        }
    }

    public async assignRoleToken(req: Request, res: Response) {
        const params = req.query;

        if (!params.newRole || !params.token) {
            return res.status(400).json({ message: "Bad Request - Missing Role" });
        }

        let token = params.token;

        if (token) {
            let payload = { body: { sub: null, user_id: null, user_badge: null, user_machine: null, assign_role: null } };
            try {
                payload = await this.proccessToken(token);
            } catch (e) {
                res.status(401);
                return res.json({
                    success: false,
                    message: e.message
                });
            }
            if (payload.body.sub) {
                let badge = payload.body.user_badge;
                let machine = payload.body.user_machine;
                try {
                    let responseUser = await this.userrepository.findUserInformation(badge, machine, 0, 0);
                    responseUser = responseUser[0];

                    let claimsList = {
                        user: {
                            iss: this.config.app_section.URL,
                            sub: 'users/' + badge,
                            scope: responseUser.role,
                            assign_role: params.newRole,
                            user_id: payload.body.user_id,
                            user_badge: badge,
                            user_machine: machine
                        }
                    }

                    let jwt = nJwt.create(claimsList.user, this.config.authentication_section.signingKey);
                    jwt.setExpiration(new Date().getTime() + ((responseUser.role === 'Summary' ? responseUser.summary_timeout : responseUser.inactive_timeout_minutes) * 60000));
                    let token = jwt.compact();

                    return res.status(200).send(token);

                } catch (err) {
                    console.log(err);
                    res.status(500).json({ message: err.message });
                    return;
                }
            } else {
                res.status(401);
                return res.json({
                    success: false,
                    message: 'Auth token is invalid'
                });
            }
        } else {
            res.status(401);
            return res.json({
                success: false,
                message: 'Auth token is not supplied'
            });
        }
    }

    private async proccessToken(token: string): Promise<any> {
        const config = this.config;
        return new Promise((resolve, reject) => {
            nJwt.verify(token, config.authentication_section.signingKey, (err, decoded) => {
                if (err) return reject(err);
                resolve(decoded);
            })
        });
    }
}