import mongoose, {Document} from "mongoose";
import { categories } from "../util/factory";

interface blog_int extends Document{
    category: string
    title: string
    header?: string
    body: string
    postedBy: string
}

const blogSchema = new mongoose.Schema<blog_int>({
    category: {
        type: String,
        required: true,
        enum: Object.values(categories)
    },
    header: {
        type: String
    },
    title: {
        type: String,
        required: true
    },
    body:{
        type: String,
        required: true
    },
    postedBy: {
        type: String,
        required: true
    }
})

export default mongoose.model("blog", blogSchema)