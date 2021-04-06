import { Request, Response } from 'express';
import { TagRepository } from '../repositories/tag-repository';

export class TagService {
    private readonly tagrepository: TagRepository;

    public constructor(tagrepository: TagRepository) {
        this.tagrepository = tagrepository;
    }

    public async getTags(req: Request, res: Response) {
        let site = req.query.site;
        if (!site || site === null || site === undefined) {
            return res.status(400).json({ message: "Bad Request - Missing Parameters" });
        }
        let tags: any;
        try {
            tags = await this.tagrepository.getTagBySite(site);
        } catch (err) {
            res.status(500).json({ message: err.message });
            return;
        }
        return res.status(200).json(tags);
    }
}

