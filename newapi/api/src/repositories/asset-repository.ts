import { SqlServerStore } from '../configurations/sqlserverstore';


export class AssetRepository {
    private static readonly table = 'Asset';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getAssetByCode(asset_code: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_Asset_By_Code_new_1 '${asset_code}'`);
    }

    public async getAssetByAssetDisplaySystem(display_system_name: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_AssetDisplaySystem_new_1 '${display_system_name}'`);
    }

    public async getAssetBySite(site: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_Asset 'Cell','All',${site}`);
    }

    public async getAssetByWorkcell(station: string, site: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.sp_get_workcell '${station}', ${site}`);
    }

}