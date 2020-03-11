import { SqlServerStore } from '../configurations/sqlserverstore';

export class OrderDataRepository {

    private static readonly table = 'OrderData';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getOrderData(asset_id: number, order_number: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_OrderData_new_1 ${asset_id}, '${order_number}', 0`);
    }

}