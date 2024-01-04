import {Request, Response, NextFunction} from "express";
import handleMongooseError from "./handleMongooseError";

export default (fn: Function)=>{

    return async(req: Request, res: Response, next: NextFunction)=>{
        try{
            return await fn(req, res, next)
        }catch(ex){
            const errMessage = handleMongooseError(ex)
            if(errMessage)return res.status(400).json(errMessage)
            console.log(ex)
            return res.status(500).json("internal server error")
        }
}}