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
}
