import { Request, Response } from 'express';
import { ProductionDataRepository } from '../repositories/productiondata-repository';
import { DxHDataRepository } from '../repositories/dxhdata-repository';
import { AssetRepository } from '../repositories/asset-repository';
import moment from 'moment';

export class ProductionDataService {

    private readonly productiondatarepository: ProductionDataRepository;
    private readonly dxhdatarepository: DxHDataRepository;
    private readonly assetrepository: AssetRepository;
    private readonly format: string = 'YYYY-MM-DD HH:mm:ss';

    public constructor(productiondatarepository: ProductionDataRepository, dxhdatarepository: DxHDataRepository, assetrepository: AssetRepository) {
        this.productiondatarepository = productiondatarepository;
        this.dxhdatarepository = dxhdatarepository;
        this.assetrepository = assetrepository;
    }

    public async putProductionData(req: Request, res: Response) {
        let dxh_data_id = req.body.dxh_data_id ? parseInt(req.body.dxh_data_id) : undefined;
        const actual = req.body.actual ? (req.body.actual != "signoff" ? parseFloat(req.body.actual) : 0) : undefined;
        const setup_scrap = req.body.setup_scrap ? (req.body.setup_scrap != "signoff" ? parseFloat(req.body.setup_scrap) : 0) : undefined;
        const other_scrap = req.body.other_scrap ? (req.body.other_scrap != "signoff" ? parseFloat(req.body.other_scrap) : 0) : undefined;
        const clocknumber = req.body.clocknumber;
        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const timestamp = moment(new Date(req.body.timestamp)).format(this.format);
        const override = req.body.override ? parseInt(req.body.override) : 0;
        const asset_code = req.body.asset_code ? req.body.asset_code : undefined;
        const row_timestamp = req.body.row_timestamp;

        if (actual === undefined || setup_scrap === undefined || other_scrap === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters - Actual, Setup Scrap, Other Scrap or Adjusted Actual Undefined" });
        }
        if (!clocknumber) {
            if (!(first_name || last_name)) {
                return res.status(400).json({ message: "Bad Request - Missing Parameters - No User Data" });
            }
        }

        let asset: any;
        let dxhData: any;
        try {
            if (dxh_data_id === undefined || dxh_data_id === null) {
                if (asset_code === undefined) {
                    return res.status(400).json({ message: "Bad Request - Missing asset_code parameter" });
                } else {
                    asset = await this.assetrepository.getAssetByCode(asset_code);
                    dxhData = await this.dxhdatarepository.getDxHDataId(asset[0].asset_id, row_timestamp);
                    dxh_data_id = dxhData[0].dxhdata_id;
                    if (clocknumber) {
                        await this.productiondatarepository.putProductionDataByClocknumber(dxh_data_id, actual, setup_scrap, other_scrap, clocknumber, timestamp, override);
                    } else {
                        await this.productiondatarepository.putProductionDataByUsername(dxh_data_id, actual, setup_scrap, other_scrap, first_name, last_name, timestamp, override);
                    }
                }
            } else {
                if (clocknumber) {
                    await this.productiondatarepository.putProductionDataByClocknumber(dxh_data_id, actual, setup_scrap, other_scrap, clocknumber, timestamp, override);
                } else {
                    await this.productiondatarepository.putProductionDataByUsername(dxh_data_id, actual, setup_scrap, other_scrap, first_name, last_name, timestamp, override);
                }
            }
            return res.status(200).send('Message Entered Succesfully');
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

}