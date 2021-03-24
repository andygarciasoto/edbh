import { SqlServerStore } from '../configurations/sqlserverstore';

export class CommonParametersRepository {
    private static readonly table = 'CommonParameters';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getCommonParametersBySite(site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT [Asset].[asset_code] AS site_code,[CommonParameters].[site_name],[CommonParameters].[production_day_offset_minutes],[CommonParameters].[site_timezone],
        [CommonParameters].[ui_timezone],[CommonParameters].[escalation_level1_minutes],[CommonParameters].[escalation_level2_minutes],
        [CommonParameters].[default_target_percent_of_ideal],[CommonParameters].[default_setup_minutes],[CommonParameters].[default_routed_cycle_time],
        [CommonParameters].[setup_lookback_minutes],[CommonParameters].[language],[CommonParameters].[status],
        [CommonParameters].[entered_by],[CommonParameters].[entered_on],[CommonParameters].[last_modified_by],[CommonParameters].[last_modified_on],
        [CommonParameters].[summary_timeout],[CommonParameters].[break_minutes],[CommonParameters].[lunch_minutes],[CommonParameters].[site_prefix]
        FROM [dbo].[CommonParameters] JOIN [dbo].[Asset] ON [CommonParameters].[site_id] = [Asset].[asset_id] AND [CommonParameters].[site_id] = ${site_id}`);
    }
    public async getAssemblyUrl(asset_code: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT assembly_url FROM dbo.CommonParameters CP 
        JOIN dbo.Asset A ON A.asset_code = '${asset_code}'
        AND A.site_code = CP.site_name`);
    }
}