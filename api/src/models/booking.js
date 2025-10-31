// models/booking.model.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    showtime_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShowTime",
      required: true,
    },
    total_seat: { type: Number, min: 0, required: true },
    status: {
      type: String,
      enum: ["PENDING", "CANCELLED", "COMPLETED"],
      default: "PENDING",
      required: true,
    },
    total_price_movie: { type: Number, min: 0, required: true },
    booking_seats: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BookingSeat",
      },
    ],
    payment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
    notes: { type: String, maxlength: 500 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Index for better query performance
bookingSchema.index({ user_id: 1, status: 1 });
bookingSchema.index({ showtime_id: 1 });
bookingSchema.index({ created_at: -1 });

module.exports = mongoose.model("Booking", bookingSchema);
