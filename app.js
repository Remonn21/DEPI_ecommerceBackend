import express from "express";
import cors from "cors";
import "dotenv/config";

import { connectToDb } from "./utils/dbConnect.js";
import errorHandler from "./middleware/errorHandler.js";

import routes from "./routes/index.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/health", (req, res, next) => {
  res.send("working");
});

// Routes

app.use("/api", routes);

// global error handler (handles existing routes with invalid data that prevents the app from crashing)
app.use(errorHandler);

// Database

connectToDb();

//   Server
const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
