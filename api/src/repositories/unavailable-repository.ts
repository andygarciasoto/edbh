import { SqlServerStore } from '../configurations/sqlserverstore';
import _ from 'lodash';

export class UnavailableRepository {
    private static readonly table = 'Unavailable';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getUnavailableBySite(site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT [Unavailable].[unavailable_id], [Unavailable].[unavailable_code],[Unavailable].[unavailable_name],
        [Unavailable].[unavailable_description],[Unavailable].[start_time],[Unavailable].[end_time],[Unavailable].[duration_in_minutes],[Unavailable].[valid_from],
        [Unavailable].[valid_to],[Asset].[asset_code],[Asset].[site_code],[Unavailable].[status],[Unavailable].[entered_by],[Unavailable].[entered_on],
        [Unavailable].[last_modified_by],[Unavailable].[last_modified_on]
        FROM [dbo].[Unavailable] JOIN [dbo].[Asset] ON [Unavailable].[asset_id] = [Asset].[asset_id] AND [Unavailable].[site_id] = ${site_id}`);
    }
    public async getUnavailableByAsset(asset_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT [Unavailable].[unavailable_id], [Unavailable].[unavailable_code],[Unavailable].[unavailable_name],
        [Unavailable].[unavailable_description],[Unavailable].[start_time],[Unavailable].[end_time],[Unavailable].[duration_in_minutes],[Unavailable].[valid_from],
        [Unavailable].[valid_to],[Asset].[asset_code],[Asset].[site_code],[Unavailable].[status],[Unavailable].[entered_by],[Unavailable].[entered_on],
        [Unavailable].[last_modified_by],[Unavailable].[last_modified_on]
        FROM [dbo].[Unavailable] JOIN [dbo].[Asset] ON [Unavailable].[asset_id] = [Asset].[asset_id] AND [Unavailable].[asset_id] = ${asset_id}`);
    }
    public async getUnavailableById(unavailable_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT [Unavailable].[unavailable_id], [Unavailable].[unavailable_code],[Unavailable].[unavailable_name],
        [Unavailable].[unavailable_description],[Unavailable].[start_time],[Unavailable].[end_time],[Unavailable].[duration_in_minutes],[Unavailable].[valid_from],
        [Unavailable].[valid_to],[Asset].[asset_code],[Asset].[site_code],[Unavailable].[status],[Unavailable].[entered_by],[Unavailable].[entered_on],
        [Unavailable].[last_modified_by],[Unavailable].[last_modified_on]
        FROM [dbo].[Unavailable] JOIN [dbo].[Asset] ON [Unavailable].[asset_id] = [Asset].[asset_id] AND [Unavailable].[unavailable_id] = ${unavailable_id}`);
    }
    public async getUniqueUnavailableBySite(site_id: number, asset_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT unavailable_code, MIN(unavailable_name) as unavailable_name, MIN(unavailable_description) as unavailable_description, MIN(start_time) as start_time,
        MIN(end_time) as end_time, MIN(duration_in_minutes) as duration_in_minutes, MIN(status) as status,
		SUM(CASE WHEN asset_id = ${asset_id} THEN 1 ELSE 0 END) as COUNT
        FROM dbo.Unavailable
        WHERE site_id = ${site_id}
        GROUP BY unavailable_code
        HAVING SUM(CASE WHEN asset_id = ${asset_id} THEN 1 ELSE 0 END) = 0
        ORDER BY unavailable_code`);
    }
    public async findUnavailableByFilter(parameters: any[]): Promise<any> {
        const query: string = `SELECT [U].[unavailable_code], [U].[unavailable_name], [U].[unavailable_description], CONVERT(NVARCHAR, [U].[start_time]) AS [start_time], 
        CONVERT(NVARCHAR, [U].[end_time]) AS [end_time], [U].[duration_in_minutes], [U].[status], COUNT([U].[asset_id]) AS asset_count
        FROM [dbo].[Unavailable] AS U
        ${_.isEmpty(parameters) ? '' :
                'WHERE ' + _.join(parameters, ' AND ')
            }
        GROUP BY U.unavailable_code, U.unavailable_name, U.unavailable_description, U.start_time, U.end_time, U.duration_in_minutes, U.status`;
        return await this.sqlServerStore.ExecuteQuery(query);
    }
    public async putUnavailable(unavailable_code: string, unavailable_name: string, unavailable_description: string, start_time: string, end_time: string,
        duration_in_minutes: number, valid_from: string, status: string, asset_level: string, asset_id: number, site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_Unavailable N'${unavailable_code}', N'${unavailable_name}', N'${unavailable_description}', '${start_time}', '${end_time}', ${duration_in_minutes}, '${valid_from}', '${status}', '${asset_level}', ${asset_id},  ${site_id}`);
    }
}