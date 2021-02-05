import * as appInsights from 'applicationinsights';
import * as config from './configurations/config.json';
import * as configutils from './configurations/configutils';
import { SqlServerStore } from './configurations/sqlserverstore';
import { initializeApp } from './index';
import { ServerConfig } from './configurations/serverConfig';
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
import { DxHDataRepository } from './repositories/dxhdata-repository';
import { DxHDataService } from './services/dxhdataservice';
import { InterShiftDataRepository } from './repositories/intershiftdata-repository';
import { InterShiftDataService } from './services/intershiftdataservice';
import { DTReasonRepository } from './repositories/dtreason-repository';
import { DTReasonService } from './services/dtreasonservice';
import { CommentDataRepository } from './repositories/comment-repository';
import { CommentDataService } from './services/commentservice';
import { ProductionDataRepository } from './repositories/productiondata-repository';
import { ProductionDataService } from './services/productionservice';
import { OrderDataRepository } from './repositories/orderdata-repository';
import { OrderDataService } from './services/orderdataservice';
import { DataToolService } from './services/datatoolservice';
import { WorkcellRepository } from './repositories/workcell-repository';
import { ProductRepository } from './repositories/product-repository';
import { TagRepository } from './repositories/tag-repository';
import { CommonParametersRepository } from './repositories/commonparameters-repository';
import { UnavailableRepository } from './repositories/unavailable-repository';
import { AssetDisplaySystemRepository } from './repositories/assetdisplaysystem-repository';
import { ScanRepository } from './repositories/scan-repository';
import { ScanService } from './services/scanservice';
import { RoleRepository } from './repositories/role-repository';
import { RoleService } from './services/roleservice';


//INITIALIZE CONFIGURATION OF NODE JS//
const sqlServerStore = new SqlServerStore(config);
const serverConfig = new ServerConfig(sqlServerStore);

//INITIALIZE ALL REPOSITORIES//
const userRepository = new UserRepository(sqlServerStore);
const assetRepository = new AssetRepository(sqlServerStore);
const shiftsRepository = new ShiftRepository(sqlServerStore);
const uomRepository = new UomRepository(sqlServerStore);
const dxhdataRepository = new DxHDataRepository(sqlServerStore);
const intershiftdataRespository = new InterShiftDataRepository(sqlServerStore);
const dtreasonRepository = new DTReasonRepository(sqlServerStore);
const commentDataRepository = new CommentDataRepository(sqlServerStore);
const productionDataRepository = new ProductionDataRepository(sqlServerStore);
const orderDataRepository = new OrderDataRepository(sqlServerStore);
const productRepository = new ProductRepository(sqlServerStore);
const workcellRepository = new WorkcellRepository(sqlServerStore);
const tagRepository = new TagRepository(sqlServerStore);
const commonparametersRepository = new CommonParametersRepository(sqlServerStore);
const unavailableRepository = new UnavailableRepository(sqlServerStore);
const assetdisplaysystemRepository = new AssetDisplaySystemRepository(sqlServerStore);
const scanRepository = new ScanRepository(sqlServerStore);
const roleRepository = new RoleRepository(sqlServerStore);

//INITIALIZE ALL SERVICES//
const authService = new AuthService(userRepository, assetRepository, scanRepository, roleRepository, config);
const assetService = new AssetService(assetRepository);
const shiftService = new ShiftService(shiftsRepository);
const userService = new UserService(userRepository, roleRepository);
const uomService = new UomService(uomRepository, assetRepository);
const dxhdataService = new DxHDataService(dxhdataRepository, assetRepository, userRepository);
const dtreasonService = new DTReasonService(dtreasonRepository, assetRepository, dxhdataRepository);
const intershiftdataService = new InterShiftDataService(intershiftdataRespository, assetRepository, dxhdataRepository);
const commentdataService = new CommentDataService(commentDataRepository, assetRepository, dxhdataRepository);
const productiondataService = new ProductionDataService(productionDataRepository, dxhdataRepository, assetRepository, dtreasonRepository);
const orderdataService = new OrderDataService(orderDataRepository, assetRepository, productRepository);
const dataToolService = new DataToolService(workcellRepository, assetRepository, dtreasonRepository, shiftsRepository,
    tagRepository, commonparametersRepository, uomRepository, unavailableRepository, userRepository, assetdisplaysystemRepository, dxhdataRepository);
const scanService = new ScanService(scanRepository);
const roleService = new RoleService(roleRepository);

const appConfig = {
    appInsightsKey: config.azure_section.appInsights,
    appInsightsConfig: appInsights,
    serviceName: config.app_section.service_name,
    prefix: config.app_section.prefix,
    defaultPort: config.app_section.port,
    healthCheck: () => sqlServerStore.isConnected(),
    options: configutils.getCorsConfiguration(config),
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
        new http.RestEndpoint('/auth/assignRoleToken', 'get', async (req: Request, res: Response) => {
            await authService.assignRoleToken(req, res);
        }, true),
        new http.RestEndpoint('/api/asset_display_system', 'get', async (req: Request, res: Response) => {
            await assetService.getAssetByAssetDisplaySystem(req, res);
        }, true),
        new http.RestEndpoint('/api/shifts', 'get', async (req: Request, res: Response) => {
            await shiftService.getShiftBySite(req, res);
        }, true),
        new http.RestEndpoint('/api/find_sites', 'get', async (req: Request, res: Response) => {
            await userService.findSitesByUser(req, res);
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
            await dxhdataService.getShiftData(req, res);
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
        }, true),
        new http.RestEndpoint('/api/reasons', 'get', async (req: Request, res: Response) => {
            await dtreasonService.getReasons(req, res);
        }, true),
        new http.RestEndpoint('/api/dxh_data', 'get', async (req: Request, res: Response) => {
            await dtreasonService.getDxhData(req, res);
        }, true),
        new http.RestEndpoint('/api/dt_data', 'put', async (req: Request, res: Response) => {
            await dtreasonService.putDtData(req, res);
        }, true),
        new http.RestEndpoint('/api/dt_data_update', 'put', async (req: Request, res: Response) => {
            await dtreasonService.putDtDataUpdate(req, res);
        }, true),
        new http.RestEndpoint('/api/operator_sign_off', 'put', async (req: Request, res: Response) => {
            await dxhdataService.operatorSignoff(req, res);
        }, true),
        new http.RestEndpoint('/api/supervisor_sign_off', 'put', async (req: Request, res: Response) => {
            await dxhdataService.supervisorSignoff(req, res);
        }, true),
        new http.RestEndpoint('/api/production_data', 'put', async (req: Request, res: Response) => {
            await productiondataService.putProductionData(req, res);
        }, true),
        new http.RestEndpoint('/api/scrap_values', 'put', async (req: Request, res: Response) => {
            await productiondataService.putScrapValues(req, res);
        }, true),
        new http.RestEndpoint('/api/order_assembly', 'get', async (req: Request, res: Response) => {
            await orderdataService.getOrderAssembly(req, res);
        }, true),
        new http.RestEndpoint('/api/order_data', 'get', async (req: Request, res: Response) => {
            await orderdataService.getOrderData(req, res);
        }, true),
        new http.RestEndpoint('/api/create_order_data', 'put', async (req: Request, res: Response) => {
            await orderdataService.createOrderData(req, res);
        }, true),
        new http.RestEndpoint('/datatool/import_data', 'post', async (req, res: Response) => {
            await dataToolService.importData(req, res);
        }, true, true),
        new http.RestEndpoint('/datatool/export_data', 'get', async (req: Request, res: Response) => {
            await dataToolService.exportData(req, res);
        }, true),
        new http.RestEndpoint('/api/new_scan', 'put', async (req: Request, res: Response) => {
            await scanService.putScan(req, res);
        }, true),
        new http.RestEndpoint('/api/find_user_information', 'get', async (req: Request, res: Response) => {
            await userService.findUserInformation(req, res);
        }, true),
        new http.RestEndpoint('/api/get_scan', 'get', async (req: Request, res: Response) => {
            await scanService.getScanByAsset(req, res);
        }, true),
        new http.RestEndpoint('/api/get_components_by_role', 'get', async (req: Request, res: Response) => {
            await roleService.getComponentsByRole(req, res);
        }, true)
    ],
    router: configutils.routerWhithoutToken(config),
    routerToken: configutils.routerWithToken(config)
}

initializeApp(appConfig)