import Product from "../models/product.model.js";
import Review from "../models/review.model.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import customError from "../utils/customError.js";

export const createReview = asyncWrapper(async (req, res, next) => {
  const { product_id, rating, comment } = req.body;
  const user_id = req.currentUser.id;

  const existingReview = await Review.findOne({ product: product_id, user: user_id });
  if (existingReview) {
    return next(
      customError.create("You have already reviewed this product.", 400, "conflict")
    );
  }

  const newReview = await Review.create({
    product: product_id,
    user: user_id,
    username: req.currentUser.name,
    rating,
    comment,
  });

  await Product.findByIdAndUpdate(product_id, {
    $push: { reviews: newReview._id },
  });

  const product = await Product.findById(product_id).populate("reviews");

  const totalRating = product.reviews.reduce((acc, review) => acc + review.rating, 0);
  const avgRating = totalRating / product.reviews.length;

  await Product.findByIdAndUpdate(product_id, { rating: avgRating });

  res.status(201).json({
    status: 201,
    data: { review: newReview },
  });
});

export const getProductReviews = asyncWrapper(async (req, res) => {
  const { productId } = req.params;
  const reviews = await Review.find({ product_id: productId }).populate(
    "user_id",
    "name"
  );

  res.json({ status: 200, data: reviews });
});
