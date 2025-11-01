const User = require("../models/user");
const Booking = require("../models/booking");
const Payment = require("../models/payment");
const Movie = require("../models/movie");
const News = require("../models/news");
const Festival = require("../models/festival");
const Theater = require("../models/theater");

class StatisticsService {
  // User statistics - simplified to match Java backend
  async getUserStatistics() {
    try {
      const currentDate = new Date();
      
      const activeUsers = await User.countDocuments({ status: "ACTIVE" });
      const blockedUsers = await User.countDocuments({ 
        status: "BLOCKED",
        $or: [
          { ban_until: null },
          { ban_until: { $gt: currentDate } }
        ]
      });

      return {
        activeUsers,
        blockedUsers
      };
    } catch (error) {
      throw new Error(`Failed to get user statistics: ${error.message}`);
    }
  }

  // Ticket statistics - match Java backend
  async getTicketStatistics(startDate, endDate) {
    try {
      // Count total tickets sold (from booking_seats)
      const totalTicketsSold = await Booking.aggregate([
        { $match: { 
          created_at: { $gte: startDate, $lte: endDate },
          status: "COMPLETED",
          $or: [
            { "payment.payment_status": "COMPLETED" },
            { "payment": null }
          ]
        }},
        { $unwind: "$booking_seats" },
        { $count: "total" }
      ]).then(result => result[0]?.total || 0);

      // Tickets per theater
      const ticketsPerTheater = await Booking.aggregate([
        { $match: { 
          created_at: { $gte: startDate, $lte: endDate },
          status: "COMPLETED",
          $or: [
            { "payment.payment_status": "COMPLETED" },
            { "payment": null }
          ]
        }},
        { $lookup: {
          from: "showtimes",
          localField: "showtime_id",
          foreignField: "_id",
          as: "showtime"
        }},
        { $unwind: "$showtime" },
        { $lookup: {
          from: "screens",
          localField: "showtime.screen_id",
          foreignField: "_id",
          as: "screen"
        }},
        { $unwind: "$screen" },
        { $lookup: {
          from: "theaters",
          localField: "screen.theater_id",
          foreignField: "_id",
          as: "theater"
        }},
        { $unwind: "$theater" },
        { $unwind: "$booking_seats" },
        { $group: {
          _id: "$theater._id",
          ticketCount: { $sum: 1 }
        }},
        { $project: {
          id: "$_id",
          ticketCount: 1,
          _id: 0
        }}
      ]);

      // Tickets per movie
      const ticketsPerMovie = await Booking.aggregate([
        { $match: { 
          created_at: { $gte: startDate, $lte: endDate },
          status: "COMPLETED",
          $or: [
            { "payment.payment_status": "COMPLETED" },
            { "payment": null }
          ]
        }},
        { $lookup: {
          from: "showtimes",
          localField: "showtime_id",
          foreignField: "_id",
          as: "showtime"
        }},
        { $unwind: "$showtime" },
        { $unwind: "$booking_seats" },
        { $group: {
          _id: "$showtime.movie_id",
          ticketCount: { $sum: 1 }
        }},
        { $project: {
          id: "$_id",
          ticketCount: 1,
          _id: 0
        }}
      ]);

      return {
        totalTicketsSold,
        ticketsPerTheater: ticketsPerTheater || [],
        ticketsPerMovie: ticketsPerMovie || []
      };
    } catch (error) {
      throw new Error(`Failed to get ticket statistics: ${error.message}`);
    }
  }

  // Supplier revenue statistics - match Java backend
  async getSupplierRevenueStatistics(startDate, endDate) {
    try {
      // Revenue by payment method (distributor in Java)
      const revenueByDistributor = await Payment.aggregate([
        { $match: { 
          payment_status: "COMPLETED",
          created_at: { $gte: startDate, $lte: endDate }
        }},
        { $lookup: {
          from: "paymentmethods",
          localField: "payment_method_id",
          foreignField: "_id",
          as: "paymentMethod"
        }},
        { $unwind: "$paymentMethod" },
        { $lookup: {
          from: "bookings",
          localField: "booking_id",
          foreignField: "_id",
          as: "booking"
        }},
        { $unwind: "$booking" },
        { $match: { "booking.status": "COMPLETED" }},
        { $group: {
          _id: "$paymentMethod.name",
          revenue: { $sum: "$amount" }
        }},
        { $project: {
          paymentMethod: "$_id",
          revenue: 1,
          _id: 0
        }}
      ]);

      return {
        revenueByDistributor: revenueByDistributor || []
      };
    } catch (error) {
      throw new Error(`Failed to get supplier revenue statistics: ${error.message}`);
    }
  }

  // Revenue statistics - match Java backend
  async getRevenueStatistics(startDate, endDate) {
    try {
      // Daily revenue
      const dayStart = new Date(startDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(startDate);
      dayEnd.setDate(dayEnd.getDate() + 1);
      dayEnd.setHours(0, 0, 0, 0);

      const dailyResult = await Booking.aggregate([
        { $match: { 
          created_at: { $gte: dayStart, $lt: dayEnd },
          status: "COMPLETED"
        }},
        { $lookup: {
          from: "payments",
          localField: "_id",
          foreignField: "booking_id",
          as: "payment"
        }},
        { $match: {
          $or: [
            { "payment.payment_status": "COMPLETED" },
            { "payment": [] }
          ]
        }},
        { $group: { _id: null, total: { $sum: "$total_price_movie" } } }
      ]);
      const dailyRevenue = dailyResult[0]?.total || 0;

      // Monthly revenue
      const monthStart = new Date(startDate);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const monthlyResult = await Booking.aggregate([
        { $match: { 
          created_at: { $gte: monthStart, $lt: monthEnd },
          status: "COMPLETED"
        }},
        { $lookup: {
          from: "payments",
          localField: "_id",
          foreignField: "booking_id",
          as: "payment"
        }},
        { $match: {
          $or: [
            { "payment.payment_status": "COMPLETED" },
            { "payment": [] }
          ]
        }},
        { $group: { _id: null, total: { $sum: "$total_price_movie" } } }
      ]);
      const monthlyRevenue = monthlyResult[0]?.total || 0;

      // Yearly revenue
      const yearStart = new Date(startDate);
      yearStart.setMonth(0, 1);
      yearStart.setHours(0, 0, 0, 0);
      const yearEnd = new Date(yearStart);
      yearEnd.setFullYear(yearEnd.getFullYear() + 1);

      const yearlyResult = await Booking.aggregate([
        { $match: { 
          created_at: { $gte: yearStart, $lt: yearEnd },
          status: "COMPLETED"
        }},
        { $lookup: {
          from: "payments",
          localField: "_id",
          foreignField: "booking_id",
          as: "payment"
        }},
        { $match: {
          $or: [
            { "payment.payment_status": "COMPLETED" },
            { "payment": [] }
          ]
        }},
        { $group: { _id: null, total: { $sum: "$total_price_movie" } } }
      ]);
      const yearlyRevenue = yearlyResult[0]?.total || 0;

      return {
        dailyRevenue,
        monthlyRevenue,
        yearlyRevenue
      };
    } catch (error) {
      throw new Error(`Failed to get revenue statistics: ${error.message}`);
    }
  }

  // News and event statistics - match Java backend
  async getNewsEventStatistics() {
    try {
      const totalNews = await News.countDocuments();
      const totalFestivals = await Festival.countDocuments();

      return {
        totalNews,
        totalFestivals
      };
    } catch (error) {
      throw new Error(`Failed to get news and event statistics: ${error.message}`);
    }
  }

  // Movie statistics - match Java backend
  async getMovieStatistics() {
    try {
      const currentDate = new Date();
      
      // Currently showing movies (release date <= current date)
      const currentlyShowing = await Movie.countDocuments({
        release_date: { $lte: currentDate }
      });

      // Coming soon movies (release date > current date)
      const comingSoon = await Movie.countDocuments({
        release_date: { $gt: currentDate }
      });

      // Calculate total revenue from currently showing movies
      const currentlyShowingMovies = await Movie.find({
        release_date: { $lte: currentDate }
      }).select("_id");

      const movieIds = currentlyShowingMovies.map(m => m._id);
      
      const totalRevenueCurrentlyShowing = await Booking.aggregate([
        { $match: { status: "COMPLETED" }},
        { $lookup: {
          from: "showtimes",
          localField: "showtime_id",
          foreignField: "_id",
          as: "showtime"
        }},
        { $unwind: "$showtime" },
        { $match: { "showtime.movie_id": { $in: movieIds }}},
        { $lookup: {
          from: "payments",
          localField: "_id",
          foreignField: "booking_id",
          as: "payment"
        }},
        { $match: {
          $or: [
            { "payment.payment_status": "COMPLETED" },
            { "payment": [] }
          ]
        }},
        { $group: { _id: null, total: { $sum: "$total_price_movie" } } }
      ]).then(result => result[0]?.total || 0);

      return {
        currentlyShowing,
        comingSoon,
        totalRevenueCurrentlyShowing,
        totalRevenueComingSoon: 0 // No revenue yet for coming soon movies
      };
    } catch (error) {
      throw new Error(`Failed to get movie statistics: ${error.message}`);
    }
  }
}

module.exports = new StatisticsService();