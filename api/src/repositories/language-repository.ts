import { SqlServerStore } from '../configurations/sqlserverstore';


export class LanguageRepository {
    private static readonly table = 'Language';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }
    public async getLanguages(): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT language_id, name, translation, status FROM
        dbo.Language`);
    }
}