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

class BookingService {
  // Get all bookings with pagination and search (Admin)
  async getAllBookings(search, page, size, sortBy, direction) {
    try {
      const query = {};

      // Add search filter
      if (search && search.trim()) {
        query.$or = [
          { booking_code: { $regex: search, $options: "i" } },
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
            booking_code: booking.booking_code,
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
        booking_code: booking.booking_code,
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
