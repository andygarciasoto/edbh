import { SqlServerStore } from '../configurations/sqlserverstore';


export class UserRepository {
    private static readonly table = 'TFDUsers';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async findUserByUsernameAndMachine(username: string, machine: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_User_By_Username_Machine '${username}', '${machine}'`);
    }

    public async findUserBySite(site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT [Badge],[Username],[First_Name],[Last_Name],[Role],[role_id],[Asset].[site_code] FROM [dbo].[TFDUsers] JOIN [dbo].[Asset] 
        ON [TFDUsers].[Site] = [Asset].[asset_id] AND [TFDUsers].[Site] = ${site_id}`);
    }

    public async findSitesByUser(badge: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_Sites_By_User '${badge}'`);
    }

    public async findUserInformation(badge: string, machine: string, asset_id: number, site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_User_Information N'${badge}', '${machine}', ${asset_id}, ${site_id}`);
    }

}