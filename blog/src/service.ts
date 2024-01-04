import express, {Request, Response} from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import http from "http";
import pkj from "../package.json";
import axios from "axios";
import { createBlog, deleteBlog, getBlog, getBlogs, updateBlog } from "./controllers/blog";
import connectDb from "./config/db";
import MongoStore from "connect-mongo";
import Session from "express-session";
import cookieParser from "cookie-parser";
import authorize from "./middlewares/authorize";

dotenv.config()

const app = express()

app.use(cors({
    origin: "*"
}))
app.use(helmet())
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cookieParser())
app.use(Session({
    secret: process.env.APP_SECRET!,
    store: new MongoStore({
        collectionName: "sessions",
        mongoUrl: process.env.DB_URI
    }),
    resave: true,
    saveUninitialized: false
}))

app.post("/", authorize, createBlog)

app.get("/", getBlogs)

app.get("/:blogId", getBlog)

app.put("/:blogId", authorize, updateBlog)

app.delete("/:blogId", authorize ,deleteBlog)

async function start(){
    const server = http.createServer(app).listen(0)
    const port = (server.address() as {port: number}).port
    const register = () =>axios.put(`${process.env.REGISTRY_URL}/register/${pkj.name}/${pkj.version}/${port}`)
    const unregister = () =>axios.delete(`${process.env.REGISTRY_URL}/unregister/${pkj.name}/${pkj.version}/${port}`)

    const interval = setInterval(register, 20 * 1000)
    process.on("SIGINT", ()=>{
        clearInterval(interval)
        unregister()
    })
    process.on("uncaughtException", ()=>{
        clearInterval(interval)
        unregister()
    })
    process.on("unhandledRejection", ()=>{
        clearInterval(interval)
        unregister()
    })
    connectDb()
    .then((res)=>{
    console.log(`${pkj.name} connected to db`)
    })
    .catch(err=>{
        console.log(`error connecting to DB Error - ${err}`)
    })
    server.on("listening", ()=>console.log(`service ${pkj.name} v${pkj.version} listening on port ${port}`))
    register()
    return server
}

const server = start()

export default server;