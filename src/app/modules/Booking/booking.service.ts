import { PrismaClient, Booking } from '@prisma/client';

const prisma = new PrismaClient();

// Buffer time in minutes
const BUFFER_MINUTES = 10;


export const createBooking = async (data: {
  resource: string;
  requestedBy: string;
  startTime: Date;
  endTime: Date;
}): Promise<Booking> => {

  const start = new Date(data.startTime);
  const end = new Date(data.endTime);

  // Conflict detection with buffer logic
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
    throw new Error(
      `Conflict detected: ${data.resource} is already booked from ${conflict.startTime.toLocaleString()} to ${conflict.endTime.toLocaleString()}`,
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
}): Promise<Booking[]> => {
  const whereClause: any = {};

  if (filters?.resource) {
    whereClause.resource = filters.resource;
  }

  if (filters?.date) {
    const date = new Date(filters.date);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    whereClause.startTime = {
      gte: date,
      lt: nextDay,
    };
  }

  return prisma.booking.findMany({
    where: whereClause,
    orderBy: {
      startTime: 'asc',
    },
  });
};

export const deleteBooking = async (id: string): Promise<Booking> => {
  const booking = await prisma.booking.findUnique({ where: { id } });

  if (!booking) {
    throw new Error('Booking not found');
  }

  return prisma.booking.delete({ where: { id } });
};

