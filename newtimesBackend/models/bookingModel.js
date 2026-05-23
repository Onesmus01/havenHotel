// models/bookingModel.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    // Guest Information
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },

    // Room Details
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    roomType: { type: String, required: true },
    roomNumber: { type: Number, required: true },
    pricePerNight: { type: Number, required: true },

    // Booking Dates & Guests
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    guests: { type: Number, required: true },
    nights: { type: Number, required: true },

    // Preferences
    bedType: { type: String, enum: ["king", "queen", "twin"], default: "king" },
    smokingPreference: { type: String, enum: ["non-smoking", "smoking"], default: "non-smoking" },
    floorPreference: { type: String, enum: ["high", "low", "no-preference"], default: "no-preference" },

    // Add-ons
    airportTransfer: { type: Boolean, default: false },
    earlyCheckIn: { type: Boolean, default: false },
    lateCheckOut: { type: Boolean, default: false },
    extraBed: { type: Boolean, default: false },

    // Special Requests
    specialRequests: { type: String, trim: true },

    // Totals
    roomTotal: { type: Number, required: true },
    addOnsTotal: { type: Number, required: true },
    serviceFee: { type: Number, default: 25 },
    taxes: { type: Number, required: true },
    totalAmount: { type: Number, required: true },

    // Status & Payment
    status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
