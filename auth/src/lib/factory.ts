export type service_type = {name: string, version: string, ip: string, port: number}

export const AuthService = {
    name: "auth",
    version: "1.0.0"
}

export const services = {
    auth: {
        name: "auth",
        version: "1.0.0"
    },
    mail: {
        name: "mail",
        version: "1.0.0"
    },
}

export enum mail_types {
    PASSWORD_RESET_TOKEN = "PASSWORD_RESET_TOKEN",
    ONBOARDING = "ONBOARDING",
    PASSWORD_RESET_CONFIRMATION = "PASSWORD_RESET_CONFIRMATION",
    NEW_BLOG_NOTIFICATION = "NEW_BLOG_NOTIFICATION",
    NEWSLETTER_CONFIRMATION = "NEWSLETTER_CONFIRMATION"
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
