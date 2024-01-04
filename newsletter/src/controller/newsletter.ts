import Mail from "../model/mail";
import catchAsync from "../utils/catchAsync";
import { Request, Response,  } from "express";

export const subscribe = catchAsync(async(req: Request, res: Response)=>{
    const {email} = req.body;
    if(!email)return res.status(400).json("provide email to be added to newsletter.")
    await Mail.create({email})
    return res.status(200).json("email successfully subscribed to newsletter.")
})

export const unsubscribe = catchAsync(async(req: Request, res: Response)=>{
    const email = req.body.email || req.query.email;
    if(!email)return res.status(400).json("provide email to be removed from newsletter.")
    await Mail.findOneAndDelete({email})
    return res.status(200).json("email successfully unsubscribed")
})