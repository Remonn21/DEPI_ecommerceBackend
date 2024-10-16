import express from "express";

import categoryRouter from "./category.route.js";
import productRouter from "./product.route.js";
import userRouter from "./users.route.js";
import orderRoutes from "./order.route.js";
import reviewRoutes from "./review.route.js";

const router = express.Router();

router.use("/users", userRouter);
router.use("/products", productRouter);
router.use("/categories", categoryRouter);
router.use("/orders", orderRoutes);
router.use("/reviews", reviewRoutes);

router.all("*", (req, res, next) => {
  return res.status(404).json({
    status: "Error",
    message: "this resource is not available",
  });
});

export default router;
