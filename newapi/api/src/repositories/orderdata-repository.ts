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
    public async getCurrentOrderData(asset_id: number, order_number: string, is_current_order: boolean): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_OrderData_new_1 ${asset_id}, '${order_number}', ${is_current_order}`);
    }
    public async createOrderDataByClocknumber(asset_id: number, part_number: string, order_quantity: number, uom_code: string, routed_cycle_time: number, setup_time: number, target: number, production_status: string, clocknumber: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Create_OrderData_new_1 ${asset_id}, '${part_number}', ${order_quantity}, '${uom_code}',${routed_cycle_time}, ${setup_time}, ${target}, '${production_status}', '${clocknumber}', Null, Null;`);
    }
    public async createOrderDataByUsername(asset_id: number, part_number: string, order_quantity: number, uom_code: string, routed_cycle_time: number, setup_time: number, target: number, production_status: string, first_name: string, last_name: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Create_OrderData_new_1 ${asset_id}, '${part_number}', ${order_quantity}, '${uom_code}',${routed_cycle_time}, ${setup_time}, ${target}, '${production_status}', Null, '${first_name}', '${last_name}';`);
    }

}

