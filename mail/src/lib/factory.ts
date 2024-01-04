import dotenv from "dotenv";
import pug from "pug"

dotenv.config()

export const renderFile = (path: string, data: object)=>{
    return pug.renderFile(path, {...data, debug: process.env.NODE_ENV !== "production",  cache: process.env.NODE_ENV === "production"})
}

export enum mail_types {
    PASSWORD_RESET_TOKEN = "PASSWORD_RESET_TOKEN",
    ONBOARDING = "ONBOARDING",
    PASSWORD_RESET_CONFIRMATION = "PASSWORD_RESET_CONFIRMATION",
    NEW_BLOG_NOTIFICATION = "NEW_BLOG_NOTIFICATION",
    NEWSLETTER_CONFIRMATION = "NEWSLETTER_CONFIRMATION"
}