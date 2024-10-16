import Product from "../models/product.model.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import customError from "../utils/customError.js";
import Order from "./../models/order.model.js";

export const createOrder = asyncWrapper(async (req, res, next) => {
  const { shippingAddress, paymentMethod, products } = req.body;

  const productsId = products.map((product) => product._id);

  const productsDoc = await Product.find({ _id: { $in: productsId } });

  if (productsDoc.length !== productsId.length) {
    return next(
      customError.create("some products are out of stock or not found", 404, "not found")
    );
  }

  let totalAmount = 0;

  const orderProducts = products.map((product) => {
    const productDoc = productsDoc.find((p) => p._id.toString() === product._id);
    totalAmount += productDoc.price * product.quantity;
    return {
      product: productDoc._id,
      quantity: product.quantity,
      price: productDoc.price,
    };
  });

  const newOrder = await Order.create({
    user: req.currentUser.id,
    totalAmount: totalAmount,
    shippingAddress,
    paymentMethod,
    products: orderProducts,
  });

  res.json({ status: 201, data: newOrder });
});

export const getUserOrders = asyncWrapper(async (req, res) => {
  const orders = await Order.find({ user_id: req.params.userId });

  res.json({ status: 200, data: orders });
});
