import mongoose from "mongoose";
import {Request, Response, NextFunction} from "express";

export default (req: Request, res: Response, next: NextFunction)=>{
    for(let key of Object.keys(req.params)){
        if(key.toLowerCase().endsWith("id") && !mongoose.Types.ObjectId.isValid(req.params[key]))return res.status(400).json(`invalid ${key}`)
    }
    next()
}