import { Request, Response } from 'express';
import { TagRepository } from '../repositories/tag-repository';

export class TagService {
    private readonly tagrepository: TagRepository;

    public constructor(tagrepository: TagRepository) {
        this.tagrepository = tagrepository;
    }

    public async getTags(req: Request, res: Response) {
        let site = req.query.site;
        let tag_id = req.query.tag_id;
        if (!site || site === null || site === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let tags: any;
        try {
            if (!tag_id) {
                tags = await this.tagrepository.getTagBySite(site);
            } else {
                tags = await this.tagrepository.getTagById(tag_id);
            }
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(tags);
    }
    public async getTagByAsset(req: Request, res: Response) {
        let asset_id = req.query.asset_id ? req.query.asset_id : undefined;
        if (asset_id === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let tags: any;
        try {
            tags = await this.tagrepository.getTagByAsset(asset_id);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(tags);
    }
    public async putTags(req: Request, res: Response) {
        const tag_id = req.body.tag_id ? req.body.tag_id : null;
        const tag_code = req.body.tag_code ? req.body.tag_code : undefined;
        const tag_name = req.body.tag_name ? req.body.tag_name : undefined;
        const tag_description = req.body.tag_description ? req.body.tag_description : null;
        const datatype = req.body.datatype ? req.body.datatype : 'int';
        const UOM_code = req.body.UOM_code ? req.body.UOM_code : null;
        const rollover_point = req.body.rollover_point ? req.body.rollover_point : 9999999;
        const aggregation = req.body.aggregation ? req.body.aggregation : 'SUM';
        const status = req.body.status ? req.body.status : 'Active';
        const site_id = req.body.site_id ? req.body.site_id : undefined;
        const asset_id = req.body.asset_id ? req.body.asset_id : undefined;
        const max_change = req.body.max_change ? req.body.max_change : null;

        if (tag_code === undefined || tag_name === undefined || site_id === undefined || asset_id === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let tags: any;
        try {
            tags = await this.tagrepository.putTags(tag_id, tag_code, tag_name, tag_description, datatype, UOM_code, rollover_point, aggregation, status, site_id, asset_id, max_change);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).send('Message Entered Succesfully');
    }
}
