import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getHomePageStatistics,
  getProduct,
  updateProduct,
} from "../controllers/product.controller.js";
import uploadProductImg from "../config/mutler.js";

const router = Router();

router.route("/").post(uploadProductImg.array("image_urls"), createProduct);

router.get("/statistics", getHomePageStatistics);
router.get("/search", getAllProducts);

router.route("/:id").get(getProduct).patch(updateProduct);

export default router;
