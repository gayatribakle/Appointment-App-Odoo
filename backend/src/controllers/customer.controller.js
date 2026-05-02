const prisma = require('../config/db');
const paymentService = require('../services/payment.service');

const browseServices = async (req, res, next) => {
  try {
    const { search } = req.query;
    
    let whereClause = {};
    if (search) {
      whereClause = {
        name: { contains: search, mode: 'insensitive' }
      };
    }

    const services = await prisma.service.findMany({
      where: whereClause,
      include: {
        organizer: {
          select: { businessName: true }
        }
      }
    });

    res.status(200).json(services);
  } catch (error) {
    next(error);
  }
};

const bookAppointment = async (req, res, next) => {
  try {
    const { serviceId, date, timeSlot, paymentMethod } = req.body; // date in "YYYY-MM-DD"

    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const bookingDate = new Date(date);

    // Check if slot is available and not already booked
    const existingBooking = await prisma.booking.findFirst({
      where: {
        serviceId,
        date: bookingDate,
        timeSlot,
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    });

    if (existingBooking) {
      return res.status(400).json({ error: 'Time slot already booked' });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        userId: req.user.id,
        serviceId,
        date: bookingDate,
        timeSlot
      }
    });

    // Process mock payment
    const paymentResult = await paymentService.simulatePayment(service.price, paymentMethod);

    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: paymentResult.amount,
        status: paymentResult.status,
        paymentMethod: paymentResult.method
      }
    });

    // Update booking status if payment success
    if (paymentResult.status === 'SUCCESS') {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'CONFIRMED' }
      });
    }

    res.status(201).json({
      message: 'Booking request processed',
      booking,
      payment
    });
  } catch (error) {
    next(error);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        service: true,
        payment: true
      }
    });

    res.status(200).json(bookings);
  } catch (error) {
    next(error);
  }
};

module.exports = { browseServices, bookAppointment, getMyBookings };
