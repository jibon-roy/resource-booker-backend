import { z } from 'zod';

const createBookingValidation = z.object({
  body: z.object({
    resource: z.string({ required_error: 'Resource is required' }),
    requestedBy: z.string({ required_error: 'Requested By is required' }),
    startTime: z.string().refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid start time',
    }),
    endTime: z.string().refine(val => !isNaN(Date.parse(val)), {
      message: 'Invalid end time',
    }),
  }),
});

const updateBookingValidation = z.object({
  params: z.object({
    id: z.string({ required_error: 'Booking ID is required' }),
  }),
  body: z.object({
    resource: z.string().optional(),
    requestedBy: z.string().optional(),
    startTime: z
      .string()
      .refine(val => !isNaN(Date.parse(val)), {
        message: 'Invalid start time',
      })
      .optional(),
    endTime: z
      .string()
      .refine(val => !isNaN(Date.parse(val)), {
        message: 'Invalid end time',
      })
      .optional(),
    status: z.enum(['UPCOMING', 'ONGOING', 'PAST']).optional(),
  }),
});

export const bookingValidation = {
  createBookingValidation,
  updateBookingValidation,
};
