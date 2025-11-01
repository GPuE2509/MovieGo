const Booking = require("../models/booking");
const BookingSeat = require("../models/bookingSeat");
const User = require("../models/user");

function mapStatus(paymentStatus) {
  if (paymentStatus === "PENDING") return "PENDING";
  if (paymentStatus === "COMPLETED") return "COMPLETED";
  if (paymentStatus === "CANCELLED" || paymentStatus === "FAILED") return "CANCELLED";
  throw new Error("Invalid payment status");
}

function calculatePointsForBooking(bookingSeats) {
  return bookingSeats.reduce((sum, bs) => {
    const seatType = bs.seat_id?.type;
    const quantity = bs.quantity || 1;
    if (seatType === "STANDARD") return sum + quantity * 10;
    if (seatType === "VIP") return sum + quantity * 15;
    if (seatType === "SWEETBOX") return sum + quantity * 20;
    return sum;
  }, 0);
}

async function syncBookingStatusWithPayment(bookingId) {
  const booking = await Booking.findById(bookingId)
    .populate("payment_id")
    .populate({ path: "booking_seats", populate: { path: "seat_id" } })
    .populate("user_id");
  if (!booking) throw new Error("Booking not found");
  if (!booking.payment_id) throw new Error("No payment found for booking");
  const newStatus = mapStatus(booking.payment_id.payment_status);
  booking.status = newStatus;
  if (newStatus === "COMPLETED" && booking.user_id) {
    const points = calculatePointsForBooking(booking.booking_seats || []);
    const user = await User.findById(booking.user_id);
    if (user) {
      user.point = (user.point || 0) + points;
      await user.save();
    }
  }
  await booking.save();
}

module.exports = { syncBookingStatusWithPayment };
