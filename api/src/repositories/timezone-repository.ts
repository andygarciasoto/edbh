import { SqlServerStore } from '../configurations/sqlserverstore';


export class TimezoneRepository {
    private static readonly table = 'Timezone';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }
    public async getTimezones(): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT timezone_id, name, ui_timezone, sql_timezone, status FROM
        dbo.Timezone`);
    }
}