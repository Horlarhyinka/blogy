import express, {Request, Response} from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import http from "http";
import pkj from "../package.json"
import { mail_types } from "./lib/factory";
import Mailer from "./lib/mailer";
import axios from "axios";
import useQueue from "./lib/queue";

dotenv.config()

const app = express()

app.use(cors({
    origin: "*"
}))

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use(helmet());


//listener
useQueue()

app.post("/", async(req: Request, res: Response)=>{
    const {email, type, ...data} = req.body;
    if(!email)return res.status(400).json("provide email address")
    const mailTypes = Object.values(mail_types)
    if(!mailTypes.includes(type?.toUpperCase()))return res.status(400).json(`invalid type ${type} - type can only be ${mailTypes.join(", ")}`)
    const mailer = new Mailer(email)
    try{
        await mailer.sendMail(mail_types[type as keyof typeof mail_types], {...data, email})
        return res.status(200).json("mail sent successfully.")
    }catch(ex){
        console.log(ex)
        return res.status(500).json("failed to send mail")
    }
})

app.use((req: Request, res: Response)=>{
    return res.status(404).json(`path ${req.path} method ${req.method} does not exist`)
})

function start(){
    const server = http.createServer(app).listen(0)
    const port = (server.address() as {port: number}).port
    server.on("listening", ()=>{
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
        register()
        console.log(`service ${pkj.name} version ${pkj.version} is listening on port ${port}`)
    })
    return server
}

const server = start()

export default server