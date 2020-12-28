import { SqlServerStore } from '../configurations/sqlserverstore';

export class DTReasonRepository {
    private static readonly table = 'DTReason';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getTimelostReasons(asset_id: number, type: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_DTReason ${asset_id}, '${type}'`);
    }
    public async getSetupReason(asset_code: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_DTReason_Setup ${asset_code}`);
    }
    public async getTimelostDxhData(dxh_data_id: number, productiondata_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_DTData_By_DxHData_Id ${dxh_data_id}, ${productiondata_id}`);
    }
    public async putDtDataByClockNumber(dxh_data_id: number, productiondata_id: number, dt_reason_id: number, dt_minutes: number, quantity: number, clocknumber: string, timestamp: string, update: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_DTData ${dxh_data_id}, ${productiondata_id}, ${dt_reason_id}, ${dt_minutes}, ${quantity}, '${clocknumber}', Null, Null, '${timestamp}', ${update}`);
    }
    public async putDtDataByName(dxh_data_id: number, productiondata_id: number, dt_reason_id: number, dt_minutes: number, quantity: number, first_name: string, last_name: string, timestamp: string, update: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_DTData ${dxh_data_id}, ${productiondata_id}, ${dt_reason_id}, ${dt_minutes}, ${quantity}, Null, '${first_name}', '${last_name}', '${timestamp}', ${update}`);
    }
    public async getDTReasonBySite(site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT [DTReason].[dtreason_code],[DTReason].[dtreason_name],[DTReason].[dtreason_description],[DTReason].[dtreason_category],
        [Asset].[asset_code],[DTReason].[reason1],[DTReason].[reason2],[DTReason].[status],[DTReason].[entered_by],[DTReason].[entered_on],
        [DTReason].[last_modified_by],[DTReason].[last_modified_on],[DTReason].[type],[DTReason].[level] FROM [dbo].[DTReason] JOIN [dbo].[Asset] ON [DTReason].[asset_id] = [Asset].[asset_id]
        WHERE [Asset].[site_code] = (SELECT asset_code FROM [dbo].[Asset] WHERE asset_id = ${site_id})`);
    }
}


