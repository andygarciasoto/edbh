import { SqlServerStore } from '../configurations/sqlserverstore';


export class UserRepository {
    private static readonly table = 'TFDUsers';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async findUserByBadgeAndMachine(badge: string, machine: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_User_By_Clocknumber_Machine '${badge}', '${machine}'`);
    }

    public async findUserByUsernameAndMachine(username: string, machine: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_User_By_Username_Machine '${username}', '${machine}'`);
    }

    public async findUserByBadgeAndAsset(badge: string, asset_code: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_User_By_Clocknumber_Asset '${badge}', '${asset_code}'`);
    }

    public async findUserBySite(site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT [Badge],[Username],[First_Name],[Last_Name],[Role],[Asset].[site_code] FROM [dbo].[TFDUsers] JOIN [dbo].[Asset] 
        ON [TFDUsers].[Site] = [Asset].[asset_id] AND [TFDUsers].[Site] = ${site_id}`);
    }

    public async findUserByBadge(badge: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_Users_By_Badge '${badge}'`);
    }

    public async findUserById(user_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_User_By_Id ${user_id}`);
    }

    public async findUserInformation(badge: string, machine: string, asset_id: number, site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_User_Information '${badge}', '${machine}', ${asset_id}, ${site_id}`);
    }

}