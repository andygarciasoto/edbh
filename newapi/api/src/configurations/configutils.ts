import cors from 'cors';
import { Request, Response, NextFunction, Router } from 'express';
let nJwt = require('njwt');

export function getCorsConfiguration(config): cors.CorsOptions {
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

export function routerWhithoutToken(config): Router {
    let router: Router = Router();
    router.use((req: Request, res: Response, next: NextFunction) => {
        let origin = req.headers.origin;
        if (config.app_section.cors.indexOf(origin) > -1) {
            res.setHeader('Access-Control-Allow-Origin', origin);
        }
        res.setHeader("Access-Control-Allow-Credentials", "true")
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    return router;
}

export function routerWithToken(config): Router {
    let router: Router = Router();
    router.use((req: Request, res: Response, next: NextFunction) => {
        let origin = req.headers.origin;
        if (config.app_section.cors.indexOf(origin) > -1) {
            res.setHeader('Access-Control-Allow-Origin', origin);
        }
        res.setHeader("Access-Control-Allow-Credentials", "true")
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });
    router.use((req: Request, res: Response, next: NextFunction) => {
        let token = req.header('Authorization');
        if (token && token.startsWith('Bearer ')) {
            token = token.slice(7, token.length).trimLeft();
        }
        if (token) {
            nJwt.verify(token, config.authentication_section.signingKey, (err: Error) => {
                if (err) {
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid token'
                    });
                } else {
                    next()
                }
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'Auth token is not supplied'
            });
        }
    });
    return router;
}