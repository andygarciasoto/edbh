import { SqlServerStore } from '../configurations/sqlserverstore';


export class UserRepository {
    private static readonly table = 'TFDUsers';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async findUserByBadgeAndMachine(badge: string, machine: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.sp_clocknumberlogin_new_1 '${badge}', '${machine}'`);
    }

    public async findUserByUsernameAndMachine(username: string, machine: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.sp_usernamelogin_new_1 '${username}', '${machine}'`);
    }

    // public async findUserByBadge(badge: string): Promise<any> {
    //     return await this.sqlServerStore.ExecuteQuery(`exec dbo.sp_get_users_by_badge_new_1 '${badge}'`);
    // }

}