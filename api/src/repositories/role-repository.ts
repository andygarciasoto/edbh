import { SqlServerStore } from '../configurations/sqlserverstore';


export class RoleRepository {
    private static readonly table = 'Role';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getComponentsByRole(role_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_Components_By_Role ${role_id}, ''`);
    }
}