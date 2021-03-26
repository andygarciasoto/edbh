import { Request, Response } from 'express';
import { LanguageRepository } from '../repositories/language-repository';


export class LanguageService {

    private readonly languagerepository: LanguageRepository;

    public constructor(languagerepository: LanguageRepository) {
        this.languagerepository = languagerepository;
    }

    public async getLanguages(req: Request, res: Response) {
        let languages: any;
        try {
            languages = await this.languagerepository.getLanguages();
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
        return res.status(200).json(languages);
    }
}