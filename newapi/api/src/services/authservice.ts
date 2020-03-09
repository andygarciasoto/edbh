import { Request, Response } from 'express';
import { UserRepository } from '../repositories/user-repository';
import jwt from 'jsonwebtoken';
let nJwt = require('njwt');
let request = require('request');


export class AuthService {

    private readonly userrepository: UserRepository;
    private readonly config: any;

    public constructor(userrepository: UserRepository, config: any) {
        this.userrepository = userrepository;
        this.config = config;
    }

    public async badLogin(req: Request, res: Response) {
        return res.redirect(401, this.config.app_section.loginURL);
    }

    public async LoginWithBadgeAndMachine(req: Request, res: Response) {
        const params = req.query;
        let machine = '';
        if (!params.badge) {
            return res.status(400).json({ message: "Bad Request - Missing Clock Number" });
        }
        machine = params.st == 'null' || params.st == 'undefined' ? 0 : params.st;
        let responseUser: any;
        try {
            responseUser = await this.userrepository.findUserByBadgeAndMachine(params.badge, machine);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        let role = responseUser[0].role;
        if (role === 'Supervisor' || role === 'Administrator') {
            const url = `https://login.microsoftonline.com/${this.config.ad_authentication_section.tenant_id}/oauth2/authorize?client_id=${this.config.ad_authentication_section.client_id}&response_type=code&scope=openid&redirect_uri=${this.config.app_section.redirect_uri}`;
            return res.redirect(302, url);
        } else {
            let claimsList = {
                user: {
                    iss: this.config.app_section.URL,
                    sub: 'users/' + responseUser[0].badge,
                    scope: role,
                    user_id: responseUser[0].id,
                    user_badge: responseUser[0].badge,
                    user_machine: machine
                },
            }
            let jwt = nJwt.create(claimsList.user, this.config.authentication_section.signingKey);
            jwt.setExpiration(new Date().getTime() + (responseUser[0].inactive_timeout_minutes * 60000));
            let token = jwt.compact();
            return res.redirect(302, this.config.app_section.loginURL + `#token=${token}`);
        }
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
        }, (error, resp, body) => {
            if (error) {
                res.status(500).send({ message: 'Error' });
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
            let jwtx = nJwt.create(jsonwebtoken, config.authentication_section.signingKey);
            jwtx.setExpiration(new Date().getTime() + (440 * 60000));
            let token = jwtx.compact();
            return res.redirect(302, config.app_section.loginURL + `#token=${token}`);
        });
    }

    public async LoginWithUsername(req: Request, res: Response) {
        const params = req.body;
        let machine = '';
        if (!params.username) {
            return res.status(400).json({ message: "Bad Request - Missing Username" });
        }

        machine = params.st == 'null' || params.st == 'undefined' || params.st === '' ? 0 : params.st;

        let responseUser: any;
        try {
            responseUser = await this.userrepository.findUserByUsernameAndMachine(params.username, machine);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        if (responseUser[0] === null) {
            res.redirect(303, this.config.app_section.badLogin);
            return;
        }

        let role = responseUser[0].role;
        let claimsList = {
            user: {
                iss: this.config.app_section.URL,
                sub: 'users/' + responseUser[0].badge,
                scope: role,
                user_id: responseUser[0].id,
                user_badge: responseUser[0].badge,
                user_machine: machine
            },
        }

        try {
            if (claimsList.user && params.password === 'parkerdxh2019') {
                let jwt = nJwt.create(claimsList.user, this.config.authentication_section.signingKey);
                jwt.setExpiration(new Date().getTime() + ((responseUser[0].role === 'Summary' ? responseUser[0].summary_timeout : responseUser[0].inactive_timeout_minutes) * 60000));
                let token = jwt.compact();
                const url = `${this.config.app_section.URL}/${responseUser[0].role === 'Summary' ? 'summary' : 'dashboard'}#token=${token}`;
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
            let payload = { body: { sub: null, user_id: null, user_badge: null, user_machine: null } };
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
                let id = payload.body.user_id;
                let badge = payload.body.user_badge;
                let machine = payload.body.user_machine;
                let responseUser: any;
                try {
                    responseUser = await this.userrepository.findUserByBadgeAndMachine(badge, machine);
                } catch (err) {
                    console.log(err);
                    res.status(500).json({ message: err.message });
                    return;
                }
                return res.status(200).json(responseUser);
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