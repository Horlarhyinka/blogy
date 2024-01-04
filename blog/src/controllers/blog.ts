import catchAsync from "../util/catchAsync";
import { Request, Response } from "express";
import { categories, isValidId, mail_types } from "../util/factory";
import Blog from "../models/blog";
import { ExtReq } from "../types";
import circuitBreaker from "../lib/circuit-breaker";
import { getService, services } from "../lib/factory";
import {errorMessages} from "../util/factory";
import queue from "../lib/queue"

const msg = errorMessages
const blog_not_found = msg.resource_not_found("blog")

export const createBlog = catchAsync(async(req: ExtReq, res: Response)=>{
    const {category} = req.body;
    if(!Object.values(categories).includes(category?.toLowerCase()))return res.status(400).json(`invalid category ${category}, category can only be ${Object.values(categories).join(", ")}`)
        const blog = await Blog.create({...req.body, postedBy: req.session.user});
        const userService = await getService(services.auth.name, services.auth.version)
        if(userService?.data?.ip){
        try{
            const user = await circuitBreaker.callService({
                method: "GET", url: `http://${userService?.data?.ip}:${userService?.data?.port}/users/${blog.postedBy}`
            })
            user?.data && (await queue).sendToNewsQueue({type: mail_types.NEW_BLOG_NOTIFICATION, postedBy: user?.data?.email, category: blog.category, blogId: String(blog._id)})
        }catch(ex){
            console.log(ex)
            return res.status(500).json(msg.authorization_failed())
        }
        }
        return res.status(201).json(blog)
})

export const getBlogs = catchAsync(async(req: Request, res: Response)=>{
    const {postedBy} = req.query;
    const page = Number(req.query.page) || 1
    const count = Number(req.query.count )|| 10
    if(postedBy){
        const data = await Blog.find({postedBy}).skip((page - 1) * count).limit(count)
        const docCount = await Blog.find({postedBy}).countDocuments()
        return res.status(200).json({data, total: docCount, page, count})
    }
    const data = await Blog.find({}).skip((page - 1) * count).limit(count)
        const docCount = await Blog.find({}).countDocuments()
        return res.status(200).json({data, total: docCount, page, count})
})

export const getBlog = catchAsync(async(req: Request, res: Response)=>{
    const {blogId} = req.params;
    const blog = await Blog.findById(blogId)
    if(!blog)return res.status(404).json(blog_not_found)
    const userService = await getService(services.auth.name, services.auth.version)
    if(!userService?.data?.ip)return res.status(500).json(msg.service_unavailable(services.auth.name))
    try{
        const url = `http://${userService?.data?.ip}:${userService?.data?.port}/users/${blog.postedBy}`
        console.log({url}, "")
        const user = await circuitBreaker.callService({
            method: "GET", url })
        console.log(blog.postedBy, userService)
        if(!user?.data?._id)return res.status(500).json(msg.authorization_failed())
        return res.status(200).json({...blog.toJSON(), postedBy: user.data})
    }catch(ex){
        return res.status(500).json(msg.authorization_failed())
    }
})

export const updateBlog = catchAsync(async(req: Request, res: Response)=>{
    const {blogId} = req.params;
    const updates = {...req.body}
    delete updates["postedBy"]
    const target = await Blog.findById({_id: String(blogId), postedBy: String(req.session.user)})
    if(!target) return res.status(404).json(blog_not_found)
    const updated = await Blog.findByIdAndUpdate(blogId ,updates ,{new: true})
    return res.status(200).json(updated)
})

export const deleteBlog = catchAsync(async(req: Request, res: Response)=>{
    const {blogId} = req.params;
    const target = await Blog.findOne({_id: String(blogId), postedBy: String(req.session.user)})
    if(!target)return res.status(404).json(blog_not_found)
    await target.deleteOne()
    return res.status(200).json(target)
});