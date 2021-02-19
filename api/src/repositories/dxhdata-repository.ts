import { SqlServerStore } from '../configurations/sqlserverstore';

export class DxHDataRepository {

    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getShiftData(asset_id: number, date: string, shift: string, site: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_Shift_Data ${asset_id},'${date}',${shift}, ${site}`);
    }

    public async getDxHDataId(asset_id: number, row_timestamp: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_DxHDataId ${asset_id}, '${row_timestamp}', 0`);
    }

    public async putOperatorSignOffByClocknumber(dxh_data_id: number, clocknumber: string, timestamp: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_OperatorSignOff ${dxh_data_id}, N'${clocknumber}', Null, Null, '${timestamp}'`);
    }

    public async putOperatorSignOffByUsername(dxh_data_id: number, first_name: string, last_name: string, timestamp: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_OperatorSignOff ${dxh_data_id}, Null, N'${first_name}', N'${last_name}', '${timestamp}'`);
    }

    public async putSupervisorSignOffByClocknumber(dxh_data_id: number, clocknumber: string, timestamp: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_SupervisorSignOff ${dxh_data_id}, N'${clocknumber}', Null, Null, '${timestamp}'`);
    }

    public async putSupervisorSignOffByUsername(dxh_data_id: number, first_name: string, last_name: string, timestamp: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_SupervisorSignOff ${dxh_data_id}, Null, N'${first_name}', N'${last_name}', '${timestamp}'`);
    }

    public async executeGeneralImportQuery(query: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(query);
    }
}