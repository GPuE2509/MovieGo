// models/screen.model.js
const mongoose = require("mongoose");

const screenSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, maxlength: 100 },
    theater_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theater",
      required: true,
    },
    capacity: { type: Number, min: 1, required: true },
    screen_type: {
      type: String,
      enum: ["STANDARD", "IMAX", "4DX", "VIP"],
      default: "STANDARD",
    },
    is_active: { type: Boolean, default: true },
  },
  { 
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "screens"
  }
);

// Index for better query performance
screenSchema.index({ theater_id: 1 });
screenSchema.index({ is_active: 1 });

module.exports = mongoose.model("Screen", screenSchema, "screens");
