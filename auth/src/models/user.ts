import mongoose, {Document} from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";


dotenv.config()

const mail_regex = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/ 

export interface user_int extends Document{
    email: string
    password: string
    username?: string
    about?: string
    tokenExpiresIn: number
    resetToken: string
    comparePassword: (password: string)=>Promise<boolean>
}

const userSchema = new mongoose.Schema<user_int>({
    email: {
        type: String,
        match: mail_regex,
        required: [true, "email is required"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "password is required"],
        minlength: [6, "password length must be greater than or equal to 6"]
    },
    username: {
        type: String,
        minlength: 3
    },
    about: {
        type: String,
        maxlength: 1024
    },
    resetToken: {
        type: String
    },
    tokenExpiresIn:{
        type: Number
    }
})

userSchema.pre("save", async function(next){
    if(this.isModified("password")){
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(this.password, salt)
        this.password = hashedPassword
        next()
    }
})

userSchema.methods.comparePassword = async function(password: string){
    return bcrypt.compare(password, this.password)
}


export default mongoose.model("user", userSchema)