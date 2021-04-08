import { SqlServerStore } from '../configurations/sqlserverstore';

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
        [Asset].[site_code],[Tag].[tag_group],[Tag].[datatype],[Tag].[tag_type],[Tag].[UOM_code],[Tag].[rollover_point],[Tag].[aggregation],[Tag].[status],
        [Tag].[entered_by],[Tag].[entered_on],[Tag].[last_modified_by],[Tag].[last_modified_on],[Tag].[max_change] 
        FROM [dbo].[Tag] JOIN [dbo].[Asset] ON [Tag].[asset_id] = [Asset].[asset_id] AND [Tag].[tag_id] = ${tag_id}`);
    }
    public async getTagByAsset(asset_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT [Tag].[tag_id],[Tag].[tag_code],[Tag].[tag_name],[Tag].[tag_description],[Asset].[asset_code],
        [Asset].[site_code],[Tag].[tag_group],[Tag].[datatype],[Tag].[tag_type],[Tag].[UOM_code],[Tag].[rollover_point],[Tag].[aggregation],[Tag].[status],
        [Tag].[entered_by],[Tag].[entered_on],[Tag].[last_modified_by],[Tag].[last_modified_on],[Tag].[max_change] 
        FROM [dbo].[Tag] JOIN [dbo].[Asset] ON [Tag].[asset_id] = [Asset].[asset_id] AND [Tag].[asset_id] = ${asset_id}`);
    }
    public async putTags(tag_id: number, tag_code: string, tag_name: string, tag_description: string, datatype: string, UOM_code: string, rollover_point: number, aggregation: string, status: string, site_id: number, asset_id: number, max_change: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_Tags ${tag_id}, '${tag_code}', '${tag_name}', '${tag_description}', '${datatype}', '${UOM_code}', ${rollover_point}, '${aggregation}', '${status}', ${site_id}, ${asset_id}, ${max_change}`);
    }
}