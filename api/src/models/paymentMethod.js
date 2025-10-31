// models/paymentMethod.model.js
const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, maxlength: 100 },
    description: { type: String, maxlength: 255 },
    is_active: { type: Boolean, default: true },
  },
  { 
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "paymentmethods" // Explicitly specify collection name
  }
);

module.exports = mongoose.model("PaymentMethod", paymentMethodSchema);
