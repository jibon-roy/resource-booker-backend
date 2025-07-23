"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const booking_service_1 = require("./booking.service");
const createBookingController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, booking_service_1.createBooking)(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Booking created successfully',
        data: result,
    });
}));
const getBookingsController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerm, resource, date, status, page = '1', limit = '10', } = req.query;
    const result = yield (0, booking_service_1.getBookings)({
        searchTerm: searchTerm,
        resource: resource,
        date: date,
        status: status,
        page: Number(page),
        limit: Number(limit),
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
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
}));
const getBookingByIdController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield (0, booking_service_1.getBookingById)(id);
    if (!result) {
        return res.status(http_status_1.default.NOT_FOUND).json({
            success: false,
            message: 'Booking not found',
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Booking retrieved successfully',
        data: result,
    });
}));
const updateBookingController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield (0, booking_service_1.updateBooking)(Object.assign(Object.assign({}, req.body), { id }));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Booking updated successfully',
        data: result,
    });
}));
const deleteBookingController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield (0, booking_service_1.deleteBooking)(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Booking deleted successfully',
        data: result,
    });
}));
exports.BookingControllers = {
    createBookingController,
    getBookingsController,
    getBookingByIdController,
    updateBookingController,
    deleteBookingController,
};
