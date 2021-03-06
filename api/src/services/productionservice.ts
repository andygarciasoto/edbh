import { Request, Response } from 'express';
import { ProductionDataRepository } from '../repositories/productiondata-repository';
import { DxHDataRepository } from '../repositories/dxhdata-repository';
import { AssetRepository } from '../repositories/asset-repository';
import moment from 'moment';
import { DTReasonRepository } from '../repositories/dtreason-repository';

export class ProductionDataService {

    private readonly productiondatarepository: ProductionDataRepository;
    private readonly dxhdatarepository: DxHDataRepository;
    private readonly assetrepository: AssetRepository;
    private readonly dtreasonrepository: DTReasonRepository;
    private readonly format: string = 'YYYY-MM-DD HH:mm:ss';

    public constructor(productiondatarepository: ProductionDataRepository, dxhdatarepository: DxHDataRepository, assetrepository: AssetRepository, dtreasonrepository: DTReasonRepository) {
        this.productiondatarepository = productiondatarepository;
        this.dxhdatarepository = dxhdatarepository;
        this.assetrepository = assetrepository;
        this.dtreasonrepository = dtreasonrepository;
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

    public async putScrapValues(req: Request, res: Response) {
        const dxh_data_id = req.body.dxh_data_id ? parseInt(req.body.dxh_data_id) : undefined;
        const productiondata_id = req.body.productiondata_id ? parseInt(req.body.productiondata_id) : null;
        let dt_reason_id = !isNaN(req.body.dt_reason_id) ? parseInt(req.body.dt_reason_id) : undefined;
        const dt_minutes = req.body.dt_minutes ? parseFloat(req.body.dt_minutes) : null;
        const setup_scrap = !isNaN(req.body.setup_scrap) ? parseFloat(req.body.setup_scrap) : 0;
        const other_scrap = !isNaN(req.body.other_scrap) ? parseFloat(req.body.other_scrap) : 0;
        const clocknumber = req.body.clocknumber;
        const first_name = req.body.first_name;
        const last_name = req.body.last_name;
        const quantity = !isNaN(req.body.quantity) ? req.body.quantity : null;
        const update = req.body.dtdata_id ? parseInt(req.body.dtdata_id) : 0;
        const timestamp = moment(new Date(req.body.timestamp)).format(this.format);
        let asset_code = req.body.asset_code ? req.body.asset_code : undefined;
        const responsible = req.body.responsible ? req.body.responsible : null;

        if (dxh_data_id === undefined || productiondata_id === undefined || (quantity >= 0 && dt_reason_id === undefined) || asset_code === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        if (!clocknumber) {
            if (!(first_name || last_name)) {
                return res.status(400).json({ message: "Bad Request - Missing Parameters - No User Data" });
            }
        }
        try {
            if (clocknumber) {
                await this.productiondatarepository.putScrapValuesByClockNumber(dxh_data_id, productiondata_id, setup_scrap, other_scrap, clocknumber);
                await this.dtreasonrepository.putDtDataByClockNumber(dxh_data_id, productiondata_id, dt_reason_id, dt_minutes, quantity, responsible, clocknumber, timestamp, update);
            } else {
                await this.productiondatarepository.putScrapValuesByUsername(dxh_data_id, productiondata_id, setup_scrap, other_scrap, first_name, last_name);
                await this.dtreasonrepository.putDtDataByName(dxh_data_id, productiondata_id, dt_reason_id, dt_minutes, quantity, responsible, first_name, last_name, timestamp, update);
            }
            return res.status(200).send('Message Entered Succesfully');
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    public async putProductionForAnyOrder(req: Request, res: Response) {
        let dxh_data_id = req.body.dxh_data_id ? parseInt(req.body.dxh_data_id) : undefined;
        const productiondata_id = req.body.productiondata_id ? parseInt(req.body.productiondata_id) : null;
        const actual = !isNaN(req.body.actual) ? parseFloat(req.body.actual) : 0;
        const clocknumber = req.body.clocknumber ? req.body.clocknumber : undefined;
        const timestamp = req.body.timestamp ? moment(new Date(req.body.timestamp)).format(this.format) : undefined;
        const asset_code = req.body.asset_code ? req.body.asset_code : undefined;
        if (asset_code === undefined || actual < 0 || clocknumber === undefined || timestamp === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let production: any;
        let asset: any;
        let dxhData: any;
        try {
            if (dxh_data_id === undefined) {
                asset = await this.assetrepository.getAssetByCode(asset_code);
                dxhData = await this.dxhdatarepository.getDxHDataId(asset[0].asset_id, timestamp);
                dxh_data_id = dxhData[0].dxhdata_id;
            }
            production = await this.productiondatarepository.putProductionDataForAnyOrder(dxh_data_id, productiondata_id, actual, clocknumber, timestamp);
            return res.status(200).send('Message Entered Succesfully');
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    public async getDigitalCups(req: Request, res: Response) {
        const params = req.query;
        if (params.start_time === undefined || params.end_time === undefined || params.asset_id === undefined || params.aggregation === undefined || params.production_day === undefined) {
            return res.status(400).send("Missing parameters");
        }
        let start_time = moment(new Date(params.start_time)).format(this.format);
        let end_time = moment(new Date(params.end_time)).format(this.format);
        let production_day = moment(params.production_day, 'YYYY-MM-DD').format('YYYY-MM-DD');
        let asset_id = params.asset_id;
        let aggregation = params.aggregation;

        let digitalcups: any;
        try {
            digitalcups = await this.productiondatarepository.getDigitalCups(start_time, end_time, asset_id, aggregation, production_day);
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(200).json(digitalcups);
    }
}



