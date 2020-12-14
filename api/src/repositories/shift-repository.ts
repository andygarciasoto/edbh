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
        return await this.sqlServerStore.ExecuteQuery(`SELECT [Shift].[shift_code],[Shift].[shift_name],[Shift].[shift_description],[Shift].[shift_sequence],[Shift].[start_time],
        [Shift].[start_time_offset_days],[Shift].[end_time],[Shift].[end_time_offset_days],[Shift].[duration_in_minutes],[Shift].[valid_from],[Shift].[valid_to],[Asset].[asset_code],
        [Shift].[team_code],[Shift].[is_first_shift_of_day],[Shift].[status],[Shift].[entered_by],[Shift].[entered_on],[Shift].[last_modified_by],[Shift].[last_modified_on]
        FROM [dbo].[Shift] JOIN [dbo].[Asset] ON [Asset].[asset_id] = [Shift].[asset_id] WHERE [Asset].[asset_id] = ${site_id};`);
    }

}