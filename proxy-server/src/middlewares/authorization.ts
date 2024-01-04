import {Request, Response, NextFunction} from "express";
import { ExtReq } from "../types";
import { getService } from "../lib/factory";
import { services } from "../lib/factory";



export default async(req: ExtReq, res: Response, next: NextFunction)=>{
    if(!req.session.user)return res.status(401).json("user is unauthenticated.")
    try{
        const getAuthServiceResponse = (await getService(services.auth.name, services.auth.version)).data
        if(!getAuthServiceResponse?.ip)return res.status(500).json("service temporarily unavailable")
        const url = `http://${getAuthServiceResponse.ip}:${getAuthServiceResponse.port}/users/${req.session.user}`
        fetch(url)
        .then(res=>res.json())
        .then(res=>{
            req.user = res
        })
        .catch(ex=>{
            throw ex
        })
        }catch(ex){
            return res.status(500).json("service temporarily unavailable.")
        }
}