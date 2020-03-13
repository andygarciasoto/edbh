import express, { Application, Router, Request, Response, NextFunction } from 'express';
import { join } from 'path';
import cors from 'cors';
import { json, urlencoded } from 'body-parser';
import cookieParser from 'cookie-parser';
import * as http from './configurations/http';
import { ServerConfig } from './configurations/serverConfig';

const developmentEnvId = 'development';

export interface LoaderConfiguration {
    app?: Application;
    appInsightsKey: string;
    appInsightsConfig?: any;
    serviceName: string;
    prefix: string;
    defaultPort?: number;
    healthCheck?: () => boolean;
    options?: cors.CorsOptions;
    cors?: any[];
    webSocketHandler?: ServerConfig;
    restEndpoints?: http.RestEndpoint[];
    router: Router;
    routerToken: Router;
}

export function initializeApp(config: LoaderConfiguration): void {

    config.appInsightsConfig.setup(config.appInsightsKey);
    config.appInsightsConfig.start();

    config.app = config.app || express();
    // Remove X-Powered-By header
    config.app.disable('x-powered-by');
    // Setup development environment variable and request logging
    config.app.locals.ENV = process.env.NODE_ENV || developmentEnvId;
    config.app.locals.ENV_DEVELOPMENT = config.app.locals.ENV === developmentEnvId;

    config.app.use(express.static(join(__dirname, 'public')));

    config.app.options('*', cors(config.options));


    config.app.use(json());
    config.app.use(urlencoded({ extended: false }));
    config.app.use(cookieParser());

    attachHttpEndpoints(config);

    const port = process.env.PORT || config.defaultPort;
    const server = config.app.listen(port);
    console.log('Started API on port ', port);

    if (config.webSocketHandler) {
        config.webSocketHandler.startServer();
        config.webSocketHandler.getServer().attach(server, {
            origins: config.cors,
            cookie: false,
            serveClient: false
        });
    }

}

function attachHttpEndpoints(config: LoaderConfiguration) {
    const rootEndpoint = new http.RestEndpoint(config.prefix, 'get', (req: Request, res: Response) => {
        if (config.healthCheck && !config.healthCheck()) {
            res.sendStatus(503);
            return;
        }
        res.send(config.serviceName);
    }, false);
    rootEndpoint.attach(config);
    config.restEndpoints.forEach(endpoint => endpoint.attach(config));
    config.app.use(config.router);
    config.app.use(config.routerToken);
    // Default route
    config.app.use((req: Request, res: Response) => {
        const status = req.method === 'OPTIONS' ?
            204 :
            404;
        res.status(status).send();
    });
    // Error handler must be declared after all other endpoints
    // next parameter is required to register the error handler
    config.app.use(async (err: Error, req: Request, res: Response, next: NextFunction) => {
        res.status(500).send();
        if (next) {
            next();
        }
    });
}