import Booking from "../models/bookingModel.js";
import Room from "../models/roomModel.js";
import User from "../models/userModel.js";
import Payment from "../models/paymentModel.js";
import mongoose from "mongoose";
import { body, validationResult } from "express-validator";

/**
 * Validation middleware for booking
 */
export const validateBooking = [
  body("firstName").trim().notEmpty().withMessage("First name is required"),
  body("lastName").trim().notEmpty().withMessage("Last name is required"),
  body("email").trim().isEmail().withMessage("Valid email is required"),
  body("phone").trim().notEmpty().withMessage("Phone number is required"),
  body("country").trim().notEmpty().withMessage("Country is required"),
  body("roomId").notEmpty().withMessage("Room ID is required"),
  body("checkIn")
    .notEmpty()
    .withMessage("Check-in date is required")
    .isISO8601()
    .toDate(),
  body("checkOut")
    .notEmpty()
    .withMessage("Check-out date is required")
    .isISO8601()
    .toDate(),
  body("guests").isInt({ min: 1 }).withMessage("Guests must be at least 1"),
];


export const createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      firstName, lastName, email, phone, country,
      roomId, checkIn, checkOut, guests,
      bedType, smokingPreference, floorPreference,
      airportTransfer, earlyCheckIn, lateCheckOut,
      extraBed, specialRequests,
    } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    // Only block confirmed bookings
    const overlappingBooking = await Booking.findOne({
      roomId,
      status: "confirmed",
      $or: [{ checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }],
    });

    if (overlappingBooking) {
      return res.status(400).json({
        success: false,
        message: "Room is already booked for the selected dates",
      });
    }

    const diffTime = Math.abs(new Date(checkOut) - new Date(checkIn));
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const roomTotal = room.price * nights;
    const addOnsTotal =
      (airportTransfer ? 50 : 0) +
      (earlyCheckIn ? 25 : 0) +
      (lateCheckOut ? 25 : 0) +
      (extraBed ? 30 * nights : 0);
    const serviceFee = 25;
    const taxes = Math.round((roomTotal + addOnsTotal) * 0.1);
    const totalAmount = roomTotal + addOnsTotal + serviceFee + taxes;

    const booking = new Booking({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      country: country.trim(),
      roomId: room._id,
      roomType: room.type,
      roomNumber: room.roomNumber,
      pricePerNight: room.price,
      checkIn,
      checkOut,
      guests,
      nights,
      bedType: bedType || "king",
      smokingPreference: smokingPreference || "non-smoking",
      floorPreference: floorPreference || "no-preference",
      airportTransfer: airportTransfer || false,
      earlyCheckIn: earlyCheckIn || false,
      lateCheckOut: lateCheckOut || false,
      extraBed: extraBed || false,
      specialRequests: specialRequests || "",
      roomTotal,
      addOnsTotal,
      serviceFee,
      taxes,
      totalAmount,
      status: "pending",
      paymentStatus: "pending",
    });

    await booking.save();

    res.status(201).json({
      success: true,
      message: "Booking created successfully. Complete payment to confirm.",
      data: booking,
    });
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ success: false, message: "Server error while creating booking" });
  }
};

export const confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ success: false, message: "Booking is not pending" });
    }

    booking.status = "confirmed";
    booking.paymentStatus = "paid";
    await booking.save();

    await Room.findByIdAndUpdate(booking.roomId, { status: "booked" });

    res.status(200).json({
      success: true,
      message: "Booking confirmed and room reserved",
      data: booking,
    });
  } catch (err) {
    console.error("Error confirming booking:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateBookingPaymentStatus = async (bookingId, paymentStatus) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) return;

  booking.paymentStatus = paymentStatus;

  if (paymentStatus === "success" || paymentStatus === "paid") {
    booking.status = "confirmed";
    await Room.findByIdAndUpdate(booking.roomId, { status: "booked" });
  } else if (paymentStatus === "failed" || paymentStatus === "cancelled") {
    booking.status = "cancelled";
  }

  await booking.save();
  return booking;
};
export const getUserBookingHistory = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const bookings = await Booking.find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "roomId",
        select: "type roomNumber images price size capacity view floor status",
      });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    console.error("Error fetching booking history:", error);
    res.status(500).json({ success: false, message: "Failed to fetch booking history" });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const wasConfirmed = booking.status === "confirmed";

    booking.status = "cancelled";
    booking.paymentStatus = "cancelled";
    await booking.save();

    if (wasConfirmed) {
      await Room.findByIdAndUpdate(booking.roomId, { status: "available" });
    }

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: booking,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .populate("roomId", "type roomNumber images price size capacity view floor");

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (err) {
    console.error("Error fetching all bookings:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
    });
  }
};
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    const user = await User.findById(userId).select("email name");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    // Fetch confirmed OR expired bookings for this user
    const bookings = await Booking.find({
      email: user.email,
      status: { $in: ["confirmed", "expired"] },
    })
      .populate("roomId", "type images location amenities roomNumber view size")
      .sort({ createdAt: -1 });

    const now = new Date();
    const enriched = bookings.map((b) => {
      const checkIn = new Date(b.checkIn);
      const checkOut = new Date(b.checkOut);
      let computedStatus = "upcoming";

      if (b.status === "expired") {
        computedStatus = "completed";
      } else if (now >= checkIn && now < checkOut) {
        computedStatus = "active";
      } else if (now >= checkOut) {
        computedStatus = "completed";
        // Also auto-mark if cron hasn't run yet
        if (b.status === "confirmed") {
          b.status = "expired";
          b.save().catch(() => {});
          Room.findByIdAndUpdate(b.roomId, { status: "available" }).catch(() => {});
        }
      }

      return {
        ...b.toObject(),
        computedStatus,
        timeRemaining: checkOut > now ? checkOut - now : 0,
      };
    });

    res.status(200).json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    console.error("[GET MY BOOKINGS ERROR]", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const user = await User.findById(userId).select("email");
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const booking = await Booking.findOne({
      _id: id,
      email: user.email,
      status: { $in: ["confirmed", "expired"] },
    }).populate("roomId", "type images location amenities description roomNumber view size");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const payments = await Payment.find({ booking: id })
      .select("amount status method createdAt mpesaReceiptNumber")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { ...booking.toObject(), payments },
    });
  } catch (error) {
    console.error("[GET BOOKING BY ID ERROR]", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const initiateExtendBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { additionalNights, method } = req.body;
    const userId = req.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const user = await User.findById(userId).select("email");
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    if (!additionalNights || additionalNights < 1 || additionalNights > 30) {
      return res.status(400).json({
        success: false,
        message: "Additional nights must be between 1 and 30",
      });
    }

    const booking = await Booking.findOne({
      _id: id,
      email: user.email,
      status: "confirmed",
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const now = new Date();
    const checkOut = new Date(booking.checkOut);

    if (now > checkOut) {
      return res.status(400).json({
        success: false,
        message: "Cannot extend expired booking",
      });
    }

    const extensionCost = additionalNights * booking.pricePerNight;
    const newCheckOut = new Date(checkOut.getTime() + additionalNights * 24 * 60 * 60 * 1000);

    const extensionPayment = await Payment.create({
      user: userId,
      booking: id,
      customerName: `${booking.firstName} ${booking.lastName}`,
      customerEmail: booking.email,
      customerPhone: booking.phone,
      amount: extensionCost,
      currency: "KES",
      method: method || "mpesa",
      status: "pending",
      transactionId: `EXT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    });

    res.status(200).json({
      success: true,
      message: "Extension initiated. Proceed to payment.",
      data: {
        extensionPaymentId: extensionPayment._id,
        originalBooking: booking,
        additionalNights,
        extensionCost,
        newCheckOut,
        currentCheckOut: checkOut,
      },
    });
  } catch (error) {
    console.error("[INITIATE EXTEND ERROR]", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const confirmExtendBooking = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { paymentId, mpesaReceiptNumber } = req.body;
    const userId = req.userId || req.user?._id;

    if (!userId) {
      await session.abortTransaction();
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const payment = await Payment.findOne({
      _id: paymentId,
      user: userId,
      booking: id,
      status: "pending",
    }).session(session);

    if (!payment) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: "Payment not found or already processed" });
    }

    payment.status = "success";
    payment.mpesaReceiptNumber = mpesaReceiptNumber || payment.mpesaReceiptNumber;
    await payment.save({ session });

    const booking = await Booking.findById(id).session(session);

    const additionalNights = Math.round(payment.amount / booking.pricePerNight);
    const oldCheckOut = new Date(booking.checkOut);
    const newCheckOut = new Date(oldCheckOut.getTime() + additionalNights * 24 * 60 * 60 * 1000);

    booking.checkOut = newCheckOut;
    booking.nights += additionalNights;
    booking.totalAmount += payment.amount;
    booking.roomTotal += payment.amount;
    await booking.save({ session });

    await User.findByIdAndUpdate(
      userId,
      {
        $inc: { totalSpent: payment.amount },
        $set: { lastBooking: new Date() },
      },
      { session }
    );

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: "Booking extended successfully",
      data: {
        booking,
        payment,
        newCheckOut,
        additionalNights,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("[CONFIRM EXTEND ERROR]", error);
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};
export const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const user = await User.findById(userId).select("email");
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const booking = await Booking.findOne({
      _id: id,
      email: user.email,
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const now = new Date();
    if (new Date(booking.checkOut) > now) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete active booking",
      });
    }

    await Booking.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Booking removed from history",
    });
  } catch (error) {
    console.error("[DELETE BOOKING ERROR]", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const autoExpireBookings = async () => {
  try {
    const now = new Date();

    const expiredBookings = await Booking.find({
      status: "confirmed",
      checkOut: { $lt: now },
    });

    if (expiredBookings.length === 0) {
      console.log("[AUTO-EXPIRE] No expired bookings found");
      return { expired: 0, released: 0 };
    }

    let releasedCount = 0;

    for (const booking of expiredBookings) {
      booking.status = "expired";
      await booking.save();

      const activeOrFutureBooking = await Booking.findOne({
        roomId: booking.roomId,
        status: "confirmed",
        _id: { $ne: booking._id },
        checkOut: { $gt: now },
      });

      if (!activeOrFutureBooking) {
        await Room.findByIdAndUpdate(booking.roomId, { status: "available" });
        releasedCount++;
        console.log(`[AUTO-EXPIRE] Room ${booking.roomNumber} released`);
      } else {
        console.log(`[AUTO-EXPIRE] Room ${booking.roomNumber} kept booked — future reservation exists`);
      }
    }

    console.log(`[AUTO-EXPIRE] ${expiredBookings.length} bookings expired, ${releasedCount} rooms released`);
    return { expired: expiredBookings.length, released: releasedCount };
  } catch (error) {
    console.error("[AUTO-EXPIRE ERROR]", error);
    throw error;
  }
};