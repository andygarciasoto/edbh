import { SqlServerStore } from '../configurations/sqlserverstore';

export class UnavailableRepository {
    private static readonly table = 'Unavailable';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getUnavailableBySite(site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT [Unavailable].[unavailable_code],[Unavailable].[unavailable_name],[Unavailable].[unavailable_description],[Unavailable].[start_time],
        [Unavailable].[end_time],[Unavailable].[duration_in_minutes],[Unavailable].[valid_from],[Unavailable].[valid_to],[Asset].[asset_code],[Asset].[site_code],
        [Unavailable].[status],[Unavailable].[entered_by],[Unavailable].[entered_on],[Unavailable].[last_modified_by],[Unavailable].[last_modified_on]
        FROM [dbo].[Unavailable] JOIN [dbo].[Asset] ON [Unavailable].[asset_id] = [Asset].[asset_id] AND [Unavailable].[site_id] = ${site_id}`);
    }
    public async getUniqueUnavailableBySite(site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT unavailable_code, MIN(unavailable_name) as unavailable_name, MIN(unavailable_description) as unavailable_description, MIN(start_time) as start_time,
        MIN(end_time) as end_time, MIN(duration_in_minutes) as duration_in_minutes, MIN(status) as status FROM dbo.Unavailable
        WHERE site_id = ${site_id}
        GROUP BY unavailable_code
        ORDER BY unavailable_code`);
    }
}