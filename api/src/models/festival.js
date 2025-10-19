// models/festival.model.js
const mongoose = require("mongoose");

const festivalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title cannot be blank"],
      trim: true,
      maxlength: 255,
    },
    image: {
      type: String,
      required: [true, "Image is required"],
      default: "default.jpg",
    },
    location: {
      type: String,
      trim: true,
      maxlength: 255,
    },
    description: {
      type: String,
      trim: true,
    },
    start_time: {
      type: Date,
      required: [true, "Start time is required"],
      validate: {
        validator: function (value) {
          return value >= new Date();
        },
        message: "The start time must be from now on.",
      },
    },
    end_time: {
      type: Date,
      required: [true, "End time is required"],
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Custom validation to ensure end_time is not before start_time
festivalSchema.pre("save", function (next) {
  if (this.end_time && this.start_time && this.end_time < this.start_time) {
    const error = new Error(
      "The end time must not be less than the start time."
    );
    return next(error);
  }
  next();
});

festivalSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (
    update.end_time &&
    update.start_time &&
    update.end_time < update.start_time
  ) {
    const error = new Error(
      "The end time must not be less than the start time."
    );
    return next(error);
  }
  next();
});

module.exports = mongoose.model("Festival", festivalSchema);
