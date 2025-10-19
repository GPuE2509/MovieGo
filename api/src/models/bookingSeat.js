// models/bookingSeat.model.js
const mongoose = require("mongoose");

const bookingSeatSchema = new mongoose.Schema(
  {
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    seat_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seat",
      required: true,
    },
    quantity: { type: Number, min: 1, default: 1 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Index for better query performance
bookingSeatSchema.index({ booking_id: 1 });
bookingSeatSchema.index({ seat_id: 1 });

module.exports = mongoose.model("BookingSeat", bookingSeatSchema);
