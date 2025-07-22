import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { BookingControllers } from './booking.controller';
import { bookingValidation } from './booking.validation';

const router = express.Router();

// Create Booking
router.post(
  '/',
  validateRequest(bookingValidation.createBookingValidation),
  BookingControllers.createBookingController,
);

// Get All Bookings 
router.get('/', BookingControllers.getBookingsController);

// Get Booking by ID
router.get('/:id', BookingControllers.getBookingByIdController);

// Update Booking
router.put(
  '/:id',
  validateRequest(bookingValidation.updateBookingValidation),
  BookingControllers.updateBookingController,
);

//  Delete 
router.delete('/:id', BookingControllers.deleteBookingController);

export const BookingRouters = router;
