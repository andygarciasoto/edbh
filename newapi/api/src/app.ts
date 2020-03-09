import * as appInsights from 'applicationinsights';
import * as config from './configurations/config.json';
import { SqlServerStore } from './configurations/sqlserverstore';
import { initializeApp } from './index';
import { ServerConfig } from './configurations/serverConfig';
import { Constants } from './configurations/constants';
import * as http from './configurations/http';
import { Request, Response } from 'express';
import { AuthService } from './services/authservice';
import { UserRepository } from './repositories/user-repository';
import { AssetRepository } from './repositories/asset-repository';
import { AssetService } from './services/assetservice';
import { ShiftRepository } from './repositories/shift-repository';
import { ShiftService } from './services/shiftservice';
import { UserService } from './services/userservice';
import { UomRepository } from './repositories/uom-repository';
import { UomService } from './services/uomservice';
import { DataRepository } from './repositories/data-repository';
import { DataService } from './services/dataservice';

//INITIALIZE CONFIGURATION OF NODE JS
const sqlServerStore = new SqlServerStore(config);
const serverConfig = new ServerConfig(sqlServerStore);
const constants = new Constants();
constants.initializeSecurityRouter(config);

//INITIALIZE ALL REPOSITORIES
const userRepository = new UserRepository(sqlServerStore);
const assetRepository = new AssetRepository(sqlServerStore);
const shiftsRepository = new ShiftRepository(sqlServerStore);
const uomRepository = new UomRepository(sqlServerStore);
const dataRespository = new DataRepository(sqlServerStore);

//INITIALIZE ALL SERVICES
const authService = new AuthService(userRepository, config);
const assetService = new AssetService(assetRepository);
const shiftService = new ShiftService(shiftsRepository);
const userService = new UserService(userRepository);
const uomService = new UomService(uomRepository, assetRepository);
const dataService = new DataService(dataRespository, assetRepository);

const appConfig = {
    appInsightsKey: config.azure_section.appInsights,
    appInsightsConfig: appInsights,
    serviceName: config.app_section.service_name,
    prefix: config.app_section.prefix,
    defaultPort: config.app_section.port,
    healthCheck: () => sqlServerStore.isConnected(),
    options: constants.getCorsConfiguration(config),
    cors: config.app_section.cors,
    webSocketHandler: serverConfig,
    restEndpoints: [
        new http.RestEndpoint('/auth/', 'get', async (req: Request, res: Response) => {
            await authService.badLogin(req, res);
        }, false),
        new http.RestEndpoint('/auth/badge', 'get', async (req: Request, res: Response) => {
            await authService.LoginWithBadgeAndMachine(req, res);
        }, false),
        new http.RestEndpoint('/auth/token', 'get', async (req: Request, res: Response) => {
            await authService.processActiveDirectoryResponse(req, res);
        }, false),
        new http.RestEndpoint('/auth/', 'post', async (req: Request, res: Response) => {
            await authService.LoginWithUsername(req, res);
        }, false),
        new http.RestEndpoint('/api/me', 'get', async (req: Request, res: Response) => {
            await authService.extractInformationFromToken(req, res);
        }, true),
        new http.RestEndpoint('/api/asset_display_system', 'get', async (req: Request, res: Response) => {
            await assetService.GetAssetByAssetDisplaySystem(req, res);
        }, true),
        new http.RestEndpoint('/api/shifts', 'get', async (req: Request, res: Response) => {
            await shiftService.GetShiftBySite(req, res);
        }, true),
        new http.RestEndpoint('/api/user_sites', 'get', async (req: Request, res: Response) => {
            await userService.GetUserByBadge(req, res);
        }, true),
        new http.RestEndpoint('/api/uom_by_site', 'get', async (req: Request, res: Response) => {
            await uomService.getUomBySite(req, res);
        }, true),
        new http.RestEndpoint('/api/workcell', 'get', async (req: Request, res: Response) => {
            await assetService.GetAssetByWorkcell(req, res);
        }, true),
        new http.RestEndpoint('/api/machine', 'get', async (req: Request, res: Response) => {
            await assetService.GetAssetBySite(req, res);
        }, true),
        new http.RestEndpoint('/api/data', 'get', async (req: Request, res: Response) => {
            await dataService.getShiftData(req, res);
        }, true),
        new http.RestEndpoint('/api/uom_asset', 'get', async (req: Request, res: Response) => {
            await uomService.getUomByAsset(req, res);
        }, true)
    ],
    router: constants.getUnsecurityRouter(),
    routerToken: constants.getSecurityRouter()
}

initializeApp(appConfig)