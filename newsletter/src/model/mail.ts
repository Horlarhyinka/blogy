import mongoose, {Document} from "mongoose";

export interface mail_int extends Document{
    email: string
}

const mailSchema = new mongoose.Schema<mail_int>({
    email: {
        type: String,
        match: /^[a-z0-9\.\-]{3,}@[a-z0-9@]{3,}\.[a-z0-9\.]+$/i,
        required: true,
        unique: true
    }
})

export default mongoose.model("mail", mailSchema)