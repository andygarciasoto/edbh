import { SqlServerStore } from '../configurations/sqlserverstore';

export class EscalationRepository {
    private static readonly table = 'Escalation';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getEscalation(): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT escalation_id, escalation_name, escalation_group, escalation_level, 
        escalation_hours, status FROM dbo.Escalation
		WHERE status = 'Active'`);
    }
    public async getEscalationBySite(site_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT DISTINCT TFD.escalation_id, E.escalation_name, 
        e.escalation_group, e.escalation_hours, e.escalation_level, e.status FROM dbo.TFDUsers TFD
        JOIN dbo.Escalation E ON TFD.escalation_id = E.escalation_id AND TFD.site = ${site_id}
        AND E.Status = 'Active'`);
    }
    public async putEscalation(escalation_id: number, escalation_name: string, escalation_group: string, escalation_level: number, escalation_hours: number, status: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_Escalation ${escalation_id}, N'${escalation_name}', N'${escalation_group}', ${escalation_level}, ${escalation_hours}, N'${status}'`);
    }
}
