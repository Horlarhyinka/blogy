
import amqplib from "amqplib";
import dotenv from "dotenv";

dotenv.config()

interface queue_data{
    type: string
}

const useQueue = async()=>{
    const queue = "news";
    const conn = await amqplib.connect(process.env.RABBITMQ_CONNECTION_URL!)
    const channel = await conn.createChannel()
    await channel.assertQueue(queue)
    console.log(`${queue} queue asserted.`)
    return {
        sendToNewsQueue: function <T>(data: T){
        return channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)))
        }
    }
}

export default useQueue();