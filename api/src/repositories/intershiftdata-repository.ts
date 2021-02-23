import { SqlServerStore } from '../configurations/sqlserverstore';


export class InterShiftDataRepository {

    private static readonly table = 'InterShiftData';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getInterShiftDataByAssetProdDayShift(site_id: number, asset_id: number, start_date_time: string, end_date_time: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_InterShiftData ${site_id}, ${asset_id}, '${start_date_time}', '${end_date_time}'`);
    }

    public async putInterShiftDataByClocknumber(asset_id: number, comment: string, clocknumber: string, update: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_InterShiftData ${asset_id}, N'${comment}', N'${clocknumber}', Null, Null, ${update}`);
    }

    public async putInterShiftDataByUsername(asset_id: number, comment: string, first_name: string, last_name: string, update: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_InterShiftData ${asset_id}, N'${comment}', Null, N'${first_name}', N'${last_name}', ${update}`);
    }
}