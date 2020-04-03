import { Request, Response } from 'express';
import { CommentDataRepository } from '../repositories/comment-repository';
import { AssetRepository } from '../repositories/asset-repository';
import { DxHDataRepository } from '../repositories/dxhdata-repository';
import moment from 'moment';

export class CommentDataService {

    private readonly commentdatarepository: CommentDataRepository;
    private readonly assetrepository: AssetRepository;
    private readonly dxhdatarepository: DxHDataRepository;
    private readonly format: string = 'YYYY-MM-DD HH:mm:ss';

    public constructor(commentdatarepository: CommentDataRepository, assetrepository: AssetRepository, dxhdatarepository: DxHDataRepository) {
        this.commentdatarepository = commentdatarepository;
        this.assetrepository = assetrepository;
        this.dxhdatarepository = dxhdatarepository;
    }

    public async getCommentDataByDxHDataId(req: Request, res: Response) {
        if (!req.query.dxh_data_id) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let comments: any;
        try {
            comments = await this.commentdatarepository.getCommentDataByDxHDataId(req.query.dxh_data_id);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(comments);
    }

    public async putCommentData(req: Request, res: Response) {
        const params = req.body;
        if (!params.comment) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        const asset_code = params.asset_code ? params.asset_code : undefined;
        const update = params.comment_id ? params.comment_id : 0;
        const timestamp = moment(new Date(params.timestamp)).format(this.format);
        const row_timestamp = params.row_timestamp;

        if (!params.clocknumber) {
            if (!(params.first_name || params.last_name)) {
                return res.status(400).json({ message: "Bad Request - Missing Parameters" });
            }
        }

        let asset: any;
        let dxhData: any;
        try {
            if (!params.dxh_data_id) {
                if (asset_code === undefined) {
                    return res.status(400).json({ message: "Bad Request - Missing asset_code parameter" });
                } else {
                    asset = await this.assetrepository.getAssetByCode(asset_code);
                    dxhData = await this.dxhdatarepository.getDxHDataId(asset[0].asset_id, row_timestamp);
                    let dxh_data_id = dxhData[0].dxhdata_id;
                    if (params.clocknumber) {
                        await this.commentdatarepository.putCommentDataByClocknumber(dxh_data_id, params.comment, params.clocknumber, timestamp, update);
                    } else {
                        await this.commentdatarepository.putCommentDataByUsername(dxh_data_id, params.comment, params.first_name, params.last_name, timestamp, update);
                    }
                }
            } else {
                if (params.clocknumber) {
                    await this.commentdatarepository.putCommentDataByClocknumber(params.dxh_data_id, params.comment, params.clocknumber, timestamp, update);
                } else {
                    await this.commentdatarepository.putCommentDataByUsername(params.dxh_data_id, params.comment, params.first_name, params.last_name, timestamp, update);
                }
            }
            return res.status(200).send('Message Entered Succesfully');
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

}