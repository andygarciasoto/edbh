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
import { InterShiftDataRepository } from './repositories/intershiftdata-repository';
import { InterShiftDataService } from './services/intershiftdataservice';
import { DxHDataRepository } from './repositories/dxhdata-repository';
import { CommentDataRepository } from './repositories/comment-repository';
import { CommentDataService } from './services/commentservice';

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
const intershiftdataRespository = new InterShiftDataRepository(sqlServerStore);
const dxhdataRepository = new DxHDataRepository(sqlServerStore);
const commentDataRepository = new CommentDataRepository(sqlServerStore);

//INITIALIZE ALL SERVICES
const authService = new AuthService(userRepository, config);
const assetService = new AssetService(assetRepository);
const shiftService = new ShiftService(shiftsRepository);
const userService = new UserService(userRepository);
const uomService = new UomService(uomRepository, assetRepository);
const dataService = new DataService(dataRespository, assetRepository);
const intershiftdataService = new InterShiftDataService(intershiftdataRespository, assetRepository, dxhdataRepository);
const commentdataService = new CommentDataService(commentDataRepository, assetRepository, dxhdataRepository);

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
            await authService.loginWithBadgeAndMachine(req, res);
        }, false),
        new http.RestEndpoint('/auth/token', 'get', async (req: Request, res: Response) => {
            await authService.processActiveDirectoryResponse(req, res);
        }, false),
        new http.RestEndpoint('/auth/', 'post', async (req: Request, res: Response) => {
            await authService.loginWithUsername(req, res);
        }, false),
        new http.RestEndpoint('/api/me', 'get', async (req: Request, res: Response) => {
            await authService.extractInformationFromToken(req, res);
        }, true),
        new http.RestEndpoint('/api/asset_display_system', 'get', async (req: Request, res: Response) => {
            await assetService.getAssetByAssetDisplaySystem(req, res);
        }, true),
        new http.RestEndpoint('/api/shifts', 'get', async (req: Request, res: Response) => {
            await shiftService.getShiftBySite(req, res);
        }, true),
        new http.RestEndpoint('/api/user_sites', 'get', async (req: Request, res: Response) => {
            await userService.getUserByBadge(req, res);
        }, true),
        new http.RestEndpoint('/api/uom_by_site', 'get', async (req: Request, res: Response) => {
            await uomService.getUomBySite(req, res);
        }, true),
        new http.RestEndpoint('/api/workcell', 'get', async (req: Request, res: Response) => {
            await assetService.getAssetByWorkcell(req, res);
        }, true),
        new http.RestEndpoint('/api/machine', 'get', async (req: Request, res: Response) => {
            await assetService.getAssetBySite(req, res);
        }, true),
        new http.RestEndpoint('/api/data', 'get', async (req: Request, res: Response) => {
            await dataService.getShiftData(req, res);
        }, true),
        new http.RestEndpoint('/api/uom_asset', 'get', async (req: Request, res: Response) => {
            await uomService.getUomByAsset(req, res);
        }, true),
        new http.RestEndpoint('/api/intershift_communication', 'get', async (req: Request, res: Response) => {
            await intershiftdataService.getInterShiftDataByAssetProdDayShift(req, res);
        }, true),
        new http.RestEndpoint('/api/intershift_communication', 'put', async (req: Request, res: Response) => {
            await intershiftdataService.putIntershiftData(req, res);
        }, true),
        new http.RestEndpoint('/api/comments_dxh_data', 'get', async (req: Request, res: Response) => {
            await commentdataService.getCommentDataByDxHDataId(req, res);
        }, true),
        new http.RestEndpoint('/api/dxh_new_comment', 'post', async (req: Request, res: Response) => {
            await commentdataService.putCommentData(req, res);
        }, true)
    ],
    router: constants.getUnsecurityRouter(),
    routerToken: constants.getSecurityRouter()
}

initializeApp(appConfig)