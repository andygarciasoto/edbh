import { SqlServerStore } from '../configurations/sqlserverstore';

export class TagRepository {
    private static readonly table = 'Tag';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getTagBySite(site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT [Tag].[tag_code],[Tag].[tag_name],[Tag].[tag_description],[Asset].[asset_code],[Asset].[site_code],[Tag].[tag_group],[Tag].[datatype],[Tag].[tag_type],
        [Tag].[UOM_code],[Tag].[rollover_point],[Tag].[aggregation],[Tag].[status],[Tag].[entered_by],[Tag].[entered_on],[Tag].[last_modified_by],
        [Tag].[last_modified_on],[Tag].[max_change] FROM [dbo].[Tag] JOIN [dbo].[Asset] ON [Tag].[asset_id] = [Asset].[asset_id] AND [Tag].[site_id] = ${site_id}`);
    }

}