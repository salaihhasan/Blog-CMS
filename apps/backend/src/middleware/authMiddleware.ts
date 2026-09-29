import {Request,Response,NextFunction} from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (req:Request,res:Response,next:NextFunction)=>{
    const authHeader = req.headers.authorization; 
    console.log("AUTH HEADER:", authHeader);
    if (!authHeader) {
    return res.status(401).json({
    success: false, 
    message: "Authorization token required",
  });
};

const [scheme, token] = authHeader.split(" ");

if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      success: false,
      message: "Invalid authorization format. Use Bearer <token>",
    });
  }

  try {
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET!
  ) as { id: string };
  req.adminId = decoded.id;

  console.log("Authenticated admin:", decoded);

  next();
} 
catch (error) {
  return res.status(401).json({
    message: "Invalid or expired token",
  });
}
};
