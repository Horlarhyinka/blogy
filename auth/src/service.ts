import "express-async-errors";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import connectDb from "./config/db";
import router from "./routes/user";
import session from "express-session";
import cookieParser from "cookie-parser";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";
import axios from "axios";
import pkj from "../package.json";

dotenv.config()

const app = express()                         

app.use(helmet())
app.use(cors({
    origin: "*"
}))
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cookieParser())
app.use(session({
    store: new MongoStore({
        collectionName: "sessions",
        mongoUrl: process.env.DB_URI,
    }),
    secret: process.env.APP_SECRET!,
    saveUninitialized: false,
    resave: false
}));


app.use("/",router)

async function start(){
    const server = http.createServer(app)
    connectDb()
    server.listen(0)
    server.on("listening", ()=>{
        const port = (server.address() as {port: number}).port
        const register = async() =>axios.put(`${process.env.REGISTRY_URL}/register/${pkj.name}/${pkj.version}/${port}`)
        const unregister = async() =>{axios.delete(`${process.env.REGISTRY_URL}/unregister/${pkj.name}/${pkj.version}/${port}`)}
        const interval = setInterval(register, 20 * 1000)   
        register()
        process.on("uncaughtException", () =>{
            clearInterval(interval)
            unregister()
        })
        process.on("SIGINT", () =>{
            clearInterval(interval)
            unregister()
        })
        process.on("unhandledRejection", () =>{
            clearInterval(interval)
            unregister()
        })
        console.log(`server ${pkj.name} v${pkj.version} listening on port ${port}`)
    })
    return server
}
const server = start()
export default server;