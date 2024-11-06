import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getHomePageStatistics,
  getProduct,
  updateProduct,
} from "../controllers/product.controller.js";
import uploadProductImg from "../config/mutler.js";
import { auth, optionalAuth } from "../middleware/auth.js";
import { validateGetProductsQueryParmaters } from "../middleware/validaiton.js";

const router = Router();

router.route("/").post(auth, uploadProductImg.array("image_urls"), createProduct);

router.get("/statistics", getHomePageStatistics);
router.get("/search", validateGetProductsQueryParmaters, getAllProducts);

router.route("/:id").get(optionalAuth, getProduct).patch(auth, updateProduct);

export default router;
