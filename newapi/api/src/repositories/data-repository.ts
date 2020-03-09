import { SqlServerStore } from '../configurations/sqlserverstore';

export class DataRepository {

    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getShiftData(asset_id: number, date: string, shift: string, site: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_Shift_Data ${asset_id},'${date}',${shift}, ${site}`);
    }
}