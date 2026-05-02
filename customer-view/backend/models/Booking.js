const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      name: { type: String, required: true },
      category: { type: String },
      duration: { type: Number },
      price: { type: Number, required: true },
    },
    provider: {
      name: { type: String, required: true },
      specialty: { type: String },
    },
    date: {
      type: String,
      required: [true, 'Appointment date is required'],
    },
    time: {
      type: String,
      required: [true, 'Appointment time is required'],
    },
    intake: {
      fullName:   { type: String },
      dob:        { type: String },
      phone:      { type: String },
      gender:     { type: String },
      address:    { type: String },
      reason:     { type: String },
      allergies:  { type: String },
      notes:      { type: String },
    },
    payment: {
      method:        { type: String, enum: ['card', 'upi', 'netbanking'], default: 'card' },
      subtotal:      { type: Number },
      tax:           { type: Number },
      total:         { type: Number },
      status:        { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
      transactionId: { type: String },
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed', 'no-show'],
      default: 'confirmed',
    },
    bookingId: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Auto-generate bookingId before saving
bookingSchema.pre('save', function (next) {
  if (!this.bookingId) {
    this.bookingId = 'APT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
