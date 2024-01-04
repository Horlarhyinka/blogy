import express, {Response, Request} from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import http from "http";
import registry from "./lib/registry";

dotenv.config()

const port = process.env.port || 5000

const app = express()

app.use(cors({
    origin: "*"
}))
app.use(helmet())
app.use(express.urlencoded({extended: true}))
app.use(express.json())

app.put("/services/register/:serviceName/:serviceVersion/:servicePort", (req: Request, res: Response)=>{
    const {serviceName, servicePort, serviceVersion} = req.params;
    const serviceIp = req.socket.remoteAddress?.includes("::")?`[${req.socket.remoteAddress}]`: req.socket.remoteAddress;
    const registeredService = registry.register(serviceName, serviceVersion, serviceIp!, Number(servicePort))
    return res.status(200).json(registeredService)
})

app.delete("/services/unregister/:serviceName/:serviceVersion/:servicePort", (req: Request, res: Response)=>{
    const {serviceName, servicePort, serviceVersion} = req.params;
    const serviceIp = req.socket.remoteAddress?.includes("::")?`[${req.socket.remoteAddress}]`: req.socket.remoteAddress;
    const unregisteredService = registry.unregister(serviceName, serviceVersion, serviceIp!, Number(servicePort))
    return res.status(200).json(unregisteredService)
})

app.get("/services/:serviceName/:serviceVersion", (req: Request, res: Response)=>{
    const {serviceName, serviceVersion} = req.params;
    const service = registry.getService(serviceName, serviceVersion)
    if(!service )return res.status(503).json("service unavailable")
    return res.status(200).json(service)
})

function start(){
    const server = http.createServer(app).listen(port)
    server.on("listening", ()=>{
        console.log(`server listening on port ${(server.address() as {port: number}).port}`)
    })
    return server
}

const server = start()

export default server;