import { SqlServerStore } from '../configurations/sqlserverstore';
import moment from 'moment';

export class ProductRepository {

    private static readonly table = 'Product';
    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getProductByPartNumber(part_number: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`SELECT [product_id], [product_code], [product_name], [product_description], [product_family], [value_stream], [grouping1], [grouping2], [grouping3], [grouping4], [grouping5], [status], [entered_by], [entered_on], [last_modified_by], [last_modified_on] FROM [dbo].[Product] WHERE product_code = '${part_number}';`);
    }
    public async insertProduct(part_number: string): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.sp_importproducts '${part_number}', '${part_number}', '${part_number}', '', '', '', '', '', '', '', 'Active', 'SQL manual entry', '${moment.utc().format('YYYY-MM-DD HH:MM')}';`);
    }
}