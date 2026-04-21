const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.ObjectId,
    ref: "Service",
    required: [true, "Booking must have a service"],
  },
  seeker: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Booking must have a seeker"],
  },
  helper: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Booking must have a helper"],
  },
  status: {
    type: String,
    enum: [
      "pending",
      "accepted",
      "confirmed",
      "completed",
      "cancelled",
      "rejected",
    ],
    default: "pending",
  },
  scheduledDate: {
    type: Date,
    required: [true, "Please provide a scheduled date"],
  },
  location: {
    type: String,
    required: [true, "Please provide a location"],
  },
  notes: {
    type: String,
    trim: true,
  },
  totalPrice: {
    type: Number,
    required: [true, "Please provide total price"],
  },
  payment: {
    method: {
      type: String,
      enum: ["khalti"],
      default: "khalti",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    transactionId: {
      type: String,
      trim: true,
    },
    khaltiPidx: {
      type: String,
      trim: true,
    },
    khaltiDetails: {
      idx: String, // Khalti system identifier
      pidx: String, // Transaction ID from Khalti
      token: String, // Payment token from Khalti
      mobileNumber: String,
      amount: Number,
      timestamp: Date,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

bookingSchema.index(
  { "payment.khaltiPidx": 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { "payment.khaltiPidx": { $type: "string" } },
  },
);

module.exports = mongoose.model("Booking", bookingSchema);
