import Booking from "../models/bookingModel.js";
import Room from "../models/roomModel.js";
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

/**
 * Create a booking
 */
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

    // ❌ NOTHING HERE — room stays available until payment succeeds

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

/**
 * Confirm booking after successful payment
 * Call this from your payment webhook or payment success handler
 */
export const confirmBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // Only confirm if currently pending
    if (booking.status !== "pending") {
      return res.status(400).json({ success: false, message: "Booking is not pending" });
    }

    // Update booking
    booking.status = "confirmed";
    booking.paymentStatus = "paid"; // or "success" depending on your flow
    await booking.save();

    // ✅ NOW mark room as booked — only after payment succeeds
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

/**
 * Update booking payment status (call from payment controller)
 */
export const updateBookingPaymentStatus = async (bookingId, paymentStatus) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) return;

  booking.paymentStatus = paymentStatus;

  if (paymentStatus === "success" || paymentStatus === "paid") {
    booking.status = "confirmed";
    // Lock the room only now
    await Room.findByIdAndUpdate(booking.roomId, { status: "booked" });
  } else if (paymentStatus === "failed" || paymentStatus === "cancelled") {
    booking.status = "cancelled";
    // Room stays available — no need to update Room status
  }

  await booking.save();
  return booking;
};

// Get booking history for a user
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

    const wasConfirmed = booking.status === "confirmed"; // 🔥 CHECK BEFORE CHANGING

    booking.status = "cancelled";
    booking.paymentStatus = "cancelled";
    await booking.save();

    // Free room only if it was actually locked
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
      .sort({ createdAt: -1 }) // latest → oldest
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

