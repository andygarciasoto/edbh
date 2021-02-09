import { SqlServerStore } from '../configurations/sqlserverstore';

export class ProductionDataRepository {
    
    private static readonly table = 'ProductionData';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async putProductionDataByClocknumber(dxh_data_id: number, actual: number, setup_scrap: number, other_scrap: number, clocknumber: string, timestamp: string, override: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_ProductionData ${dxh_data_id}, ${actual}, ${setup_scrap}, ${other_scrap}, '${clocknumber}', Null, Null, '${timestamp}', ${override}`);
    }

    public async putProductionDataByUsername(dxh_data_id: number, actual: number, setup_scrap: number, other_scrap: number, first_name: string, last_name: string, timestamp: string, override: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_ProductionData ${dxh_data_id}, ${actual}, ${setup_scrap}, ${other_scrap}, Null, '${first_name}', '${last_name}', '${timestamp}', ${override}`);
    }
    public async putScrapValuesByClockNumber(dxh_data_id: number, productiondata_id: number, setup_scrap: number, other_scrap: number, clocknumber: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_Scrap_ProductionData ${dxh_data_id}, ${productiondata_id}, ${setup_scrap}, ${other_scrap}, '${clocknumber}', NULL, NULL;`);
    }
    public async putScrapValuesByUsername(dxh_data_id: number, productiondata_id: number, setup_scrap: number, other_scrap: number, first_name: string, last_name: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_Scrap_ProductionData ${dxh_data_id}, ${productiondata_id}, ${setup_scrap}, ${other_scrap}, Null, '${first_name}', '${last_name}';`);
    }
    public async putProductionDataForAnyOrder(dxh_data_id: number, productiondata_id: number, actual: number, clocknumber: string, first_name: string, last_name: string, timestamp: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_ProductionData ${dxh_data_id}, ${productiondata_id}, ${actual}, '${clocknumber}', '${first_name}', '${last_name}', '${timestamp}'`);
    }

}
