import amqplib from "amqplib";
import dotenv from  "dotenv";

dotenv.config()

interface queue_data{
    email: string
    type: string
}

const mailQueue = async()=>{
    const queue = "mail";
    const conn = await amqplib.connect(process.env.RABBITMQ_CONNECTION_URL!)
    const channel = await conn.createChannel()
    try{
        await channel.assertQueue(queue)
        console.log(`queue ${queue} is up and running`)
    }catch(ex){
        console.log(`error with queue ${queue}: `, ex)
    }
    return {
        enqueue: (data: queue_data)=>channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)))
    }
}

export default mailQueue();