import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, index: true },

    // Payment type: distinguishes original booking from extension/upgrade payments
    paymentType: {
      type: String,
      enum: ["booking", "extension", "upgrade", "other"],
      default: "booking",
    },

    // Guest snapshot (in case user changes profile later)
    customerName: { type: String, trim: true },
    customerEmail: { type: String, trim: true, lowercase: true },
    customerPhone: { type: String, trim: true },

    // Financials
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "KES" },

    // Method
    method: {
      type: String,
      enum: ["mpesa", "card", "bank", "cash"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "success", "failed", "cancelled", "refunded"],
      default: "pending",
    },

    // M-Pesa
    phoneNumber: { type: String, trim: true },
    mpesaReceiptNumber: { type: String, trim: true, index: true },
    mpesaCheckoutRequestId: { type: String, trim: true, index: true },

    // Card (tokenized only — NEVER store raw PAN/CVV)
    cardLastFour: { type: String },
    cardBrand: { type: String },

    // Bank transfer
    bankReference: { type: String, trim: true },
    bankProofUrl: { type: String },

    // Cash on arrival
    cashReceivedBy: { type: String },
    cashReceivedAt: { type: Date },

    // Audit
    transactionId: { type: String, unique: true, sparse: true },
    gatewayResponse: { type: mongoose.Schema.Types.Mixed },
    failureReason: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },

    // Receipt
    receiptSent: { type: Boolean, default: false },
    receiptUrl: { type: String },
  },
  { timestamps: true }
);

paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ status: 1, method: 1 });
paymentSchema.index({ booking: 1, paymentType: 1, status: 1, createdAt: -1 });

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;