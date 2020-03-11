import { Request, Response } from 'express';
import { OrderDataRepository } from '../repositories/orderdata-repository';
import { AssetRepository } from '../repositories/asset-repository';
let request = require('request');

export class OrderDataService {

    private readonly orderdatarepository: OrderDataRepository;
    private readonly assetrepository: AssetRepository;

    public constructor(orderdatarepository: OrderDataRepository, assetrepository: AssetRepository) {
        this.orderdatarepository = orderdatarepository;
        this.assetrepository = assetrepository;
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
            const orderId = orderData[0].order_id;
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
                        return res.status(500).send({ message: 'Error', jtrax_error: error });
                    }
                    if (resp.statusCode >= 400) {
                        return res.status(500).send({ message: 'Error', jtrax_error: error, body: body });
                    }
                    return res.status(200).json(orderData);
                });
            } else {
                return res.status(200).json(orderData);
            }
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }

}