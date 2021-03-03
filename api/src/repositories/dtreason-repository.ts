import { SqlServerStore } from '../configurations/sqlserverstore';

export class DTReasonRepository {
    private static readonly table = 'DTReason';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getReasons(asset_id: number, type: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_DTReason ${asset_id}, N'${type}'`);
    }
    public async getDxhData(dxh_data_id: number, productiondata_id: number, type: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_DTData_By_DxHData_Id ${dxh_data_id}, ${productiondata_id}, N'${type}'`);
    }
    public async putDtDataByClockNumber(dxh_data_id: number, productiondata_id: number, dt_reason_id: number, dt_minutes: number, quantity: number, responsible: string, clocknumber: string, timestamp: string, update: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_DTData ${dxh_data_id}, ${productiondata_id}, ${dt_reason_id}, ${dt_minutes}, ${quantity}, N'${responsible}', N'${clocknumber}', Null, Null, '${timestamp}', ${update}`);
    }
    public async putDtDataByName(dxh_data_id: number, productiondata_id: number, dt_reason_id: number, dt_minutes: number, quantity: number, responsible: string, first_name: string, last_name: string, timestamp: string, update: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_DTData ${dxh_data_id}, ${productiondata_id}, ${dt_reason_id}, ${dt_minutes}, ${quantity}, N'${responsible}', Null, N'${first_name}', N'${last_name}', '${timestamp}', ${update}`);
    }
    public async getDTReasonBySite(site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT [DTReason].[dtreason_code],[DTReason].[dtreason_name],[DTReason].[dtreason_description],[DTReason].[dtreason_category],
        [Asset].[asset_code],[DTReason].[reason1],[DTReason].[reason2],[DTReason].[status],[DTReason].[type],[DTReason].[level],
		A2.asset_code as site_code FROM [dbo].[DTReason] JOIN [dbo].[Asset] ON [DTReason].[asset_id] = [Asset].[asset_id]
        JOIN dbo.Asset A2 ON ${site_id} = A2.asset_id
        WHERE DTReason.site_id = ${site_id}`);
    }
}


