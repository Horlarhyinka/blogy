import { mail_types } from "./factory";
import amqplib from "amqplib";
import dotenv from "dotenv";
import Mailer from "./mailer";

dotenv.config()

interface queue_data{
    type: string
    email: string
}

const useQueue = async()=>{
    const qeue = "mail";
    const conn = await amqplib.connect(process.env.RABBITMQ_CONNECTION_URL!)
    const channel = await conn.createChannel()
    await channel.assertQueue(qeue)
    channel.consume(qeue,async(msg)=>{
        if(msg !== null){
            try{
            const data: queue_data = JSON.parse(msg.content.toString())
            if(!data.email || !data.type || !mail_types[data.type as keyof typeof mail_types])throw Error("invalid mail data " + String(data)) 
            const mailer = new Mailer(data.email)
            await mailer.sendMail( mail_types[data.type as keyof typeof mail_types] ,{...data})
        }catch(ex){
                console.log(ex)
            }
        }
    })

}

export default useQueue;