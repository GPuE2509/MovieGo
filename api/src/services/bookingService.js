// services/bookingService.js
const Booking = require("../models/booking");
const BookingSeat = require("../models/bookingSeat");
const User = require("../models/user");
const ShowTime = require("../models/showtime");
const Seat = require("../models/seat");
const Payment = require("../models/payment");
const Movie = require("../models/movie");
const Screen = require("../models/screen");
const TicketPrice = require("../models/ticketPrice");
const Coupon = require("../models/coupon");

class BookingService {
  // Get all bookings with pagination and search (Admin)
  async getAllBookings(search, page, size, sortBy, direction) {
    try {
      const query = {};

      // Add search filter
      if (search && search.trim()) {
        query.$or = [
          { notes: { $regex: search, $options: "i" } },
        ];
      }

      const sortOptions = {};
      sortOptions[sortBy] = direction === "desc" ? -1 : 1;

      const bookings = await Booking.find(query)
        .populate("user_id", "first_name last_name email")
        .populate("showtime_id")
        .populate("booking_seats")
        .populate("payment_id")
        .sort(sortOptions)
        .skip(page * size)
        .limit(size);

      const total = await Booking.countDocuments(query);

      const responseData = await Promise.all(
        bookings.map(async (booking) => {
          // Get movie and screen details
          const showtime = await ShowTime.findById(booking.showtime_id)
            .populate("movie_id", "title")
            .populate("screen_id", "name");

          // Get seat details
          const seatDetails = await Promise.all(
            booking.booking_seats.map(async (bookingSeat) => {
              const seatInfo = await BookingSeat.findById(bookingSeat).populate(
                "seat_id",
                "seat_number row column type"
              );
              return seatInfo;
            })
          );

          return {
            id: booking._id,
            user_id: booking.user_id._id,
            user_email: booking.user_id.email,
            showtime_id: booking.showtime_id._id,
            movie_title: showtime?.movie_id?.title || "Unknown Movie",
            screen_name: showtime?.screen_id?.name || "Unknown Screen",
            start_time: showtime?.start_time,
            total_seat: booking.total_seat,
            total_price_movie: booking.total_price_movie,
            booking_status: booking.status,
            payment_status: booking.payment_id?.payment_status || "PENDING",
            created_at: booking.created_at,
            updated_at: booking.updated_at,
            booked_seats: seatDetails.map((seat) => ({
              id: seat?.seat_id?._id,
              seat_number: seat?.seat_id?.seat_number,
              row: seat?.seat_id?.row,
              column: seat?.seat_id?.column,
              type: seat?.seat_id?.type,
            })),
          };
        })
      );

      return {
        content: responseData,
        totalElements: total,
        totalPages: Math.ceil(total / size),
        size: size,
        number: page,
        hasNext: page + 1 < Math.ceil(total / size),
        hasPrevious: page > 0,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve bookings: ${error.message}`);
    }
  }

  // Create a new booking for user
  async createBooking(userId, request, httpRequest) {
    const { showtime_id, seatIds = [], notes } = request;
    const showtime = await ShowTime.findById(showtime_id).lean();
    if (!showtime) throw new Error("Showtime not found");
    if (!Array.isArray(seatIds) || seatIds.length === 0) throw new Error("No seats selected");

    const seats = await Seat.find({ _id: { $in: seatIds }, screen_id: showtime.screen_id }).lean();
    if (seats.length !== seatIds.length) throw new Error("Some seats are invalid for this showtime");

    // Check availability
    const existingBookings = await Booking.find({ showtime_id, status: { $in: ["PENDING", "COMPLETED"] } }).select("_id").lean();
    const existingIds = existingBookings.map(b => b._id);
    if (existingIds.length) {
      const taken = await BookingSeat.find({ booking_id: { $in: existingIds }, seat_id: { $in: seatIds } }).lean();
      if (taken.length) throw new Error("Some seats are already booked");
    }

    const total_price_movie = (showtime.price || 0) * seats.length;
    const booking = await Booking.create({
      user_id: userId,
      showtime_id,
      total_seat: seats.length,
      status: "PENDING",
      total_price_movie,
      notes: notes || null,
    });
    const bs = await BookingSeat.insertMany(seatIds.map(seat_id => ({ booking_id: booking._id, seat_id, quantity: 1 })));
    booking.booking_seats = bs.map(x => x._id);
    await booking.save();
    return { id: booking._id, status: booking.status, total_price_movie };
  }

  // Apply a coupon to a booking (matching Java logic)
  async applyCouponToBooking(userId, bookingId, couponCode) {
    // 1. Validate booking ownership
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error("Booking not found");
    if (String(booking.user_id) !== String(userId)) throw new Error("Unauthorized");

    // 2. Get user and validate coupon ownership (from user.coupons array)
    const user = await User.findById(userId).populate('coupons');
    if (!user) throw new Error("User not found");

    const coupon = user.coupons.find(c => String(c.coupon_code) === String(couponCode));
    if (!coupon) throw new Error("Coupon not found or not owned by user");

    // 3. Calculate discount (same logic as Java)
    const originalPrice = booking.total_price_movie;
    const discountedPrice = this.calculateDiscountedPrice(originalPrice, coupon);
    const discountAmount = originalPrice - discountedPrice;

    // 4. Update booking with discounted price
    booking.total_price_movie = discountedPrice;
    booking.updated_at = new Date();
    await booking.save();

    // 5. Remove coupon from user (one-time use)
    user.coupons = user.coupons.filter(c => String(c._id) !== String(coupon._id));
    await user.save();

    // 6. Return response matching Java format
    return {
      finalAmount: discountedPrice,
      discountAmount: discountAmount
    };
  }

  // Calculate discounted price (same logic as Java)
  calculateDiscountedPrice(originalPrice, coupon) {
    if (coupon.coupon_name && coupon.coupon_name.includes('%')) {
      // Percentage discount
      const discountPercent = coupon.coupon_value / 100.0;
      return originalPrice * (1 - discountPercent);
    } else {
      // Fixed amount discount
      const discountedPrice = originalPrice - coupon.coupon_value;
      return Math.max(0, discountedPrice); // Ensure price doesn't go negative
    }
  }

  // History awards placeholder (no model): return empty list for now
  async getAllHistoryAwards(userId) {
    return [];
  }

  // User booking by id
  async getBookingByIdUser(bookingId, userId) {
    const booking = await Booking.findById(bookingId).lean();
    if (!booking) throw new Error("Booking not found");
    if (String(booking.user_id) !== String(userId)) throw new Error("Unauthorized");
    return booking;
  }

  // User bookings list
  async getBookingsByUserId(userId) {
    const bookings = await Booking.find({ user_id: userId }).sort({ created_at: -1 }).lean();
    return bookings;
  }

  // Reserve seats without payment (PENDING)
  async reserveSeats(showtimeId, seatIds, httpRequest) {
    const showtime = await ShowTime.findById(showtimeId).lean();
    if (!showtime) throw new Error("Showtime not found");
    if (!Array.isArray(seatIds) || seatIds.length === 0) throw new Error("No seats selected");

    const seats = await Seat.find({ _id: { $in: seatIds }, screen_id: showtime.screen_id }).lean();
    if (seats.length !== seatIds.length) throw new Error("Some seats are invalid for this showtime");

    const existingBookings = await Booking.find({ showtime_id: showtimeId, status: { $in: ["PENDING", "COMPLETED"] } }).select("_id").lean();
    const existingIds = existingBookings.map(b => b._id);
    if (existingIds.length) {
      const taken = await BookingSeat.find({ booking_id: { $in: existingIds }, seat_id: { $in: seatIds } }).lean();
      if (taken.length) throw new Error("Some seats are already booked");
    }

    const total_price_movie = (showtime.price || 0) * seats.length;
    const booking = await Booking.create({
      user_id: (httpRequest && httpRequest.user && httpRequest.user.id) ? httpRequest.user.id : null,
      showtime_id: showtimeId,
      total_seat: seats.length,
      status: "PENDING",
      total_price_movie,
      notes: "RESERVATION",
    });
    const bs = await BookingSeat.insertMany(seatIds.map(seat_id => ({ booking_id: booking._id, seat_id, quantity: 1 })));
    booking.booking_seats = bs.map(x => x._id);
    await booking.save();
    return { id: booking._id, status: booking.status, total_price_movie };
  }

  // Create payment for existing booking
  async createPayment(bookingId, userId, paymentMethodId, httpRequest) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new Error("Booking not found");

    // Claim ownership if reservation was created without a user (legacy)
    if (!booking.user_id && userId) {
      booking.user_id = userId;
    }

    console.log(booking.user_id, userId);

    if (String(booking.user_id) !== String(userId)) throw new Error("Unauthorized");

    // Only allow payment when booking is PENDING
    if (booking.status !== "PENDING") {
      throw new Error("Only PENDING bookings can be paid");
    }

    // Validate payment method
    if (!paymentMethodId) throw new Error("paymentMethodId is required");
    const PaymentMethod = require("../models/paymentMethod");
    const methodExists = await PaymentMethod.exists({ _id: paymentMethodId, is_active: true });
    if (!methodExists) throw new Error("Payment method not found or inactive");

    // Generate transaction id
    const transactionId = "TX" + Date.now() + Math.random().toString(36).slice(2, 7).toUpperCase();

    const payment = await Payment.create({
      booking_id: bookingId,
      payment_method_id: paymentMethodId,
      transaction_id: transactionId,
      amount: booking.total_price_movie,
      payment_status: "COMPLETED",
      payment_time: new Date(),
    });

    booking.payment_id = payment._id;
    booking.status = "COMPLETED";
    await booking.save();

    return { booking_id: bookingId, payment_id: payment._id, transaction_id: transactionId, status: "COMPLETED" };
  }

  // Get booking by ID (Admin)
  async getBookingByIdAdmin(id) {
    try {
      const booking = await Booking.findById(id)
        .populate("user_id", "first_name last_name email phone")
        .populate("showtime_id")
        .populate("booking_seats")
        .populate("payment_id");

      if (!booking) {
        throw new Error("Booking not found");
      }

      // Get movie and screen details
      const showtime = await ShowTime.findById(booking.showtime_id)
        .populate("movie_id", "title duration type")
        .populate("screen_id", "name");

      // Get seat details
      const seatDetails = await Promise.all(
        booking.booking_seats.map(async (bookingSeat) => {
          const seatInfo = await BookingSeat.findById(bookingSeat).populate(
            "seat_id",
            "seat_number row column type is_variable"
          );
          return seatInfo;
        })
      );

      return {
        id: booking._id,
        user_id: booking.user_id._id,
        user_email: booking.user_id.email,
        user_name: `${booking.user_id.first_name} ${booking.user_id.last_name}`,
        user_phone: booking.user_id.phone,
        showtime_id: booking.showtime_id._id,
        movie_title: showtime?.movie_id?.title || "Unknown Movie",
        movie_duration: showtime?.movie_id?.duration,
        movie_type: showtime?.movie_id?.type,
        screen_name: showtime?.screen_id?.name || "Unknown Screen",
        start_time: showtime?.start_time,
        end_time: showtime?.end_time,
        total_seat: booking.total_seat,
        total_price_movie: booking.total_price_movie,
        booking_status: booking.status,
        payment_status: booking.payment_id?.payment_status || "PENDING",
        created_at: booking.created_at,
        updated_at: booking.updated_at,
        notes: booking.notes,
        booked_seats: seatDetails.map((seat) => ({
          id: seat?.seat_id?._id,
          seat_number: seat?.seat_id?.seat_number,
          row: seat?.seat_id?.row,
          column: seat?.seat_id?.column,
          type: seat?.seat_id?.type,
          is_variable: seat?.seat_id?.is_variable,
        })),
      };
    } catch (error) {
      throw new Error(`Failed to retrieve booking details: ${error.message}`);
    }
  }

  // Update booking status (Admin)
  async updateBookingStatus(id, status) {
    try {
      const booking = await Booking.findById(id)
        .populate("user_id")
        .populate("showtime_id")
        .populate("booking_seats")
        .populate("payment_id");

      if (!booking) {
        throw new Error("Booking not found");
      }

      // Validate status transition
      if (!this.isValidStatusTransition(booking.status, status)) {
        throw new Error(
          `Invalid status transition from ${booking.status} to ${status}`
        );
      }

      // Check if showtime has already started
      if (
        status === "CANCELLED" &&
        booking.showtime_id.start_time < new Date()
      ) {
        throw new Error(
          "Cannot cancel a booking for a showtime that has already started"
        );
      }

      const previousStatus = booking.status;
      booking.status = status;

      // Update payment status if cancelled
      if (status === "CANCELLED" && booking.payment_id) {
        const payment = await Payment.findById(booking.payment_id);
        if (payment && payment.payment_status === "COMPLETED") {
          payment.payment_status = "CANCELLED";
          payment.payment_time = new Date();
          await payment.save();
        }
      }

      await booking.save();

      // Get updated booking details for response
      const updatedBooking = await this.getBookingByIdAdmin(id);

      return updatedBooking;
    } catch (error) {
      throw new Error(`Failed to update booking status: ${error.message}`);
    }
  }

  // Validate status transition
  isValidStatusTransition(current, next) {
    const validTransitions = {
      PENDING: ["CONFIRMED", "CANCELLED", "COMPLETED"],
      CONFIRMED: ["CANCELLED", "COMPLETED"],
      COMPLETED: ["CANCELLED"],
      CANCELLED: [],
    };

    return validTransitions[current]?.includes(next) || false;
  }

  // Get booking statistics (Admin)
  async getBookingStatistics() {
    try {
      const totalBookings = await Booking.countDocuments();
      const pendingBookings = await Booking.countDocuments({
        status: "PENDING",
      });
      const confirmedBookings = await Booking.countDocuments({
        status: "CONFIRMED",
      });
      const cancelledBookings = await Booking.countDocuments({
        status: "CANCELLED",
      });
      const completedBookings = await Booking.countDocuments({
        status: "COMPLETED",
      });

      // Calculate total revenue
      const revenueResult = await Booking.aggregate([
        { $match: { status: "COMPLETED" } },
        { $group: { _id: null, totalRevenue: { $sum: "$total_price_movie" } } },
      ]);

      const totalRevenue =
        revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

      return {
        total_bookings: totalBookings,
        pending_bookings: pendingBookings,
        confirmed_bookings: confirmedBookings,
        cancelled_bookings: cancelledBookings,
        completed_bookings: completedBookings,
        total_revenue: totalRevenue,
      };
    } catch (error) {
      throw new Error(
        `Failed to retrieve booking statistics: ${error.message}`
      );
    }
  }
}

module.exports = new BookingService();
