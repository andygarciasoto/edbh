import { SqlServerStore } from '../configurations/sqlserverstore';
import _ from 'lodash';

export class UomRepository {

    private static readonly table = 'UOM';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getAllUOM(): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_UOM`);
    }
    public async getUomByAsset(asset_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`select top 1 a.asset_id, o.uom_code, u.decimals from asset a 
        join orderdata o on a.asset_id = ${asset_id} and a.asset_id = o.asset_id join uom u on o.uom_code = u.uom_code`);
    }
    public async putUOM(uom_id: number, uom_code: string, uom_name: string, uom_description: string, status: string, site_id: number, decimals: boolean): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_UOM ${uom_id}, N'${uom_code}', N'${uom_name}', N'${uom_description}', '${status}', ${site_id}, ${decimals}`);
    }
    public async findUomByFilter(parameters: any[]): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT U.UOM_id, U.UOM_code, U.UOM_name, U.UOM_description, U.site_id, U.decimals, U.status
        FROM dbo.UOM U
        ${_.isEmpty(parameters) ? '' :
                'WHERE ' + _.join(parameters, ' AND ')
            }`);
    }

}