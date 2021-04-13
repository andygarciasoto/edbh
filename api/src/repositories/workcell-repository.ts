import { SqlServerStore } from '../configurations/sqlserverstore';
import _ from 'lodash';

export class WorkcellRepository {
    private static readonly table = 'Workcell';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }
    public async findWorkByFilter(parameters: any[]): Promise<any> {
        const query: string = `SELECT W.[workcell_id], W.[workcell_name], W.[workcell_description], 
        A.[asset_code] as site_code
        FROM dbo.Workcell W 
        INNER JOIN dbo.Asset A ON A.asset_id = W.site_id
        ${_.isEmpty(parameters) ? '' :
                'WHERE ' + _.join(parameters, ' AND ')
            }`;
        return await this.sqlServerStore.ExecuteQuery(query);
    }
    public async putWorkcell(workcell_id: number, workcell_name: string, workcell_description: string, site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_Workcell ${workcell_id}, N'${workcell_name}', N'${workcell_description}', ${site_id}`);
    }
}