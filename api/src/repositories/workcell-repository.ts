import { SqlServerStore } from '../configurations/sqlserverstore';

export class WorkcellRepository {
    private static readonly table = 'Workcell';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getWorkcellBySite(site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT DISTINCT W.[workcell_name], W.[workcell_description], W.[entered_by], W.[entered_on], W.[last_modified_by], W.[last_modified_on] 
        FROM dbo.Asset A1 JOIN dbo.Asset A2 ON A1.site_code = A2.asset_code AND A2.asset_id = ${site_id} JOIN dbo.Workcell W ON A1.grouping1 = W.workcell_id`);
    }

}