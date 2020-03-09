import { Request, Response } from 'express';
import cors from 'cors';

let basePath = '/';

export type Handler = (req: Request, res: Response, next?: any) => void;

export function normalizeEndpointPath(endpointPath: string): string {
    return endpointPath
        .replace(/\/\/+/g, '/')
        .trim();
}

export class RestEndpoint {
    public readonly baseRelativePath: string;
    public readonly verb: string;
    public readonly target: Handler;
    public readonly useToken: boolean;

    constructor(baseRelativePath: string, verb: string, target: any, useToken: boolean) {
        this.baseRelativePath = baseRelativePath;
        this.verb = verb;
        this.target = target;
        this.useToken = useToken;
    }

    public hostRelativePath(): string {
        return normalizeEndpointPath(`${basePath}/${this.baseRelativePath}`);
    }

    public attach(config: any): void {
        if (this.useToken) {
            config.routerToken[this.verb](this.hostRelativePath(), this.target)
        } else {
            config.router[this.verb](this.hostRelativePath(), this.target)
        }
    }

}