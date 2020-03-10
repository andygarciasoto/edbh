import { SqlServerStore } from '../configurations/sqlserverstore';

export class DTReasonRepository {
    private static readonly table = 'DTReason';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getTimelostReasons(asset_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_DTReason '${asset_id}'`);
    }  
    public async getTimelostDxhData(dxh_data_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_DTData_By_DxHData_Id '${dxh_data_id}'`);
    }
    public async putDtDataByClockNumber(dxh_data_id: number, dt_reason_id: number, dt_minutes: number, clocknumber: string, timestamp: string, update: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_DTData ${dxh_data_id}, ${dt_reason_id}, ${dt_minutes}, '${clocknumber}', Null, Null, '${timestamp}', ${update}`);
    }
    public async putDtDataByName(dxh_data_id: number, dt_reason_id: number, dt_minutes: number, first_name: string, last_name: string, timestamp: string, update: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_DTData ${dxh_data_id}, ${dt_reason_id}, ${dt_minutes}, Null, '${first_name}', '${last_name}', '${timestamp}', ${update}`);
    }
}


