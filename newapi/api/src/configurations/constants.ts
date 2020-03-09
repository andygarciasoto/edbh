import cors from 'cors';
import { Router, Request, Response, NextFunction } from 'express';
let nJwt = require('njwt');

export class Constants {

    private router: Router;
    private routerToken: Router;

    constructor() {
        this.router = Router();
        this.routerToken = Router();
    }

    public getCorsConfiguration(config): cors.CorsOptions {
        const options: cors.CorsOptions = {
            origin: (origin, callback) => {
                if (config.app_section.cors.indexOf(origin) !== -1) {
                    callback(null, true)
                } else {
                    callback(new Error('Not allowed by CORS'))
                }
            },
            optionsSuccessStatus: 200,
            allowedHeaders: [
                'Authorization',
                'Content-Type',
                'Content-disposition',
                'X-Requested-With',
                'X-XSRF-TOKEN',
            ],
            methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
            exposedHeaders: ['Location', 'Content-Disposition'],
            credentials: true,
        };

        return options;
    }

    public initializeSecurityRouter(config): void {
        this.routerToken.use((err: Error, req: Request, res: Response, next: NextFunction) => {
            if (err.name === 'UnauthorizedError') {
                res.status(401);
                res.json({ "message": err.name + ": " + err.message });
            } else
                next(err);
        });

        this.routerToken.use((req: Request, res: Response, next: NextFunction) => {
            var allowedOrigins = config.app_section.cors
            var origin = req.headers.origin;
            if (allowedOrigins.indexOf(origin) > -1) {
                res.setHeader('Access-Control-Allow-Origin', origin);
            }
            res.setHeader("Access-Control-Allow-Credentials", "true")
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            next();
        });

        this.routerToken.use((req: Request, res: Response, next: NextFunction) => {
            let token = req.header('Authorization');
            if (token && token.startsWith('Bearer ')) {
                token = token.slice(7, token.length).trimLeft();
            }
            if (token) {
                nJwt.verify(token, config.authentication_section.signingKey, (err: Error) => {
                    if (err) {
                        return res.sendStatus(401);
                    } else {
                        next()
                    }
                });
            } else {
                res.status(401);
                return res.json({
                    success: false,
                    message: 'Auth token is not supplied'
                });
            }
        });
    }

    public getUnsecurityRouter(): Router {
        return this.router;
    }

    public getSecurityRouter(): Router {
        return this.routerToken;
    }
}