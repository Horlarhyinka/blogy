import { Request } from "express";
import "express-session";

declare module "express-session"{
    interface SessionData{
        user: string
    }
}

export interface ExtReq extends Request{
    user: {
        _id: string
        email: string
        firstName?: string
        lastName?: string
    }
}
