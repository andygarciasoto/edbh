import { SqlServerStore } from '../configurations/sqlserverstore';

export class EscalationRepository {
    private static readonly table = 'Escalation';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getEscalation(site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT E.escalation_id, E.escalation_name, E.escalation_group, E.escalation_level, 
        E.escalation_hours, E.status FROM dbo.Escalation E
        INNER JOIN dbo.CommonParameters CP ON E.escalation_group = CP.escalation_group AND CP.site_id = ${site_id}
		WHERE E.status = 'Active'`);
    }
    public async getEscalationGroups(): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT COUNT(DISTINCT E.escalation_group) as 'Current Groups',
        COUNT(DISTINCT E.escalation_group) + 1 as 'Group to create' FROM dbo.Escalation E`);
    }
    public async getEscalationBySite(site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT DISTINCT TFD.escalation_id, E.escalation_name, 
        e.escalation_group, e.escalation_hours, e.escalation_level, e.status FROM dbo.TFDUsers TFD
        JOIN dbo.Escalation E ON TFD.escalation_id = E.escalation_id AND TFD.site = ${site_id}
        AND E.Status = 'Active'
        JOIN dbo.CommonParameters CP ON E.escalation_group = CP.escalation_group`);
    }
    public async putEscalation(escalation_id: number, escalation_name: string, escalation_group: string, escalation_level: number, escalation_hours: number, status: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_Escalation ${escalation_id}, N'${escalation_name}', N'${escalation_group}', ${escalation_level}, ${escalation_hours}, N'${status}'`);
    }
    
    public async putEscalationEvents(dxhdata_id: number, asset_id: number, escalation_time: string, sign_time: string, badge: string, site_id: number, escalation_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_EscalationEvents ${dxhdata_id}, ${asset_id}, ${escalation_time}, ${sign_time}, N'${badge}', ${site_id}, ${escalation_id}`);
    }
    
}
