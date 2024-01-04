import { NextFunction, Request, Response } from "express"
import handleMongooseError from "./handleMongooseError"

export default (fn: Function)=>{
    return async(req: Request, res: Response, next: NextFunction)=>{
        try{
            return await fn(req, res)
        }catch(ex){
            console.log(ex)
            const errMessages = handleMongooseError(ex)
            if(!errMessages)return res.status(500).json("internal server error")
            return res.status(400).json(errMessages)
        }
    }
}