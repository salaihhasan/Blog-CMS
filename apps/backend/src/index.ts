import "dotenv/config";
import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

import { errorMiddleware } from "./middleware/errorMiddleware.js";

const app = express();

app.use(cors({ origin: "https://blog-cms-9upg.vercel.app/" }));
app.use(express.json());


app.use("/api/admin", authRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/categories", categoryRoutes);


app.get("/api/test", (_req, res) => {
  res.json({
    message: "Backend connected successfully",
    blogs: ["React Basics", "Node.js Guide", "MongoDB Tutorial"],
  });
});

connectDB();

app.use(errorMiddleware);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log("Backend running on http://localhost:5001");
});
