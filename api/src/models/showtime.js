// models/showtime.model.js
const mongoose = require("mongoose");

const showtimeSchema = new mongoose.Schema(
  {
    movie_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    screen_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Screen",
      required: true,
    },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Validate end time is after start time
showtimeSchema.pre("save", function (next) {
  if (this.end_time && this.start_time && this.end_time <= this.start_time) {
    next(new Error("End time must be after start time"));
  } else {
    next();
  }
});

// Index for better query performance
showtimeSchema.index({ movie_id: 1 });
showtimeSchema.index({ screen_id: 1 });
showtimeSchema.index({ start_time: 1 });
showtimeSchema.index({ is_active: 1 });

module.exports = mongoose.model("ShowTime", showtimeSchema);
