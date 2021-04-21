import { SqlServerStore } from '../configurations/sqlserverstore';
import _ from 'lodash';

export class TagRepository {
    private static readonly table = 'Tag';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getTagBySite(site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT [Tag].[tag_id],[Tag].[tag_code],[Tag].[tag_name],[Tag].[tag_description],[Asset].[asset_code],
        [Asset].[site_code],[Tag].[tag_group],[Tag].[datatype],[Tag].[tag_type],[Tag].[UOM_code],[Tag].[rollover_point],[Tag].[aggregation],[Tag].[status],
        [Tag].[entered_by],[Tag].[entered_on],[Tag].[last_modified_by],[Tag].[last_modified_on],[Tag].[max_change] 
        FROM [dbo].[Tag] JOIN [dbo].[Asset] ON [Tag].[asset_id] = [Asset].[asset_id] AND [Tag].[site_id] = ${site_id}`);
    }
    public async getTagById(tag_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT [Tag].[tag_id],[Tag].[tag_code],[Tag].[tag_name],[Tag].[tag_description],[Asset].[asset_code],
        [Asset].[site_code],[Asset].[asset_id],[Tag].[tag_group],[Tag].[datatype],[Tag].[tag_type],[Tag].[UOM_code],[Tag].[rollover_point],[Tag].[aggregation],[Tag].[status],
        [Tag].[entered_by],[Tag].[entered_on],[Tag].[last_modified_by],[Tag].[last_modified_on],[Tag].[max_change] 
        FROM [dbo].[Tag] JOIN [dbo].[Asset] ON [Tag].[asset_id] = [Asset].[asset_id] AND [Tag].[tag_id] = ${tag_id}`);
    }
    public async getTagByAsset(asset_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT [Tag].[tag_id],[Tag].[tag_code],[Tag].[tag_name],[Tag].[tag_description],[Asset].[asset_code],
        [Asset].[site_code],[Tag].[tag_group],[Tag].[datatype],[Tag].[tag_type],[Tag].[UOM_code],[Tag].[rollover_point],[Tag].[aggregation],[Tag].[status],
        [Tag].[entered_by],[Tag].[entered_on],[Tag].[last_modified_by],[Tag].[last_modified_on],[Tag].[max_change] 
        FROM [dbo].[Tag] JOIN [dbo].[Asset] ON [Tag].[asset_id] = [Asset].[asset_id] AND [Tag].[asset_id] = ${asset_id}`);
    }
    public async findTagsByFilter(parameters: any[]): Promise<any> {
        const query: string = `SELECT T.tag_id,T.tag_code,T.tag_name,T.tag_description,A.asset_code,A.asset_id,
        A.site_code,T.tag_group,T.datatype,T.tag_type,T.UOM_code,T.rollover_point,T.aggregation,T.status,
        T.entered_by,T.entered_on,T.last_modified_by,T.last_modified_on,T.max_change 
        FROM dbo.Tag AS T JOIN dbo.Asset AS A ON T.asset_id = A.asset_id
        ${_.isEmpty(parameters) ? '' :
                'WHERE ' + _.join(parameters, ' AND ')
            }`;
        return await this.sqlServerStore.ExecuteQuery(query);
    }
    public async putTags(tag_id: number, tag_code: string, tag_name: string, tag_description: string, datatype: string, UOM_code: string, rollover_point: number, aggregation: string, status: string, site_id: number, asset_id: number, max_change: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_Tags ${tag_id}, N'${tag_code}', N'${tag_name}', N'${tag_description}', '${datatype}', N'${UOM_code}', ${rollover_point}, '${aggregation}', '${status}', ${site_id}, ${asset_id}, ${max_change}`);
    }
}