import {Request,Response} from "express";
import Blog from "../models/Blog.js";
import { generateSlug } from "../utils/slug.js";

export const createBlog = async(req:Request,res:Response)=>{
    const {title,description,content,thumbnail,category,tags,status} = req.body;

    if (!title || title.trim().length < 5) {
        return res.status(400).json({
            success: false,
            message: "Title is required and must be at least 5 characters"
        });
    };
    if (!description || !description.trim()) {
        return res.status(400).json({
            success: false,
            message: "Description is required"
        });
    };
    if (!content || !content.trim()) {
        return res.status(400).json({
            success: false,
            message: "Content is required"
        });
    }
    if (!category || !category.trim()) {
        return res.status(400).json({
            success: false,
            message: "Category is required"
        });
    }
    if (status && !["draft", "published"].includes(status)) {
    return res.status(400).json({
        success: false,
        message: "Status must be either draft or published",
    });
}
     if (status === "published" && !thumbnail) {
        return res.status(400).json({
            success: false,
            message: "Thumbnail is required when publishing a blog"
        });
    }
    const slug = generateSlug(title);

    const blog = new Blog({
        title,
        slug,
        description,
        content,
        thumbnail,
        category,
        tags,
        status : status || "draft",
        author : req.adminId!
    });
    await blog.save();
    res.status(201).json({
        success:true,
        message : "Blog created successfully",
        data: blog
    });
};

export const getBlogs = async(req:Request,res:Response)=>{
    const blog = await Blog.find();
    res.status(200).json({
        message: "Blogs fetched successfully",
        data: blog
    });
};

export const getBlogById = async(req:Request,res:Response)=>{
    const {id} = req.params;
    const blog = await Blog.findById(id);
    
    if (!blog) {
    return res.status(404).json({
        success: false,
        message: "Blog not found"
    });
}

    res.status(200).json({
        message: "Blogs fetched successfully",
        data: blog
    });

};

export const updateBlog = async (req: Request, res: Response) => {
    const { id } = req.params;

    const existingBlog = await Blog.findById(id);

    if (!existingBlog) {
        return res.status(404).json({
            success: false,
            message: "Blog not found"
        });
    }

    const {
        title,
        thumbnail,
        status
    } = req.body;

    // Validate title if it is being updated
    if (title !== undefined && title.trim().length < 5) {
        return res.status(400).json({
            success: false,
            message: "Title must be at least 5 characters"
        });
    }

    // Validate status
    if (
        status !== undefined &&
        !["draft", "published"].includes(status)
    ) {
        return res.status(400).json({
            success: false,
            message: "Status must be either draft or published"
        });
    }

    // Keep existing thumbnail if one isn't provided
    const finalThumbnail =
        thumbnail !== undefined
            ? thumbnail
            : existingBlog.thumbnail;

    // Published blogs must have a thumbnail
    if (status === "published" && !finalThumbnail) {
        return res.status(400).json({
            success: false,
            message: "Thumbnail is required when publishing a blog"
        });
    }

    const updateData: any = {
        ...req.body
    };

    // Regenerate slug if title changes
    if (title !== undefined) {
        updateData.slug = generateSlug(title);
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
        id,
        updateData,
        {
            new: true,
            runValidators: true
        }
    );

    return res.status(200).json({
        success: true,
        message: "Blog updated successfully",
        data: updatedBlog
    });
};

export const deleteBlog = async(req:Request,res:Response)=>{
    const {id} = req.params;
    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
    return res.status(404).json({
        success: false,
        message: "Blog not found"
    });
}
    res.status(200).json({
        message: "Blog deleted successfully",
        data: blog
    });
};

export const getPublicBlogs = async (req: Request,res: Response) => {
    const { search,category } = req.query;

    const filter: any = {
        status: "published"
    };

    if (search && typeof search === "string") {
        filter.$or = [
            {
                title: {
                    $regex: search,
                    $options: "i"
                }
            },
            {
                description: {
                    $regex: search,
                    $options: "i"
                }
            },
            {
                tags: {
                    $regex: search,
                    $options: "i"
                }
            }
        ];
    }
     if (category && typeof category === "string") {
        filter.category = {
            $regex: `^${category}$`,
            $options: "i"
        };
    }

    const blogs = await Blog.find(filter);

    return res.status(200).json({
        success: true,
        message: "Public blogs fetched successfully",
        data: blogs
    });
};

export const getPublicBlogBySlug = async (
    req: Request,
    res: Response
) => {
    const { slug } = req.params;

    const blog = await Blog.findOne({
        slug,
        status: "published"
    });

    if (!blog) {
        return res.status(404).json({
            success: false,
            message: "Published blog not found"
        });
    }

    return res.status(200).json({
        success: true,
        message: "Public blog fetched successfully",
        data: blog
    });
};