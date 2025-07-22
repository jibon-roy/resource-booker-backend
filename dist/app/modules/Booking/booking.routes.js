"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRouters = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const booking_controller_1 = require("./booking.controller");
const booking_validation_1 = require("./booking.validation");
const router = express_1.default.Router();
// Create Booking
router.post('/', (0, validateRequest_1.default)(booking_validation_1.bookingValidation.createBookingValidation), booking_controller_1.BookingControllers.createBookingController);
// Get All Bookings 
router.get('/', booking_controller_1.BookingControllers.getBookingsController);
// Get Booking by ID
router.get('/:id', booking_controller_1.BookingControllers.getBookingByIdController);
// Update Booking
router.put('/:id', (0, validateRequest_1.default)(booking_validation_1.bookingValidation.updateBookingValidation), booking_controller_1.BookingControllers.updateBookingController);
//  Delete 
router.delete('/:id', booking_controller_1.BookingControllers.deleteBookingController);
exports.BookingRouters = router;
