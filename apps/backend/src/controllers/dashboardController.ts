import { Request, Response } from "express";
import Blog from "../models/Blog.js";
import Category from "../models/Category.js";

export const getDashboardStats = async (_req: Request, res: Response) => {
    const totalBlogs = await Blog.countDocuments();

    const publishedBlogs = await Blog.countDocuments({
        status: "published",
    });

    const draftBlogs = await Blog.countDocuments({
        status: "draft",
    });

    const totalCategories = await Category.countDocuments();

    return res.status(200).json({
        success: true,
        message: "Dashboard statistics fetched successfully",
        data: {
            totalBlogs,
            publishedBlogs,
            draftBlogs,
            totalCategories,
        },
    });
};