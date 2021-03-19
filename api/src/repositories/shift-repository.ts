import { SqlServerStore } from '../configurations/sqlserverstore';


export class ShiftRepository {
    private static readonly table = 'Shift';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getShiftBySite(site: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_Shifts ${site}`);
    }
    public async getShiftBySiteExport(site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT [Shift].[shift_id], [Shift].[shift_code],[Shift].[shift_name],[Shift].[shift_description],
        [Shift].[shift_sequence],[Shift].[start_time],[Shift].[start_time_offset_days],[Shift].[end_time],[Shift].[end_time_offset_days],
        [Shift].[duration_in_minutes],[Shift].[valid_from],[Shift].[valid_to],[Shift].[asset_id], [Asset].[asset_code] as site_code,
        [Shift].[is_first_shift_of_day],[Shift].[status]
        FROM [dbo].[Shift] JOIN [dbo].[Asset] ON [Asset].[asset_id] = [Shift].[asset_id] WHERE [Asset].[asset_id] = ${site_id}
        ORDER BY [Shift].[shift_sequence];`);
    }
    public async putShifts(shift_id: number, shift_code: string, shift_name: string, shift_description: string, shift_sequence: number, start_time: string, start_time_offset_days: number, end_time: string, end_time_offset_days: number, duration_in_minutes: number, valid_from: string, is_first_shift_of_day: boolean, status: string, asset_id: string): Promise<any> {
       return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_Shifts ${shift_id}, '${shift_code}', '${shift_name}', '${shift_description}', ${shift_sequence}, '${start_time}', ${start_time_offset_days}, '${end_time}', ${end_time_offset_days}, ${duration_in_minutes}, '${valid_from}', ${is_first_shift_of_day}, '${status}', ${asset_id}`);
    }
    public async getShiftById(shift_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT shift_id, shift_code, shift_name, shift_description, shift_sequence, start_time,
        start_time_offset_days, end_time, end_time_offset_days, duration_in_minutes, valid_from, valid_to, is_first_shift_of_day, status, 
        asset_id as site_id 
        FROM dbo.Shift 
        WHERE shift_id = ${shift_id}`);
    }
}