const prisma = require('../config/db');

const createService = async (req, res, next) => {
  try {
    const { name, price, duration, description } = req.body;
    
    const organizer = await prisma.organizer.findUnique({
      where: { userId: req.user.id }
    });

    if (!organizer || organizer.approvalStatus !== 'APPROVED') {
      return res.status(403).json({ error: 'Organizer profile not approved' });
    }

    const service = await prisma.service.create({
      data: {
        organizerId: organizer.id,
        name,
        price,
        duration,
        description
      }
    });

    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
};

const getBookings = async (req, res, next) => {
  try {
    const organizer = await prisma.organizer.findUnique({
      where: { userId: req.user.id }
    });

    if (!organizer) {
      return res.status(404).json({ error: 'Organizer profile not found' });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        service: {
          organizerId: organizer.id
        }
      },
      include: {
        user: { select: { name: true, email: true } },
        service: { select: { name: true } },
        payment: true
      }
    });

    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

const updateAvailability = async (req, res, next) => {
  try {
    const { date, timeSlots } = req.body; // date in "YYYY-MM-DD"
    
    const organizer = await prisma.organizer.findUnique({
      where: { userId: req.user.id }
    });

    if (!organizer) {
      return res.status(404).json({ error: 'Organizer profile not found' });
    }

    const availabilityDate = new Date(date);

    const availability = await prisma.availability.upsert({
      where: {
        organizerId_date: {
          organizerId: organizer.id,
          date: availabilityDate
        }
      },
      update: {
        timeSlots
      },
      create: {
        organizerId: organizer.id,
        date: availabilityDate,
        timeSlots
      }
    });

    res.status(200).json(availability);
  } catch (error) {
    next(error);
  }
};

module.exports = { createService, getBookings, updateAvailability };
