import express from "express";
import {
  initiateMpesaPayment,
  mpesaWebhook,
  cancelMpesaPayment,
  checkPaymentStatus,
  confirmCashPayment,
  getPayment,
  getPaymentsByBooking,
  updatePaymentStatus,
  getTotalRevenue,
  getAllPayments
} from "../controller/paymentController.js";
import authToken from "../middleware/authToken.js";
import isAdmin from "../middleware/adminAuth.js";

const router = express.Router();

// User routes
router.get("/all-payments", authToken,  getAllPayments);

router.post("/mpesa/pay", authToken, initiateMpesaPayment);
router.post("/mpesa/cancel/:transactionId", authToken, cancelMpesaPayment);
router.get("/mpesa/status/:transactionId", authToken, checkPaymentStatus);
router.post("/cash/confirm", authToken, confirmCashPayment);
router.get("/booking/:bookingId", authToken, getPaymentsByBooking);
router.get("/:id", authToken, getPayment);

// M-Pesa webhook — MUST be public (no auth)
router.post("/mpesa/webhook", express.json(), mpesaWebhook);


// Admin routes
router.patch("/:id/status", authToken, isAdmin, updatePaymentStatus);
router.get("/total-revenue", authToken, isAdmin, getTotalRevenue);

export default router;