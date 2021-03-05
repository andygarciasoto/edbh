import { SqlServerStore } from '../configurations/sqlserverstore';

export class AssetDisplaySystemRepository {
    private static readonly table = 'AssetDisplaySystem';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getAssetDisplaySystemBySite(site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT AD.displaysystem_name, AD.status, A.asset_code, A2.asset_code as site_code
        FROM dbo.AssetDisplaySystem AD
        JOIN dbo.Asset A ON AD.asset_id = A.asset_id
        JOIN dbo.Asset A2 ON AD.site_id = A2.asset_id
        WHERE AD.site_id = ${​​site_id}​​`);
    }
}