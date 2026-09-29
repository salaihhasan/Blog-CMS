import express from "express";
import { loginAdmin,registerAdmin } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/register",registerAdmin);
router.post("/login",loginAdmin);
router.get("/profile", authMiddleware, (_req, res) => {
  res.json({
    success: true,
    message: "You are authenticated",
  });
});
export default router;

