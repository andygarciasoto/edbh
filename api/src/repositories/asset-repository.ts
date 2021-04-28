import { SqlServerStore } from '../configurations/sqlserverstore';
import _ from 'lodash';


export class AssetRepository {
    private static readonly table = 'Asset';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }
    public async getAssetByCode(asset_code: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_Asset_By_Code N'${asset_code}'`);
    }
    public async getAssetByAssetDisplaySystem(display_system_name: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_AssetDisplaySystem N'${display_system_name}'`);
    }
    public async getAssetBySite(site: number, level: string, automation_level: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_Asset '${level}','All',${site}`);
    }
    public async getAssetByWorkcell(station: string, site: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_Workcell N'${station}', ${site}`);
    }
    public async getAssetBySiteExport(site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT A.[asset_id], A.[asset_code], A.[asset_name], A.[asset_description], A.[asset_level], 
        A.[site_code], A.[parent_asset_code], A.[value_stream], A.[automation_level], A.[include_in_escalation], W.workcell_name AS [grouping1], 
        A.[grouping2], A.[grouping3], A.[grouping4], A.[grouping5], A.[status], A.[target_percent_of_ideal], A.[is_multiple], A.[is_dynamic]
        FROM [dbo].[Asset] AS A 
        LEFT JOIN [dbo].[Workcell] 
        AS W ON A.grouping1 = W.workcell_id 
		INNER JOIN [dbo].[Asset]
		AS A2 ON ${site_id} = A2.asset_id
		WHERE A.site_code = A2.asset_code
        ORDER BY A.asset_id`);
    }
    public async findAssetsByFilter(parameters: any[]): Promise<any> {
        const query: string = `SELECT A.[asset_id], A.[asset_code], A.[asset_name], A.[asset_description], A.[asset_level], 
        A.[site_code], A.[parent_asset_code], A.[value_stream], A.[automation_level], A.[include_in_escalation], A.grouping1 AS workcell_id, W.workcell_name AS [grouping1], 
        A.[grouping2], A.[grouping3], A.[grouping4], A.[grouping5], A.[status], A.[target_percent_of_ideal], A.[is_multiple], A.[is_dynamic]
        FROM [dbo].[Asset] AS A
        LEFT JOIN [dbo].[Workcell] AS W ON A.grouping1 = W.workcell_id 
        INNER JOIN [dbo].[Asset] AS A2 ON A.site_code = A2.asset_code
        ${_.isEmpty(parameters) ? '' :
                'WHERE ' + _.join(parameters, ' AND ')
            }
            ORDER BY A.asset_level, A.asset_name`;
        return await this.sqlServerStore.ExecuteQuery(query);
    }
    public async putAsset(asset_id: number, asset_code: string, asset_name: string, asset_description: string, asset_level: string, site_code: string, parent_asset_code: string, automation_level: string, include_in_escalation: boolean, grouping1: string, grouping2: string, grouping3: string, grouping4: string, grouping5: string, status: string, target_percent_of_ideal: number, is_multiple: boolean, is_dynamic: boolean, badge: string, value_stream: string, site_prefix: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_Asset ${asset_id}, '${asset_code}', N'${asset_name}', N'${asset_description}', '${asset_level}', '${site_code}', '${parent_asset_code}', '${automation_level}', ${include_in_escalation}, '${grouping1}', '${grouping2}', '${grouping3}', '${grouping4}', '${grouping5}', '${status}', ${target_percent_of_ideal}, ${is_multiple}, ${is_dynamic}, '${badge}', '${value_stream}', N'${site_prefix}'`);
    }
    public async getAssetsWithoutTag(site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT A.asset_code, A.asset_name, A.asset_description, A.asset_level, A.site_code, A.parent_asset_code,
        A.value_stream, A.automation_level, A.include_in_escalation, A.grouping1 as 'workcell_id', A.status,
        A.target_percent_of_ideal, A.is_multiple, A.is_dynamic, T.tag_code
        FROM dbo.Asset A
        INNER JOIN dbo.Asset A2
        ON ${site_id} = A2.asset_id
        AND A2.asset_code = A.site_code
        AND A.asset_level = 'Cell'
        LEFT JOIN dbo.Tag T
        ON A.asset_id = T.asset_id
        AND T.tag_code = NULL`);
    }
}