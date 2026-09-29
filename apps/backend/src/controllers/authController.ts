import type { Request, Response } from "express";
import Admin from "../models/Admin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginAdmin = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required",
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid email",
        });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password",
        });
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        admin.password
    );

    if (!isPasswordValid) {
        return res.status(401).json({
            success: false,
            message: "Invalid email or password",
        });
    }

    const token = jwt.sign(
        { id: admin._id },
        process.env.JWT_SECRET!,
        { expiresIn: "1d" }
    );

    return res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
            token,
        },
    });
};


export const registerAdmin = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Name, email and password are required",
        });
    }

    if (name.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: "Name must be at least 2 characters",
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid email",
        });
    }

    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters",
        });
    }

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
        return res.status(409).json({
            success: false,
            message: "Admin already exists",
        });
    }

    const admin = new Admin({
        name,
        email,
        password,
    });

    await admin.save();

    return res.status(201).json({
        success: true,
        message: "Admin created successfully",
        data: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
        },
    });
};