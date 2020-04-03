import { SqlServerStore } from '../configurations/sqlserverstore';

export class AssetDisplaySystemRepository {
    private static readonly table = 'AssetDisplaySystem';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getAssetDisplaySystemBySite(site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT [AssetDisplaySystem].[displaysystem_name], [AssetDisplaySystem].[status], [Asset].[asset_code], 
        [AssetDisplaySystem].[entered_by], [AssetDisplaySystem].[entered_on], [AssetDisplaySystem].[last_modified_by], [AssetDisplaySystem].[last_modified_on] 
        FROM [dbo].[AssetDisplaySystem] JOIN [dbo].[Asset] ON [AssetDisplaySystem].[asset_id] = [Asset].[asset_id] WHERE 
        [Asset].[site_code] = (SELECT asset_code FROM [dbo].[Asset] WHERE asset_id = ${site_id})`);
    }

}