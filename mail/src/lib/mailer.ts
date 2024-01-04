import { url } from "inspector";
import nodemailer from "nodemailer";
import { promisify } from "util";
import pug from "pug"
import path from "path";
import { mail_types, renderFile } from "./factory";

interface Mailer_int{
    sendMail: (type: mail_types, data: object)=>Promise<void>
}

class Mailer implements Mailer_int{
    constructor(
        private email: string, 
        private tranportUrl = `smtp${process.env.NODE_ENV === "production" && "s"}://${process.env.MAIL_USER}:${process.env.MAIL_PASSWORD}@smtp.mailtrap.io/?pool=true&&service=${process.env.MAIL_SERVICE}`){
    }
    private transporter = nodemailer.createTransport({
        url: this.tranportUrl
    })
    sendMail = async(type: mail_types, data: object) =>{
        const content = renderFile(path.resolve(__dirname, `../views/${type}.pug`), data)
        await this.transporter.sendMail({
            from: process.env.MAIL_ADDRESS,
            to: this.email,
            html: content?.toString()
        })
    }
}

export default Mailer;