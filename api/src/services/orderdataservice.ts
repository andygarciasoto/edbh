import { Request, Response } from 'express';
import { OrderDataRepository } from '../repositories/orderdata-repository';
import { AssetRepository } from '../repositories/asset-repository';
import { ProductRepository } from '../repositories/product-repository';
let request = require('request');

export class OrderDataService {

    private readonly orderdatarepository: OrderDataRepository;
    private readonly assetrepository: AssetRepository;
    private readonly productrepository: ProductRepository;

    public constructor(orderdatarepository: OrderDataRepository, assetrepository: AssetRepository, productrepository: ProductRepository) {
        this.orderdatarepository = orderdatarepository;
        this.assetrepository = assetrepository;
        this.productrepository = productrepository;
    }

    public async getOrderAssembly(req: Request, res: Response) {
        const params = req.query;
        if (params.order_number === undefined || params.asset_code === undefined || params.timestamp === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }

        let asset: any;
        let orderData: any;
        try {
            asset = await this.assetrepository.getAssetByCode(params.asset_code);
            orderData = await this.orderdatarepository.getOrderData(asset[0].asset_id, params.order_number);
            const orderId = orderData[0] ? orderData[0].order_id : orderData[0];
            if (orderId === null || orderId === undefined) {
                let assembly = {
                    order_number: params.order_number,
                    asset_code: params.asset_code,
                    timestamp: params.timestamp,
                    message_source: "assembly"
                };
                request({
                    url: "http://tfd036w04.us.parker.corp/jTrax/DxHTrigger/api/assemblyorder",
                    method: "POST",
                    json: true,
                    body: assembly,
                    timeout: 10000
                }, (error, resp, body) => {
                    if (error || body) {
                        return res.status(500).send({ message: 'Error', jtrax_error: error.Message });
                    }
                    if (resp.statusCode >= 400) {
                        return res.status(500).send({ message: 'Error', jtrax_error: error.Message, body: body.Message });
                    }
                    return res.status(200).json({});
                });
            } else {
                return res.status(200).json(orderData);
            }
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    public async getOrderData(req: Request, res: Response) {
        const asset_code = req.query.asset_code;
        const order_number = req.query.order_number;
        const is_current_order = req.query.is_current_order || 0;

        if (asset_code == undefined || order_number == undefined) {
            return res.status(400).send("Bad Request - Missing parameters");
        }

        let asset: any;
        let orderData: any;
        try {
            asset = await this.assetrepository.getAssetByCode(asset_code);
            orderData = await this.orderdatarepository.getCurrentOrderData(asset[0].asset_id, order_number, is_current_order);
            return res.status(200).json(orderData);
        }
        catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

    public async createOrderData(req: Request, res: Response) {
        const asset_code = req.body.asset_code || undefined;
        const part_number = req.body.part_number || undefined;
        const order_quantity = req.body.order_quantity || undefined;
        const uom_code = req.body.uom_code || undefined;
        const routed_cycle_time = req.body.routed_cycle_time || 'Null';
        const setup_time = req.body.setup_time || 'Null';
        const target = req.body.target || 'Null';
        const production_status = req.body.production_status;
        const clocknumber = req.body.clocknumber || undefined;
        const first_name = req.body.first_name || undefined;
        const last_name = req.body.last_name || undefined;

        if (!asset_code || !part_number || !uom_code || !production_status) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }

        if (!clocknumber) {
            if (!(first_name || last_name)) {
                return res.status(400).json({ message: "Bad Request - Missing Parameters" });
            }
        }
        let asset: any;
        let query: any;
        try {
            asset = await this.assetrepository.getAssetByCode(asset_code);
            query = await this.productrepository.getProductByPartNumber(part_number);
            if (query[0] === undefined) {
                await this.productrepository.insertProduct(part_number);
            }
            if (clocknumber) {
                await this.orderdatarepository.createOrderDataByClocknumber(asset[0].asset_id, part_number, order_quantity, uom_code, routed_cycle_time, setup_time, target, production_status, clocknumber);
            } else {
                await this.orderdatarepository.createOrderDataByUsername(asset[0].asset_id, part_number, order_quantity, uom_code, routed_cycle_time, setup_time, target, production_status, first_name, last_name);
            }
            return res.status(200).send('Message Entered Succesfully');
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
}

