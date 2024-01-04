import dotenv from "dotenv"
import mongoose from "mongoose"

dotenv.config()

const connectDb = () =>{
    return mongoose.connect(process.env.DB_URI!)
}

export default connectDb