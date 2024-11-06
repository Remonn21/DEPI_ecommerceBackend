import axios from "axios";
import Product from "../models/product.model.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import customError from "../utils/customError.js";
import Order from "./../models/order.model.js";

export const createOrder = asyncWrapper(async (req, res, next) => {
  const { shippingAddress, paymentMethod, products, authToken } = req.body;

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
    paymentStatus: "pending",
    orderStatus: "pending",
    shippingAddress,
    paymentMethod,
    products: orderProducts,
  });
  try {
    const orderResponse = await axios.post(
      `${process.env.PAYMOB_API_BASE}/ecommerce/orders`,
      {
        authToken: authToken,
        delivery_needed: false,
        amount_cents: totalAmount * 100,
        order_id: newOrder._id,
        currency: "EGP",
        items: [],
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    return res.json({ ...orderResponse.data, order_id: newOrder._id });
  } catch (error) {
    console.log("error creating order", error);
    return res.status(500).json({ error: error });
  }

  // res.json({ status: 201, data: newOrder });
});

export const getUserOrders = asyncWrapper(async (req, res) => {
  const orders = await Order.find({ user_id: req.params.userId });

  res.json({ status: 200, data: orders });
});
