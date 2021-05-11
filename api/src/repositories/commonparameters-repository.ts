import { SqlServerStore } from '../configurations/sqlserverstore';

export class CommonParametersRepository {
    private static readonly table = 'CommonParameters';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getCommonParametersBySite(site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT A.asset_code AS site_code, CP.site_name, CP.production_day_offset_minutes, T.name as timezone, 
        T.sql_timezone as site_timezone, T.ui_timezone, CP.default_target_percent_of_ideal, CP.default_setup_minutes, CP.default_routed_cycle_time, 
		CP.inactive_timeout_minutes, L.name as language, T.timezone_id, L.language_id, L.translation as site_language, CP.status, CP.entered_by, 
		CP.entered_on, CP.last_modified_by, CP.last_modified_on, CP.summary_timeout, CP.break_minutes, CP.lunch_minutes, CP.site_prefix, CP.assembly_url
        FROM dbo.CommonParameters CP
        JOIN dbo.Timezone T ON CP.timezone_id = T.timezone_id
        JOIN dbo.Language L ON CP.language_id = L.language_id
        JOIN dbo.Asset A ON CP.site_id = A.asset_id
        AND CP.site_id = ${site_id}`);
    }
    public async getAssemblyUrl(asset_code: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT assembly_url FROM dbo.CommonParameters CP 
        JOIN dbo.Asset A ON A.asset_code = '${asset_code}'
        AND A.site_code = CP.site_name`);
    }
    public async putCommonParameter(site_id: number, site_name: string, production_day_offset_minutes: number, default_target_percent_of_ideal: number, default_setup_minutes: number, default_routed_cycle_time: number, inactive_timeout_minutes: number, status: string, summary_timeout: number, break_minutes: number, lunch_minutes: number, site_prefix: string, assembly_url: string, timezone_id: number, language_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_CommonParameters ${site_id}, '${site_name}', ${production_day_offset_minutes}, ${default_target_percent_of_ideal}, ${default_setup_minutes}, ${default_routed_cycle_time}, ${inactive_timeout_minutes}, '${status}', ${summary_timeout}, ${break_minutes}, ${lunch_minutes}, '${site_prefix}', '${assembly_url}', ${timezone_id}, ${language_id}`);
    }
}