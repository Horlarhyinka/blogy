import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config()

export default ()=>{
    const uri = process.env.DB_URI!
   return mongoose.connect(uri)
}