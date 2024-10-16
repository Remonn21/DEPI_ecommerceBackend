import Review from "../models/review.model.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";

export const createReview = asyncWrapper(async (req, res) => {
  const { product_id, rating, comment } = req.body;

  // Check if the user has already reviewed the product
  const existingReview = await Review.findOne({ product_id, user_id });
  if (existingReview) {
    return res.json({
      status: 400,
      data: { message: "You have already reviewed this product." },
    });
  }

  const newReview = await Review.create({
    product_id,
    user: req.currentUser,
    rating,
    comment,
  });

  res.json({ status: 201, data: newReview });
});

export const getProductReviews = asyncWrapper(async (req, res) => {
  const { productId } = req.params;
  const reviews = await Review.find({ product_id: productId }).populate(
    "user_id",
    "name"
  );

  res.json({ status: 200, data: reviews });
});
