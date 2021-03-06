import { SqlServerStore } from '../configurations/sqlserverstore';
import _ from 'lodash';
export class UserRepository {
    private static readonly table = 'TFDUsers';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async findUserByUsernameAndMachine(username: string, machine: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_User_By_Username_Machine N'${username}', N'${machine}'`);
    }
    public async findUserByFilter(parameters: any[]): Promise<any> {
        const query: string = `SELECT TFD.Badge, TFD.Username, TFD.First_Name, TFD.Last_Name, R.name AS Role, TFD.role_id, TFD.status,
        E.escalation_name, E.escalation_level, E.escalation_hours, A.site_code
        FROM dbo.TFDUsers TFD 
        INNER JOIN dbo.Role R ON TFD.role_id = R.role_id
        INNER JOIN dbo.Asset A ON TFD.Site = A.asset_id
        LEFT JOIN dbo.Escalation E ON TFD.escalation_id = E.escalation_id
        ${_.isEmpty(parameters) ? '' :
                'WHERE ' + _.join(parameters, ' AND ')
            }
        ORDER BY TFD.Last_Name, TFD.First_Name`;
        return await this.sqlServerStore.ExecuteQuery(query);
    }
    public async putUser(badge: string, username: string, first_name: string, last_name: string, role_id: number, status: string, site_id: number, escalation_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec spLocal_EY_DxH_Put_Users N'${badge}', N'${username}', N'${first_name}', N'${last_name}', ${role_id}, N'${status}', ${site_id}, ${escalation_id}`);
    }
    public async findSitesByUser(badge: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_Sites_By_User N'${badge}'`);
    }
    public async findUserInformation(badge: string, machine: string, asset_id: number, site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_User_Information N'${badge}', N'${machine}', ${asset_id}, ${site_id}`);
    }
}
