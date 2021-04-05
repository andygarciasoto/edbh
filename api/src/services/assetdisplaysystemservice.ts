import { Request, Response } from 'express';
import { AssetDisplaySystemRepository } from '../repositories/assetdisplaysystem-repository';

export class AssetDisplaySystemService {
    private readonly assetdisplaysystemrepository : AssetDisplaySystemRepository;

    public constructor(assetdisplaysystemrepository: AssetDisplaySystemRepository) {
        this.assetdisplaysystemrepository = assetdisplaysystemrepository;
    }

    public async getAssetDisplayBySite(req: Request, res: Response) {
        let site = req.query.site;
        if (!site || site === null || site === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let assetdisplay: any;
        try {
            assetdisplay = await this.assetdisplaysystemrepository.getAssetDisplaySystemBySite(site);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(assetdisplay);
    }
}

