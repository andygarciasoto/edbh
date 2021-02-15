import { SqlServerStore } from '../configurations/sqlserverstore';

export class ScanRepository {
    
    private static readonly table = 'Scan';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async putScan(badge: string, closed_by: string, first_name: string, last_name: string, asset_id: number, timestamp: string, reason: string, status: string, site_id: number, break_minutes: number, lunch_minutes: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_Scan '${badge}', '${closed_by}', '${first_name}', '${last_name}', ${asset_id}, '${timestamp}', '${reason}', '${status}', ${site_id}, ${break_minutes}, ${lunch_minutes}`);
    }
    public async getScan(start_time: string, end_time: string, asset_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_Scan_By_Asset '${start_time}', '${end_time}', ${asset_id}`);
    }

}