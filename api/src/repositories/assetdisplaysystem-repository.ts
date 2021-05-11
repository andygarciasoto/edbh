import { SqlServerStore } from '../configurations/sqlserverstore';

export class AssetDisplaySystemRepository {
    private static readonly table = 'AssetDisplaySystem';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getAssetDisplaySystemBySite(site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT AD.assetdisplaysystem_id, AD.displaysystem_name, AD.status, A.asset_code, A2.asset_code as site_code
        FROM dbo.AssetDisplaySystem AD
        JOIN dbo.Asset A ON AD.asset_id = A.asset_id
        JOIN dbo.Asset A2 ON AD.site_id = A2.asset_id
        WHERE AD.site_id = ${site_id}`);
    }
    public async getAssetDisplaySystemById(assetdisplaysystem_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT AD.assetdisplaysystem_id, AD.displaysystem_name, AD.status, A.asset_code, A2.asset_code as site_code
        FROM dbo.AssetDisplaySystem AD
        JOIN dbo.Asset A ON AD.asset_id = A.asset_id
        JOIN dbo.Asset A2 ON AD.site_id = A2.asset_id
        WHERE AD.assetdisplaysystem_id = ${assetdisplaysystem_id}`);
    }
    public async putAssetDisplaySystem(assetdisplaysystem_id: number, asset_id: number, displaysystem_name: string, site_id: number, status: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_AssetDisplaySystem ${assetdisplaysystem_id}, ${asset_id}, '${displaysystem_name}', ${site_id}, '${status}'`);
     }
}