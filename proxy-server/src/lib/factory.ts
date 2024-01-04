import axios from "axios";
import dotenv from "dotenv";
import circuitBreaker from "./circuit-breaker";

dotenv.config()

export const getOrSetCache = async(key: string, fn: Function)=>{

}

export const getService = async(name: string, version: string)=>{
    return circuitBreaker.callService({method: "GET", url: `${process.env.REGISTRY_URL}/${name}/${version}`})
}

export const stripBrackets = (str: string)=>str.replace(/[\[\]]/g, '')

export const services = {
    auth: {
        name: "auth",
        version: "1.0.0"
    },
    blog: {
        name: "blog",
        version: "1.0.0"
    },
    newsletter: {
        name: "newsletter",
        version: "1.0.0"
    }
}
export enum mail_types{ onboarding="ONBOARDING", reset_password_token="PASSWORD_RESET_TOKEN"}


export const httpRequest = async(options: {url: string, method: string, data?: object})=>{
    try{
        const res = await fetch(options.url, {method: options.method, body: JSON.stringify(options.data as BodyInit), headers: {"Content-Type": "application/json"}}, )
        const data = await res.json()
        return {data, status: res.status}
    }catch(ex){
        throw ex;
    }
}
