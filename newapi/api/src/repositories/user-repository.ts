import { SqlServerStore } from '../configurations/sqlserverstore';


export class UserRepository {
    private static readonly table = 'TFDUsers';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async findUserByBadgeAndMachine(badge: string, machine: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.sp_clocknumberlogin '${badge}', '${machine}'`);
    }

    public async findUserByUsernameAndMachine(username: string, machine: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.sp_usernamelogin '${username}', '${machine}'`);
    }

    public async findUserByBadgeAndAsset(badge: string, asset_code: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.sp_clocknumber_asset_login '${badge}', '${asset_code}'`);
    }

    public async findUserBySite(site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT [Badge],[Username],[First_Name],[Last_Name],[Role],[Asset].[site_code] FROM [dbo].[TFDUsers] JOIN [dbo].[Asset] 
        ON [TFDUsers].[Site] = [Asset].[asset_id] AND [TFDUsers].[Site] = ${site_id}`);
    }

    public async findUserByBadge(badge: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.sp_get_users_by_badge '${badge}'`);
    }

    public async findUserById(user_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.sp_user_id_login ${user_id}`);
    }

}