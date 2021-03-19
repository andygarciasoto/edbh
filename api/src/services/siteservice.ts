import { Request, Response } from 'express';
import { AssetRepository } from '../repositories/asset-repository';
import { ShiftRepository } from '../repositories/shift-repository';
import { UomRepository } from '../repositories/uom-repository';
import { UserRepository } from '../repositories/user-repository';
import _ from 'lodash';

export class SiteService {

    private readonly assetrepository: AssetRepository;
    private readonly shiftsrepository: ShiftRepository;
    private readonly uomrepository: UomRepository;
    private readonly userrepository: UserRepository;

    public constructor(assetRepository: AssetRepository, shiftsRepository: ShiftRepository, uomRepository: UomRepository, userRepository: UserRepository) {
        this.assetrepository = assetRepository;
        this.shiftsrepository = shiftsRepository;
        this.uomrepository = uomRepository;
        this.userrepository = userRepository;
    }

    public async loadSiteConfiguration(req: Request, res: Response) {
        let site_id = req.query.site_id;
        let station = req.query.station;
        if (!site_id) {
            return res.status(400).json({ message: 'Bad Request - Missing Site id Parameter' });
        }

        let siteInformation = { dsystems: [], shifts: [], site_assets: [], machines: [], uoms: [], workcell: [], escalations: [] };

        try {
            if (station) {
                siteInformation.dsystems = await this.assetrepository.getAssetByAssetDisplaySystem(station);
            }

            siteInformation.shifts = await this.shiftsrepository.getShiftBySite(site_id);
            siteInformation.site_assets = await this.assetrepository.getAssetBySite(site_id, 'All', 'All');
            siteInformation.machines = _.filter(siteInformation.site_assets, { asset_level: 'Cell' });
            siteInformation.uoms = await this.uomrepository.getUomBySite(site_id);
            siteInformation.workcell = await this.assetrepository.getAssetByWorkcell(station || 'Null', site_id);
            siteInformation.escalations = await this.userrepository.getEscalationBySite(site_id);

        } catch (ex) {
            return res.status(500).json({ message: ex.message });
        }
        return res.status(200).json(siteInformation);
    }
}