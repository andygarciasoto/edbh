import { SqlServerStore } from '../configurations/sqlserverstore';


export class SiteRepository {
    private static readonly table = 'Site';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }
    public async getRowsBySite(site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_Rows_By_Site ${site_id}`);
    }
    public async getParkerSites(): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT asset_name, asset_level, asset_id FROM Asset WHERE asset_level = 'SITE' AND status = 'Active'`);
    }
}