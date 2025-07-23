import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import {
  createBooking,
  getBookings,
  deleteBooking,
  updateBooking,
  getBookingById,
} from './booking.service';

const createBookingController = catchAsync(async (req, res) => {
  const result = await createBooking(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Booking created successfully',
    data: result,
  });
});

const getBookingsController = catchAsync(async (req, res) => {
  const {
    searchTerm,
    resource,
    date,
    status,
    page = '1',
    limit = '10',
  } = req.query;

  const result = await getBookings({
    searchTerm: searchTerm as string,
    resource: resource as string,
    date: date as string,
    status: status as 'upcoming' | 'ongoing' | 'past',
    page: Number(page),
    limit: Number(limit),
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Bookings retrieved successfully',
    data: result.data,
    meta: {
      total: result.meta.total,
      page: result.meta.page,
      limit: result.meta.limit,
      totalPage: Math.ceil(result.meta.total / result.meta.limit),
    },
  });
});

const getBookingByIdController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await getBookingById(id);

  if (!result) {
    return res.status(httpStatus.NOT_FOUND).json({
      success: false,
      message: 'Booking not found',
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking retrieved successfully',
    data: result,
  });
});

const updateBookingController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await updateBooking({ ...req.body, id });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking updated successfully',
    data: result,
  });
});

const deleteBookingController = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await deleteBooking(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Booking deleted successfully',
    data: result,
  });
});

export const BookingControllers = {
  createBookingController,
  getBookingsController,
  getBookingByIdController,
  updateBookingController,
  deleteBookingController,
};
