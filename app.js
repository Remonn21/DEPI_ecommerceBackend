import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";

import productRoute from "./routes/product.route.js";
import userRouter from "./routes/users.route.js";

const app = express();

app.use(cors());

app.use("/health", (req, res, next) => {
  res.send("working");
});

// Routes
app.use("/api/users", userRouter);
app.use("/products", productRoute);

app.all("*", (req, res, next) => {
  return res.status(404).json({
    status: "Error",
    message: "this resource is not available",
  });
});

// global error handler (handles existing routes with invalid data that prevents the app from crashing)
app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    status: error.statusText || "Error",
    message: error.message,
    code: error.statusCode || 500,
    data: null,
  });
});

// Database

mongoose
  .connect(process.env.MONGODB_CONNECTION)
  .then(() => {
    console.log("connected to database!");
  })
  .catch((error) => {
    console.log("Error connecting to database:", error);
  });

//   Server
const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
