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
exports.deleteBooking = exports.updateBooking = exports.getBookingById = exports.getBookings = exports.createBooking = void 0;
const client_1 = require("@prisma/client");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const prisma = new client_1.PrismaClient();
// Buffer time
const BUFFER_MINUTES = 10;
const createBooking = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    // Conflict detect
    const conflict = yield prisma.booking.findFirst({
        where: {
            resource: data.resource,
            OR: [
                {
                    startTime: {
                        lte: new Date(end.getTime() + BUFFER_MINUTES * 60000),
                    },
                    endTime: {
                        gte: new Date(start.getTime() - BUFFER_MINUTES * 60000),
                    },
                },
            ],
        },
    });
    if (conflict) {
        throw new AppError_1.default(409, `${data.resource} is already booked from ${conflict.startTime.toLocaleString()} to ${conflict.endTime.toLocaleString()}`);
    }
    // Save booking if no conflict
    const booking = yield prisma.booking.create({
        data: {
            resource: data.resource,
            requestedBy: data.requestedBy,
            startTime: start,
            endTime: end,
        },
    });
    return booking;
});
exports.createBooking = createBooking;
const getBookings = (filters) => __awaiter(void 0, void 0, void 0, function* () {
    const whereClause = {};
    //  Filter by resourc
    if (filters === null || filters === void 0 ? void 0 : filters.resource) {
        whereClause.resource = filters.resource;
    }
    // Filter by date
    if (filters === null || filters === void 0 ? void 0 : filters.date) {
        const date = new Date(filters.date);
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        whereClause.startTime = {
            gte: date,
            lt: nextDay,
        };
    }
    const page = (filters === null || filters === void 0 ? void 0 : filters.page) && filters.page > 0 ? filters.page : 1;
    const limit = (filters === null || filters === void 0 ? void 0 : filters.limit) && filters.limit > 0 ? filters.limit : 10;
    const skip = (page - 1) * limit;
    // all user
    const total = yield prisma.booking.count({
        where: whereClause,
    });
    // fetch data
    const bookings = yield prisma.booking.findMany({
        where: whereClause,
        orderBy: {
            startTime: 'asc',
        },
        skip,
        take: limit,
    });
    return {
        meta: {
            total,
            page,
            limit,
        },
        data: bookings,
    };
});
exports.getBookings = getBookings;
const getBookingById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield prisma.booking.findUnique({
        where: { id },
    });
    if (!booking) {
        throw new AppError_1.default(404, 'Booking not found');
    }
    return booking;
});
exports.getBookingById = getBookingById;
const updateBooking = (data) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const booking = yield prisma.booking.findUnique({
        where: { id: data.id },
    });
    if (!booking) {
        throw new AppError_1.default(404, 'Booking not found');
    }
    // Update booking
    return prisma.booking.update({
        where: { id: data.id },
        data: {
            resource: (_a = data.resource) !== null && _a !== void 0 ? _a : booking.resource,
            requestedBy: (_b = data.requestedBy) !== null && _b !== void 0 ? _b : booking.requestedBy,
            startTime: (_c = data.startTime) !== null && _c !== void 0 ? _c : booking.startTime,
            endTime: (_d = data.endTime) !== null && _d !== void 0 ? _d : booking.endTime,
        },
    });
});
exports.updateBooking = updateBooking;
const deleteBooking = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const booking = yield prisma.booking.findUnique({ where: { id } });
    if (!booking) {
        throw new AppError_1.default(404, 'Booking not found');
    }
    return prisma.booking.delete({ where: { id } });
});
exports.deleteBooking = deleteBooking;
