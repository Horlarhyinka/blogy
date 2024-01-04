import { NextFunction, Request, Response } from "express";
import { isValidId } from "../util/factory";

export default (req: Request, res: Response, next: NextFunction) =>{
    for(let key of Object.keys(req.params)){
        if(key.toLowerCase().endsWith("id") && !isValidId(req.params[key])){
            return res.status(400).json(`invalid ${key}`)
        }
    }
    next()
}
