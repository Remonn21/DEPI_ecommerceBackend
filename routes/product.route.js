import { Router } from "express";
import { createProduct, getAllProducts } from "../controllers/product.controller.js";

const router = Router();

router.get("/", getAllProducts).post("/", createProduct);

export default Router;
