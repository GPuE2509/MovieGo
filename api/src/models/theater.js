// models/theater.model.js
const mongoose = require("mongoose");

const theaterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 255 },
    address: { type: String, required: true, maxlength: 500 },
    city: { type: String, required: true, maxlength: 100 },
    phone: { type: String, maxlength: 20 },
    email: { type: String, maxlength: 255 },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Index for better query performance
theaterSchema.index({ city: 1 });
theaterSchema.index({ is_active: 1 });

module.exports = mongoose.model("Theater", theaterSchema);