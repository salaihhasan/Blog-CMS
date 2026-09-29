import express from "express";
import { createBlog,getBlogs,getBlogById,updateBlog,deleteBlog,getPublicBlogs,getPublicBlogBySlug } from "../controllers/blogController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/",authMiddleware,createBlog);
router.get("/",authMiddleware,getBlogs);
router.get("/public",getPublicBlogs);
router.get("/public/:slug", getPublicBlogBySlug);
router.get("/:id",authMiddleware,getBlogById);
router.put("/:id",authMiddleware,updateBlog);
router.delete("/:id",authMiddleware,deleteBlog);

export default router;