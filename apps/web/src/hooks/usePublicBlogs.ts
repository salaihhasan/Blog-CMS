import { blogsApi } from "../services/api";
import type { Blog } from "../types/blog";
import { useApi } from "./useApi";

/**
 * Published blogs for the public site, via `GET /api/blogs/public` (no JWT).
 *
 * Note: `GET /api/categories` is admin-only, so the public category filter is
 * derived from the category values present in this list instead.
 */
export const usePublicBlogs = () =>
  useApi<Blog[]>(() => blogsApi.listPublic(), []);

/** Unique category names, in alphabetical order. */
export const categoriesOf = (blogs: Blog[]) =>
  [...new Set(blogs.map((b) => b.category).filter(Boolean))].sort();
