import express from "express";
import { createOrder, getUserOrders } from "../controllers/order.controller.js";
import { auth } from "../middleware/auth.js";
import axios from "axios";

const router = express.Router();

router.use(auth);

router.post("/webhook/paymob", async (req, res) => {
  try {
    const eventData = req.body;

    // Check for the transaction status in the webhook payload
    if (eventData && eventData.obj && eventData.obj.success) {
      // Payment was successful
      const transactionData = eventData.obj;

      // Extract necessary details from transactionData
      const orderId = transactionData.order_id;
      const amountPaid = transactionData.amount_cents;
      const paymentMethod = transactionData.payment_method;

      // Perform actions after successful payment
      // e.g., updating order status in your database
      //   await Order.updateOne({ _id: orderId }, { status: "Paid", amountPaid });

      res.status(200).send("Webhook received and processed successfully");
    } else {
      // Handle other statuses or errors here
      console.log("Payment failed or event data invalid", eventData);
      res.status(400).send("Event data invalid or payment failed");
    }
  } catch (error) {
    console.error("Error handling Paymob webhook:", error);
    res.status(500).send("Internal server error");
  }
});

router.post("/paymob/authenticate", async (req, res) => {
  try {
    const authResponse = await axios.post(`${process.env.PAYMOB_API_BASE}/auth/tokens`, {
      api_key: process.env.PAYMOB_API_KEY,
    });
    res.json(authResponse.data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Authentication Failed" });
  }
});

router.post("/paymob/payment-key", async (req, res) => {
  const { authToken, orderId, amountCents } = req.body;
  console.log("working", authToken);
  try {
    const paymentKeyResponse = await axios.post(
      `${process.env.PAYMOB_API_BASE}/acceptance/payment_keys`,
      {
        auth_token: authToken,
        amount_cents: amountCents,
        expiration: 3600,
        order_id: orderId,
        billing_data: {
          apartment: "NA",
          email: "example@example.com",
          floor: "NA",
          first_name: "John",
          street: "Sample",
          building: "NA",
          phone_number: "+20123456789",
          shipping_method: "NA",
          postal_code: "NA",
          city: "Cairo",
          country: "EGY",
          last_name: "Doe",
          state: "NA",
        },
        currency: "EGP",
        integration_id: process.env.PAYMOB_INTEGRATION_ID,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );
    res.json(paymentKeyResponse.data);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});
router.post("/", createOrder);
router.get("/:userId", getUserOrders);

export default router;
