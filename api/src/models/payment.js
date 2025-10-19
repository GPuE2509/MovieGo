// models/payment.model.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    booking_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    payment_method_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PaymentMethod",
      required: true,
    },
    transaction_id: { type: String, required: true, unique: true },
    amount: { type: Number, min: 0, required: true },
    payment_status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "CANCELLED"],
      default: "PENDING",
      required: true,
    },
    payment_time: { type: Date },
    gateway_response: { type: String }, // Store payment gateway response
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Index for better query performance
paymentSchema.index({ booking_id: 1 });
paymentSchema.index({ transaction_id: 1 });
paymentSchema.index({ payment_status: 1 });

module.exports = mongoose.model("Payment", paymentSchema);
