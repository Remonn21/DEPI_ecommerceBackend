import express from "express";
import { createReview, getProductReviews } from "../controllers/review.controller.js";

const router = express.Router();

router.route("/").post(createReview);
router.route("/:productId").get(getProductReviews);

export default router;
