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
    public async getAssetsUnavailableCode(unavailable_code: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_Assets_UnavailableCode N'${unavailable_code}'`);
    }
}