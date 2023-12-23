import {Request, Response} from "express";
import catchAsync from "../utils/catchAsync";
import User from "../models/user";
import crypto from "crypto";
import circuitBreaker from "../lib/circuit-breaker";
import { services,service_type } from "../lib/factory";
import Queue from "../lib/queue";
import { mail_types } from "../lib/factory";


export const register = catchAsync(async(req: Request, res: Response)=>{
    try{
    
    const user = await User.create({...req.body})
    user.password = "";
    ((req.session as unknown) as {user: string}).user = String(user._id);
    const queue = await Queue;
    queue.enqueue({email: user.email, type: mail_types.ONBOARDING})
    return res.status(201).json({user})
    }catch(ex){
        throw ex;
    }
})

export const login = catchAsync(async(req: Request, res: Response)=>{
    try{
        const {email, password} = req.body;
        if(!email || !password) return res.status(400).json("email and password is required");
        const targetUser = await User.findOne({email})
        if(!targetUser)return res.status(404).json("email is not registered")
        if(!(await targetUser.comparePassword(password)))return res.status(400).json("incorrect password.");
        ((req.session as unknown) as {user: string}).user = String(targetUser._id)
        targetUser.password = ""
        return res.status(200).json(targetUser)
    }catch(ex){
        throw ex;
    }
})

export const forgetPassword = catchAsync(async(req: Request, res: Response)=>{
    try{
        const {email} = req.body;
        if(!email)return res.status(400).json("email is required")
        const targetUser = await User.findOne({email})
        if(!targetUser)return res.status(404).json("user not found")
        const random = crypto.randomBytes(12)
        const token = crypto.createHash("sha256").update(String(random)).digest().toString("hex")
        targetUser.resetToken = token
        targetUser.tokenExpiresIn = Date.now() + (30 * 60 * 1000)
        await targetUser.save()
        const mailService = (await circuitBreaker.callService({url:`${process.env.REGISTRY_URL}/${services.mail.name}/${services.mail.version}`, method: "GET"})) as {data: service_type, status: number}
        console.log(mailService)
        if(!mailService?.data?.ip)return res.status(500).json("mail service unavailable")
        const mailResponse = await circuitBreaker.callService({method: "POST", url: `http://${mailService.data.ip}:${mailService.data.port}`, data: {type: mail_types.PASSWORD_RESET_TOKEN, email, token}})
        if(!mailResponse || String(mailResponse?.status)[0] !== "2" )return res.status(500).json(`failed to complete password reset, try again later.`)
        return res.status(mailResponse.status).json(mailResponse.data)
    }catch(ex){
        throw ex;
    }

})

export const resetPassword = catchAsync(async(req: Request, res: Response)=>{
    const {resetToken} = req.params;
    try{

    if(!resetToken)return res.status(400).json("provide a valid token");
    const user = await User.findOne({resetToken, tokenExpiresIn:{$gte: Date.now()}})
    if(!user)return res.status(400).json("invalid/expired token");
    ((req.session as unknown) as {user: string}).user = String(user._id)
    user.resetToken = ""
    const {newPassword}  = req.body;
    if(!newPassword)return res.status(400).json("provide newPassword.")
    user.password = newPassword
    const updatedUser = await user.save()
    updatedUser.password = ""
    return res.status(200).json(updatedUser)
    }catch(ex){

    }
})

export const logout = catchAsync(async(req: Request, res: Response)=>{
    req.session.destroy(err=>{
        if(err)throw err
    })
    return res.status(200).json("logged out") 
})

export const getUser = catchAsync(async(req: Request, res: Response)=>{
    try{
    const {userId} = req.params
    if(!userId)return res.status(400).json("userId is required")
    const targetUser = await User.findById(userId)
    if(!targetUser)return res.status(404).json("user not found")
    targetUser.password = ""
    return res.status(200).json(targetUser);

    }catch(ex){
        console.log(ex)
        throw ex
    }
})