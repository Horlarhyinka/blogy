import "express-session";
import { Cookie } from "express-session";

export interface cookie_int extends Cookie{
            user: string
        }

declare module 'express-session'{
    interface SessionData {
        user: string
    }
}