import { SqlServerStore } from '../configurations/sqlserverstore';

export class AssetDisplaySystemRepository {
    private static readonly table = 'AssetDisplaySystem';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getAssetDisplaySystemBySite(site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT [DTReason].[dtreason_code],[DTReason].[dtreason_name],[DTReason].[dtreason_description],[DTReason].[dtreason_category],
        [Asset].[asset_code],[DTReason].[reason1],[DTReason].[reason2],[DTReason].[status],[DTReason].[type],[DTReason].[level],
		A2.asset_code as site_code FROM [dbo].[DTReason] JOIN [dbo].[Asset] ON [DTReason].[asset_id] = [Asset].[asset_id]
		JOIN dbo.Asset A2 ON ${site_id} = A2.asset_id
        `);
    }
}