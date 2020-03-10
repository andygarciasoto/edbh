import { SqlServerStore } from '../configurations/sqlserverstore';

export class DxHDataRepository {

    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getDxHDataId(asset_id: number, row_timestamp: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_DxHDataId_new_1 ${asset_id}, '${row_timestamp}', 0`);
    }
}