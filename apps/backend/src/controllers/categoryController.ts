import type { Request, Response } from "express";
import Category from "../models/Category.js";

export const getCategories = async (req: Request, res: Response) => {
  const categories = await Category.find();

  return res.status(200).json({
    success: true,
    message: "Categories fetched successfully",
    data: categories,
  });
};

export const createCategory = async (req: Request, res: Response) => {
  const { name, slug } = req.body;

  if (!name || !slug) {
    return res.status(400).json({
        success: false,
        message: "Name and slug are required",
    });
}

if (name.trim().length < 2) {
    return res.status(400).json({
        success: false,
        message: "Category name must be at least 2 characters",
    });
}

if (slug.trim().length < 2) {
    return res.status(400).json({
        success: false,
        message: "Category slug must be at least 2 characters",
    });
}

  const existingCategory = await Category.findOne({
    $or: [{ name }, { slug }],
  });

  if (existingCategory) {
    return res.status(409).json({
      success: false,
      message: "Category already exists",
    });
  }

  const category = new Category({
    name,
    slug,
  });

  await category.save();

  return res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  const updatedCategory = await Category.findByIdAndUpdate(
    id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedCategory) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: updatedCategory,
  });
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  const deletedCategory = await Category.findByIdAndDelete(id);

  if (!deletedCategory) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Category deleted successfully",
    data: deletedCategory,
  });
};