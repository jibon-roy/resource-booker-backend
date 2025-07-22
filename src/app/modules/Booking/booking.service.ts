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
      `${data.resource} is already booked from ${conflict.startTime.toLocaleString()} to ${conflict.endTime.toLocaleString()}`,
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
  searchTerm?: string;
  resource?: string;
  date?: string;
  status?: 'upcoming' | 'ongoing' | 'past';
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
  const andConditions: any[] = [];

  if (filters?.resource) {
    andConditions.push({
      resource: filters.resource,
    });
  }

  //  Date filter
  if (filters?.date) {
    const date = new Date(filters.date);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    andConditions.push({
      startTime: {
        gte: date,
        lt: nextDay,
      },
    });
  }

  // Search term filter
  if (filters?.searchTerm) {
    andConditions.push({
      OR: [
        {
          requestedBy: {
            contains: filters.searchTerm,
            mode: 'insensitive',
          },
        },
        {
          resource: {
            contains: filters.searchTerm,
            mode: 'insensitive',
          },
        },
      ],
    });
  }

  //  Status filter
  if (filters?.status) {
    const now = new Date();

    if (filters.status === 'upcoming') {
      andConditions.push({
        startTime: { gt: now },
      });
    }

    if (filters.status === 'ongoing') {
      andConditions.push({
        startTime: { lte: now },
        endTime: { gte: now },
      });
    }

    if (filters.status === 'past') {
      andConditions.push({
        endTime: { lt: now },
      });
    }
  }

  const whereClause = andConditions.length > 0 ? { AND: andConditions } : {};

  const page = filters?.page && filters.page > 0 ? filters.page : 1;
  const limit = filters?.limit && filters.limit > 0 ? filters.limit : 10;
  const skip = (page - 1) * limit;

  // Total count
  const total = await prisma.booking.count({
    where: whereClause,
  });

  // Fetch bookings
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

// update booking
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
