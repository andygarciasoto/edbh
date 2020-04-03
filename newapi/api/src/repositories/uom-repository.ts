import { SqlServerStore } from '../configurations/sqlserverstore';

export class UomRepository {

    private static readonly table = 'UOM';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getAllUOM(): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_UOM`);
    }

    public async getUomBySite(site: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_UOM_By_Site ${site}`);
    }

    public async getUomByAsset(asset_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`select top 1 a.asset_id, o.uom_code, u.decimals from asset a 
        join orderdata o on a.asset_id = ${asset_id} and a.asset_id = o.asset_id join uom u on o.uom_code = u.uom_code`);
    }

}