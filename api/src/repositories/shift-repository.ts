import { SqlServerStore } from '../configurations/sqlserverstore';
import _ from 'lodash';


export class ShiftRepository {
    private static readonly table = 'Shift';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getShiftBySite(site: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_Shifts ${site}`);
    }
    public async putShifts(shift_id: number, shift_code: string, shift_name: string, shift_description: string, shift_sequence: number, start_time: string, start_time_offset_days: number, end_time: string, end_time_offset_days: number, duration_in_minutes: number, valid_from: string, is_first_shift_of_day: boolean, status: string, asset_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_Shifts ${shift_id}, '${shift_code}', '${shift_name}', '${shift_description}', ${shift_sequence}, '${start_time}', ${start_time_offset_days}, '${end_time}', ${end_time_offset_days}, ${duration_in_minutes}, '${valid_from}', ${is_first_shift_of_day}, '${status}', ${asset_id}`);
    }
    public async findShiftByFilter(parameters: any[]): Promise<any> {
        const query = `SELECT [S].[shift_id], [S].[shift_code],[S].[shift_name],[S].[shift_description], [S].[shift_sequence],
        CONVERT(NVARCHAR, [S].[start_time]) AS [start_time], [S].[start_time_offset_days], CONVERT(NVARCHAR, [S].[end_time]) AS [end_time], [S].[end_time_offset_days],
        [S].[duration_in_minutes],[S].[valid_from],[S].[valid_to],[S].[asset_id], [A].[asset_code] as site_code,
        [S].[is_first_shift_of_day],[S].[status]
        FROM [dbo].[Shift] AS S
        INNER JOIN [dbo].[Asset] AS A ON [A].[asset_id] = [S].[asset_id]
        ${_.isEmpty(parameters) ? '' :
                'WHERE ' + _.join(parameters, ' AND ')
            }
        ORDER BY [S].[shift_sequence];`;
        return await this.sqlServerStore.ExecuteQuery(query);
    }
}