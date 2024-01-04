import HttpProxy from "http-proxy";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import pkj from "../package.json";
import dotenv from "dotenv";
import { getService } from "./lib/factory";
import { services } from "./lib/factory";
import connectDb from "./config/db";
import Session from "express-session";
import cookieParser from "cookie-parser";
import MongoStore from "connect-mongo";

dotenv.config()

const app = express()

app.use(cors())
app.use(helmet())
app.use(cookieParser())
app.use(Session({
    store: new MongoStore({
        mongoUrl: process.env.DB_URI!,
        collectionName: "sessions"
    }),
    secret: process.env.APP_SECRET!,
    saveUninitialized: false,
    resave: true
}))

const proxy = HttpProxy.createProxyServer({})

app.use("/api/v1/auth", async(req: Request, res: Response, next: NextFunction)=>{
    try{
    const getAuthServiceResponse = (await getService(services.auth.name, services.auth.version)).data
    if(!getAuthServiceResponse?.ip)return res.status(500).json("service temporarily unavailable")
    const url = `http://${getAuthServiceResponse.ip}:${getAuthServiceResponse.port}`
    proxy.web(req, res, {target: url}, (err)=>{
        console.log(err)
        return res.status(503).json("service temporarily unavailable.")
    })
    }catch(ex){
        return res.status(503).json("service temporarily unavailable.")
    }
})



app.use("/api/v1/blogs", async(req: Request, res: Response)=>{
    try{
        const blogService = (await getService(services.blog.name, services.blog.version)).data
        if(!blogService?.ip)return res.status(500).json("service temporarily unavailable")
        const url = `http://${blogService.ip}:${blogService.port}`
        proxy.web(req, res, {target: url}, (err)=>{
            console.log(err)
        return res.status(503).json("service temporarily unavailable.")
            
        })
    }catch(ex){
        return res.status(503).json("service temporarily unavailable.")
    }
})

async function start(){
    await connectDb()
    console.log(`service ${pkj.name} db started.`)
    const server = http.createServer(app).listen(process.env.PORT || 5001)
    const port = (server.address() as {port: number}).port 
    server.on("listening", ()=>{
        console.log(`${pkj.name} v${pkj.version} is running on port ${port}`)
    })
    return server;
}

const server = start()

export default server;