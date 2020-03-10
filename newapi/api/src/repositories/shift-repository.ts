import { SqlServerStore } from '../configurations/sqlserverstore';


export class ShiftRepository {
    private static readonly table = 'Shift';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getShiftBySite(site: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.sp_getshifts_new_1 ${site}`);
    }


}