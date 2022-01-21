import { Request } from "express";

export interface AppRequest extends Request {
    auth: [k: string];
}