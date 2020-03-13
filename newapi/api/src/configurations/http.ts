import { Response, Request } from 'express';

var multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

var uploading = multer({ storage: storage }).single('file');

let basePath = '/';

export type Handler = (req: Request, res: Response, next?: any) => void;
export type HandlerImport = (req, res: Response, next?: any) => void;

export function normalizeEndpointPath(endpointPath: string): string {
    return endpointPath
        .replace(/\/\/+/g, '/')
        .trim();
}

export class RestEndpoint {

    private readonly baseRelativePath: string;
    private readonly verb: string;
    private readonly target: Handler;
    private readonly targetImport: HandlerImport;
    private readonly useToken: boolean;
    private readonly recieveFile: boolean;

    constructor(baseRelativePath: string, verb: string, target: any, useToken: boolean, recieveFile?: boolean) {
        this.baseRelativePath = baseRelativePath;
        this.verb = verb;
        this.target = target;
        this.targetImport = target;
        this.useToken = useToken;
        this.recieveFile = recieveFile;
    }

    private hostRelativePath(): string {
        return normalizeEndpointPath(`${basePath}/${this.baseRelativePath}`);
    }

    public attach(config: any): void {
        if (this.useToken) {
            if (this.recieveFile) {
                config.routerToken[this.verb](this.hostRelativePath(), uploading, this.targetImport);
            } else {
                config.routerToken[this.verb](this.hostRelativePath(), this.target);
            }
        } else {
            config.router[this.verb](this.hostRelativePath(), this.target);
        }
    }

}