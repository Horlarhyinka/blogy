import express, {Request, Response} from "express";
import cors from "cors";
import helmet from "helmet";
import http from "http";
import pkj from "../package.json";
import dotenv from "dotenv";
import amqplib from "amqplib"
import { queues } from "./lib/factory";
import { mail_types } from "./lib/factory";
import mongoose from "mongoose";
import { mail_int } from "./model/mail";
import Mail from "./model/mail";
import {subscribe, unsubscribe} from "./controller/newsletter";
import axios from "axios";

dotenv.config()

const app = express()

app.use(cors())
app.use(helmet());
app.use(express.json())
app.use(express.urlencoded({extended: true}));

(async()=>{
    const conn = await amqplib.connect(process.env.RABBITMQ_CONNECTION_URI!)
    try{
        const channel =  await conn.createChannel()
        try{
        await channel.assertQueue(queues.news)
        await channel.assertQueue(queues.mail)
        console.log("grpc queues running...")
        channel.consume(queues.news, async(msg)=>{
            if(msg !== null){
                try{
                    const data = JSON.parse(msg.content.toString())
                    if(!data.type || !mail_types[data.type as keyof typeof mail_types])return;
                    let mails:mail_int[] = []
                    mails = await Mail.find({})
                    for(const mail of mails){
                        const body = {...data, email: mail.email}
                        channel.sendToQueue(queues.mail, Buffer.from(JSON.stringify(body)))
                    }
                }catch(ex){
                    console.log(ex)
                }
            }
        })
        }catch(ex){
            console.log(`Error: unable to assert queue`, ex)
        }
    }catch(ex){

    }
})()

app.put("/", subscribe)
app.delete("/", unsubscribe)

async function start(){
    const server = http.createServer(app)
    await mongoose.connect(process.env.DB_URI!)
    console.log("connected to db")
    server.listen(process.env.PORT)


    const register = () =>axios.put(`${process.env.REGISTRY_URL}/register/${pkj.name}/${pkj.version}/${port}`)
    const unregister = () =>axios.delete(`${process.env.REGISTRY_URL}/unregister/${pkj.name}/${pkj.version}/${port}`)
    const interval = setInterval(register, 20000)
    process.on("uncaughtException", ()=>{
        clearInterval(interval)
        unregister()
    })
    process.on("SIGINT", ()=>{
        clearInterval(interval)
        unregister()
    })
    process.on("UNHANDLEDREJECTION", ()=>{
        clearInterval(interval)
        unregister()
    })

    const port = (server.address() as {port: number}).port
    
    server.on("listening", ()=>{
        console.log(`service ${pkj.name} v${pkj.version} running on port ${port}`)
        register()
    })
    return server
}

const server = start()
export default server;