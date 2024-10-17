import express from "express";
import { createReview, getProductReviews } from "../controllers/review.controller.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.route("/").post(auth, createReview);
router.route("/:productId").get(getProductReviews);

export default router;
