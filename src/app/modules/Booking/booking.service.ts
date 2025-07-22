import { PrismaClient, Booking } from '@prisma/client';
import AppError from '../../errors/AppError';

const prisma = new PrismaClient();

// Buffer time 
const BUFFER_MINUTES = 10;


export const createBooking = async (data: {
  resource: string;
  requestedBy: string;
  startTime: Date;
  endTime: Date;
}): Promise<Booking> => {

  const start = new Date(data.startTime);
  const end = new Date(data.endTime);

  // Conflict detect
  const conflict = await prisma.booking.findFirst({
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
    throw new AppError(
      409,
      `Conflict detected: ${data.resource} is already booked from ${conflict.startTime.toLocaleString()} to ${conflict.endTime.toLocaleString()}`
    );
  }

 // Save booking if no conflict
  const booking = await prisma.booking.create({
    data: {
      resource: data.resource,
      requestedBy: data.requestedBy,
      startTime: start,
      endTime: end,
    },
  });

  return booking;
};


export const getBookings = async (filters?: {
  resource?: string;
  date?: string;
  page?: number;
  limit?: number;
}): Promise<{
  meta: {
    total: number;
    page: number;
    limit: number;
  };
  data: Booking[];
}> => {
  const whereClause: any = {};

  //  Filter by resourc
  if (filters?.resource) {
    whereClause.resource = filters.resource;
  }

  // Filter by date
  if (filters?.date) {
    const date = new Date(filters.date);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    whereClause.startTime = {
      gte: date,
      lt: nextDay,
    };
  }

  const page = filters?.page && filters.page > 0 ? filters.page : 1;
  const limit = filters?.limit && filters.limit > 0 ? filters.limit : 10;
  const skip = (page - 1) * limit;

  // all user
  const total = await prisma.booking.count({
    where: whereClause,
  });

  // fetch data
  const bookings = await prisma.booking.findMany({
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
};

export const getBookingById = async (id: string): Promise<Booking | null> => {
  const booking = await prisma.booking.findUnique({
    where: { id },
  });
  if (!booking) {
    throw new AppError(404, 'Booking not found');
  }

  return booking;
};

export const updateBooking = async (data: {
  id: string;
  resource?: string;
  requestedBy?: string;
  startTime?: Date;
  endTime?: Date;
}): Promise<Booking> => {
  const booking = await prisma.booking.findUnique({
    where: { id: data.id },
  });

  if (!booking) {
    throw new AppError(404, 'Booking not found');
  }

  // Update booking
  return prisma.booking.update({
    where: { id: data.id },
    data: {
      resource: data.resource ?? booking.resource,
      requestedBy: data.requestedBy ?? booking.requestedBy,
      startTime: data.startTime ?? booking.startTime,
      endTime: data.endTime ?? booking.endTime,
    },
  });
};


export const deleteBooking = async (id: string): Promise<Booking> => {
  const booking = await prisma.booking.findUnique({ where: { id } });

  if (!booking) {
    throw new AppError(404, 'Booking not found');
  }

  return prisma.booking.delete({ where: { id } });
};

