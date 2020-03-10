import { SqlServerStore } from '../configurations/sqlserverstore';


export class InterShiftDataRepository {
    
    private static readonly table = 'InterShiftData';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getInterShiftDataByAssetProdDayShift(asset_id: number, production_day: string, shift_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_InterShiftData_new_1 ${asset_id}, '${production_day}', ${shift_id}`);
    }
}