import { SqlServerStore } from '../configurations/sqlserverstore';
import _ from 'lodash';

export class AssetDisplaySystemRepository {
    private static readonly table = 'AssetDisplaySystem';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }
    
    public async findDisplaysByFilter(parameters: any[]): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT AD.assetdisplaysystem_id, AD.displaysystem_name, AD.status, A.asset_code, A2.asset_code as site_code, A.asset_id
        FROM dbo.AssetDisplaySystem AD
        JOIN dbo.Asset A ON AD.asset_id = A.asset_id
        JOIN dbo.Asset A2 ON AD.site_id = A2.asset_id
        ${_.isEmpty(parameters) ? '' :
                'WHERE ' + _.join(parameters, ' AND ')
            }`);
    }
    public async putAssetDisplaySystem(assetdisplaysystem_id: number, asset_id: number, displaysystem_name: string, site_id: number, status: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_AssetDisplaySystem ${assetdisplaysystem_id}, ${asset_id}, N'${displaysystem_name}', ${site_id}, '${status}'`);
    }
}