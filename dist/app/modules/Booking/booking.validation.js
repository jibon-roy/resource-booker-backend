"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingValidation = void 0;
const zod_1 = require("zod");
const createBookingValidation = zod_1.z.object({
    body: zod_1.z.object({
        resource: zod_1.z.string({ required_error: 'Resource is required' }),
        requestedBy: zod_1.z.string({ required_error: 'Requested By is required' }),
        startTime: zod_1.z.string().refine(val => !isNaN(Date.parse(val)), {
            message: 'Invalid start time',
        }),
        endTime: zod_1.z.string().refine(val => !isNaN(Date.parse(val)), {
            message: 'Invalid end time',
        }),
    }),
});
const updateBookingValidation = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string({ required_error: 'Booking ID is required' }),
    }),
    body: zod_1.z.object({
        resource: zod_1.z.string().optional(),
        requestedBy: zod_1.z.string().optional(),
        startTime: zod_1.z
            .string()
            .refine(val => !isNaN(Date.parse(val)), {
            message: 'Invalid start time',
        })
            .optional(),
        endTime: zod_1.z
            .string()
            .refine(val => !isNaN(Date.parse(val)), {
            message: 'Invalid end time',
        })
            .optional(),
        status: zod_1.z.enum(['UPCOMING', 'ONGOING', 'PAST']).optional(),
    }),
});
exports.bookingValidation = {
    createBookingValidation,
    updateBookingValidation,
};
