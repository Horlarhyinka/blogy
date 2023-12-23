import { Request, Response, NextFunction } from "express";
import handleMongooseError from "./handleMongooseError";

export default (fn: Function)=>{
    return async(req: Request, res: Response, next: NextFunction)=>{
        try{
            return await fn(req, res, next)
        }catch(ex){
           const mongooseError = handleMongooseError(ex)
           if(!mongooseError)return res.status(500).json({message: 'internal server error'})
           return res.status(400).json(mongooseError)
        }
    }
}