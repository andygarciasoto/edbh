import { SqlServerStore } from '../configurations/sqlserverstore';

export class WorkcellRepository {
    private static readonly table = 'Workcell';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getWorkcellBySite(site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT W.[workcell_name], W.[workcell_description], A.[asset_code] as site_code
        FROM dbo.Workcell W 
        INNER JOIN dbo.Asset A ON A.asset_id = W.site_id
        WHERE W.site_id = ${site_id}`);
    }
}