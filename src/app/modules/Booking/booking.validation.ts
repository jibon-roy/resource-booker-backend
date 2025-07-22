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

export const bookingValidation = {
  createBookingValidation,
};
