import { SqlServerStore } from '../configurations/sqlserverstore';
import _ from 'lodash';

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
        return await this.sqlServerStore.ExecuteQuery(`SELECT [DTReason].[dtreason_id],[DTReason].[dtreason_code],[DTReason].[dtreason_name],
        [DTReason].[dtreason_description],[DTReason].[dtreason_category],[Asset].[asset_code],[DTReason].[reason1],[DTReason].[reason2],
        [DTReason].[status],[DTReason].[type],[DTReason].[level],A2.asset_code as site_code 
        FROM [dbo].[DTReason] JOIN [dbo].[Asset] ON [DTReason].[asset_id] = [Asset].[asset_id]
        JOIN dbo.Asset A2 ON ${site_id} = A2.asset_id
        WHERE DTReason.site_id = ${site_id}
        AND Asset.asset_level = 'Cell'`);
    }
    public async getDTReasonById(site_id: number, dtreason_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT [DTReason].[dtreason_id],[DTReason].[dtreason_code],[DTReason].[dtreason_name],
        [DTReason].[dtreason_description],[DTReason].[dtreason_category],[Asset].[asset_code],[DTReason].[reason1],[DTReason].[reason2],
        [DTReason].[status],[DTReason].[type],[DTReason].[level],A2.asset_code as site_code 
        FROM [dbo].[DTReason] JOIN [dbo].[Asset] ON [DTReason].[asset_id] = [Asset].[asset_id]
        JOIN dbo.Asset A2 ON ${site_id} = A2.asset_id
        AND DTReason.site_id = ${site_id}
        AND Asset.asset_level = 'Cell'
        AND DTReason.dtreason_id = ${dtreason_id}`);
    }
    public async getUniqueReasonBySite(site_id: number, asset_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT dtreason_code, dtreason_name, MIN(dtreason_description) as dtreason_description, MIN(dtreason_category) as dtreason_category,
        MIN(reason1) as reason1, MIN(reason2) as reason2, MIN(status) as status, MIN(type) as type, MIN(level) as level, 
		SUM(CASE WHEN asset_id = ${asset_id} THEN 1 ELSE 0 END) as COUNT
        FROM dbo.DTReason
        WHERE site_id = ${site_id}
        GROUP BY dtreason_code, dtreason_name
        HAVING SUM(CASE WHEN asset_id = ${asset_id} THEN 1 ELSE 0 END) = 0
        ORDER BY dtreason_code`);
    }
    public async findReasonByFilter(parameters: any[]): Promise<any> {
        const query: string = `SELECT DT.dtreason_code,DT.dtreason_name, DT.dtreason_description,
        DT.dtreason_category,DT.reason1,DT.reason2, DT.status,DT.type,DT.level, COUNT(*) AS asset_count
        FROM dbo.DTReason AS DT
        ${_.isEmpty(parameters) ? '' :
                'WHERE ' + _.join(parameters, ' AND ')
            }
            GROUP BY DT.dtreason_code,DT.dtreason_name, DT.dtreason_description,
            DT.dtreason_category,DT.reason1,DT.reason2, DT.status,DT.type,DT.level`;
        return await this.sqlServerStore.ExecuteQuery(query);
    }
    public async getAssetsReasonCode(dtreason_code: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_Assets_ReasonCode N'${dtreason_code}'`);
    }
}


