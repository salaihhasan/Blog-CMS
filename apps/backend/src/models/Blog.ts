import mongoose,{Schema} from "mongoose";
interface IBlog{
    title: string;
    slug: string;
    description: string;
    content: string;
    thumbnail: string;
    category: string;
    tags: string[];
    status: "draft" | "published";
    author: string;
}
const blogSchema = new Schema<IBlog>(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        description: {
            type: String,
            required: true,
            trim: true
        },
        content: {
            type: String,
            required: true,
            trim: true
        },
        thumbnail:{
            type: String,
        },
        category:{
            type: String,
            required: true,
            trim: true
        },
        tags: {
            type: [String],
            default: []
        },
        status: {
            type: String,
            enum: ["draft","published"],
            default: "draft"
        },
        author: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true
    }
);
const Blog = mongoose.model<IBlog>("Blog",blogSchema);
export default Blog;