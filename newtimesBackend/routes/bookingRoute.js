import express from "express";
import { 
  cancelBooking, 
  createBooking,
  getAllBookings, 
  getUserBookingHistory, 
  validateBooking, 
  getMyBookings,
  getBookingById,
  initiateExtendBooking,
  confirmExtendBooking,
  deleteBooking, } from "../controller/bookingController.js";
import authToken from "../middleware/authToken.js";

const bookingRouter = express.Router();

bookingRouter.post("/book",authToken, validateBooking, createBooking);
bookingRouter.get('/all-bookings',authToken,getAllBookings)
bookingRouter.put('/cancel-booking/:bookingId',authToken,cancelBooking)
bookingRouter.get('/get-booking',authToken,getUserBookingHistory)
// GET /api/bookings/my-bookings
bookingRouter.get('/my-bookings',authToken, getMyBookings);

// GET /api/bookings/:id
bookingRouter.get('/:id', authToken, getBookingById);

// POST /api/bookings/:id/extend (initiate extension)
bookingRouter.post('/:id/extend', authToken, initiateExtendBooking);

// POST /api/bookings/:id/extend/confirm (confirm after payment)
bookingRouter.post('/:id/extend/confirm', authToken, confirmExtendBooking);

// DELETE /api/bookings/:id
bookingRouter.delete('/:id', authToken, deleteBooking);



export default bookingRouter;
