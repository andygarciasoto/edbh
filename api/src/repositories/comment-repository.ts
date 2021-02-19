import { SqlServerStore } from '../configurations/sqlserverstore';

export class CommentDataRepository {

    private readonly sqlServerStore: SqlServerStore;

    public constructor(sqlServerStore: SqlServerStore) {
        this.sqlServerStore = sqlServerStore;
    }

    public async getCommentDataByDxHDataId(dxhdata_id: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Get_CommentData_By_DxHData_Id ${dxhdata_id}`);
    }

    public async putCommentDataByClocknumber(dxhdata_id: number, comment: string, clocknumber: string, timestamp: string, update: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_CommentData ${dxhdata_id}, N'${comment}', N'${clocknumber}', Null, Null, '${timestamp}', ${update}`);
    }

    public async putCommentDataByUsername(dxhdata_id: number, comment: string, first_name: string, last_name: string, timestamp: string, update: number): Promise<any> {
        return await this.sqlServerStore.ExecuteQuery(`exec dbo.spLocal_EY_DxH_Put_CommentData ${dxhdata_id}, N'${comment}', Null, N'${first_name}', N'${last_name}', '${timestamp}', ${update}`);
    }
}