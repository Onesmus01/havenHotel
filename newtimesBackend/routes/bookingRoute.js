import express from "express";
import { cancelBooking, createBooking, getAllBookings, getUserBookingHistory, validateBooking } from "../controller/bookingController.js";
import authToken from "../middleware/authToken.js";

const bookingRouter = express.Router();

bookingRouter.post("/book",authToken, validateBooking, createBooking);
bookingRouter.get('/all-bookings',authToken,getAllBookings)
bookingRouter.put('/cancel-booking/:bookingId',authToken,cancelBooking)
bookingRouter.get('/get-booking',authToken,getUserBookingHistory)


export default bookingRouter;
