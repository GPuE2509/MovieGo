// models/screen.model.js
const mongoose = require("mongoose");

const screenSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },
    theaterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Theater",
      required: true,
    },
    seatCapacity: {
      type: Number,
      required: true,
      min: 50,
    },
    maxRows: {
      type: Number,
      required: true,
      min: 5,
    },
    maxColumns: {
      type: Number,
      required: true,
      min: 5,
    },
    seatLayout: {
      type: String, // Storing as a JSON string
      required: false,
      default: "[]",
    },
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    versionKey: false,
  }
);

module.exports = mongoose.model("Screen", screenSchema);
