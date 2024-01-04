import dotenv from "dotenv"

dotenv.config()

export enum queues{mail="mail", news="news"}

export enum mail_types {
    NEW_BLOG_NOTIFICATION = "NEW_BLOG_NOTIFICATION"
}

export const httpRequest = async(options: {url: string, method: string, data?: object})=>{
    try{
        const res = await fetch(options.url, {method: options.method, body: JSON.stringify(options.data as BodyInit), headers: {"Content-Type": "application/json"}}, )
        const data = await res.json()
        return {data, status: res.status}
    }catch(ex){
        throw ex;
    }
}
