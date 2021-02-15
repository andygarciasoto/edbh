import { SqlServerStore } from '../configurations/sqlserverstore';


export class AssetRepository {
    private static readonly table = 'Asset';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getAssetByCode(asset_code: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_Asset_By_Code '${asset_code}'`);
    }

    public async getAssetByAssetDisplaySystem(display_system_name: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_AssetDisplaySystem '${display_system_name}'`);
    }

    public async getAssetBySite(site: number, level: string, automation_level: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_Asset '${level}','All',${site}`);
    }

    public async getAssetByWorkcell(station: string, site: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_Workcell '${station}', ${site}`);
    }

    public async getAssetBySiteExport(site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT A.[asset_id], A.[asset_code], A.[asset_name], A.[asset_description], A.[asset_level], A.[site_code], A.[parent_asset_code], A.[value_stream], 
        A.[automation_level], A.[include_in_escalation], W.workcell_name AS [grouping1], A.[grouping2], A.[grouping3], A.[grouping4], A.[grouping5], A.[status], 
        A.[target_percent_of_ideal], A.[entered_by], A.[entered_on], A.[last_modified_by], A.[last_modified_on], A.[is_multiple] FROM [dbo].[Asset] AS A LEFT JOIN [dbo].[Workcell] 
        AS W ON A.grouping1 = W.workcell_id WHERE [site_code] = (SELECT asset_code FROM [dbo].[Asset] WHERE asset_id = ${site_id}) ORDER BY A.asset_id`);
    }

}