const User = require("../models/user");
const Booking = require("../models/booking");
const Payment = require("../models/payment");
const Movie = require("../models/movie");
const News = require("../models/news");
const Festival = require("../models/festival");
const Theater = require("../models/theater");

class StatisticsService {
  // Helper method to get date range for last 12 months
  getLastTwelveMonths() {
    const date = new Date();
    date.setMonth(date.getMonth() - 12);
    return date;
  }

  // Helper method to get date range for next 12 months
  getNextTwelveMonths() {
    const date = new Date();
    date.setMonth(date.getMonth() + 12);
    return date;
  }

  // Helper method to safely extract year from date field
  getYearFromDate(fieldName) {
    return {
      $addFields: {
        yearField: {
          $cond: {
            if: { $eq: [{ $type: `$${fieldName}` }, "date"] },
            then: { $year: `$${fieldName}` },
            else: {
              $toInt: {
                $substr: [{ $toString: `$${fieldName}` }, 0, 4]
              }
            }
          }
        }
      }
    };
  }

  async getUserStatistics() {
    try {
      const [totalUsers, activeUsers, blockedUsers] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ status: "ACTIVE" }),
        User.countDocuments({ status: "BLOCKED" })
      ]);
      
      const userRegistrationByMonth = await User.aggregate([
        { $match: { created_at: { $gte: this.getLastTwelveMonths() } } },
        {
          $group: {
            _id: {
              year: { $year: "$created_at" },
              month: { $month: "$created_at" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]);

      const usersByRole = await User.aggregate([
        { $unwind: "$roles" },
        {
          $lookup: {
            from: "roles",
            localField: "roles",
            foreignField: "_id",
            as: "roleInfo"
          }
        },
        {
          $group: {
            _id: "$roleInfo.role_name",
            count: { $sum: 1 }
          }
        }
      ]);

      return {
        totalUsers,
        activeUsers,
        blockedUsers,
        userRegistrationByMonth,
        usersByRole
      };
    } catch (error) {
      throw new Error(`Failed to get user statistics: ${error.message}`);
    }
  }

  async getTicketStatistics() {
    try {
      const [totalBookings, confirmedBookings, pendingBookings, cancelledBookings, completedBookings] = await Promise.all([
        Booking.countDocuments(),
        Booking.countDocuments({ status: "CONFIRMED" }),
        Booking.countDocuments({ status: "PENDING" }),
        Booking.countDocuments({ status: "CANCELLED" }),
        Booking.countDocuments({ status: "COMPLETED" })
      ]);

      const totalRevenue = await Booking.aggregate([
        { $match: { status: "COMPLETED" } },
        { $group: { _id: null, total: { $sum: "$total_price_movie" } } }
      ]);

      const bookingStatsByMonth = await Booking.aggregate([
        { $match: { created_at: { $gte: this.getLastTwelveMonths() } } },
        {
          $group: {
            _id: {
              year: { $year: "$created_at" },
              month: { $month: "$created_at" }
            },
            totalBookings: { $sum: 1 },
            totalRevenue: { $sum: "$total_price_movie" }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]);

      const avgBookingValue = totalRevenue.length > 0 && confirmedBookings > 0 
        ? totalRevenue[0].total / confirmedBookings 
        : 0;

      return {
        totalBookings,
        confirmedBookings,
        pendingBookings,
        cancelledBookings,
        completedBookings,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        avgBookingValue,
        bookingStatsByMonth
      };
    } catch (error) {
      throw new Error(`Failed to get ticket statistics: ${error.message}`);
    }
  }

  async getSupplierRevenueStatistics() {
    try {
      const revenueByTheater = await Booking.aggregate([
        {
          $lookup: {
            from: "showtimes",
            localField: "showtime_id",
            foreignField: "_id",
            as: "showtime"
          }
        },
        { $unwind: "$showtime" },
        {
          $lookup: {
            from: "theaters",
            localField: "showtime.theater_id",
            foreignField: "_id",
            as: "theater"
          }
        },
        { $unwind: "$theater" },
        { $match: { status: "COMPLETED" } },
        {
          $group: {
            _id: "$theater._id",
            theaterName: { $first: "$theater.name" },
            totalRevenue: { $sum: "$total_price_movie" },
            totalBookings: { $sum: 1 }
          }
        },
        { $sort: { totalRevenue: -1 } }
      ]);

      const totalSupplierRevenue = revenueByTheater.reduce((sum, theater) => 
        sum + theater.totalRevenue, 0
      );

      return {
        totalSupplierRevenue,
        revenueByTheater,
        totalTheaters: revenueByTheater.length
      };
    } catch (error) {
      throw new Error(`Failed to get supplier revenue statistics: ${error.message}`);
    }
  }

  async getRevenueStatistics() {
    try {
      const totalRevenue = await Payment.aggregate([
        { $match: { payment_status: "COMPLETED" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]);

      const revenueByPaymentMethod = await Payment.aggregate([
        { $match: { payment_status: "COMPLETED" } },
        {
          $lookup: {
            from: "paymentmethods",
            localField: "payment_method_id",
            foreignField: "_id",
            as: "paymentMethod"
          }
        },
        { $unwind: "$paymentMethod" },
        {
          $group: {
            _id: "$paymentMethod._id",
            methodName: { $first: "$paymentMethod.name" },
            totalRevenue: { $sum: "$amount" },
            transactionCount: { $sum: 1 }
          }
        },
        { $sort: { totalRevenue: -1 } }
      ]);

      const revenueByMonth = await Payment.aggregate([
        {
          $match: {
            payment_status: "COMPLETED",
            created_at: { $gte: this.getLastTwelveMonths() }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$created_at" },
              month: { $month: "$created_at" }
            },
            totalRevenue: { $sum: "$amount" },
            transactionCount: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]);

      const paymentStatusStats = await Payment.aggregate([
        {
          $group: {
            _id: "$payment_status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$amount" }
          }
        }
      ]);

      return {
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        revenueByPaymentMethod,
        revenueByMonth,
        paymentStatusStats
      };
    } catch (error) {
      throw new Error(`Failed to get revenue statistics: ${error.message}`);
    }
  }

  async getNewsEventStatistics() {
    try {
      const [totalNews, publishedNews, unpublishedNews] = await Promise.all([
        News.countDocuments(),
        News.countDocuments({ is_published: true }),
        News.countDocuments({ is_published: false })
      ]);

      const [totalFestivals, upcomingFestivals, pastFestivals] = await Promise.all([
        Festival.countDocuments(),
        Festival.countDocuments({ start_time: { $gte: new Date() } }),
        Festival.countDocuments({ end_time: { $lt: new Date() } })
      ]);

      const newsByMonth = await News.aggregate([
        { $match: { created_at: { $gte: this.getLastTwelveMonths() } } },
        {
          $group: {
            _id: {
              year: { $year: "$created_at" },
              month: { $month: "$created_at" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]);

      const festivalsByMonth = await Festival.aggregate([
        {
          $match: {
            start_time: { $gte: new Date(), $lte: this.getNextTwelveMonths() }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$start_time" },
              month: { $month: "$start_time" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]);

      return {
        news: {
          total: totalNews,
          published: publishedNews,
          unpublished: unpublishedNews,
          byMonth: newsByMonth
        },
        festivals: {
          total: totalFestivals,
          upcoming: upcomingFestivals,
          past: pastFestivals,
          byMonth: festivalsByMonth
        }
      };
    } catch (error) {
      throw new Error(`Failed to get news and event statistics: ${error.message}`);
    }
  }

  async getMovieStatistics() {
    try {
      const totalMovies = await Movie.countDocuments();
      
      const moviesByType = await Movie.aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } }
      ]);

      const moviesByGenre = await Movie.aggregate([
        { $unwind: "$genres" },
        {
          $lookup: {
            from: "genres",
            localField: "genres",
            foreignField: "_id",
            as: "genreInfo"
          }
        },
        { $unwind: "$genreInfo" },
        {
          $group: {
            _id: "$genreInfo.genre_name",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]);

      const moviesByYear = await Movie.aggregate([
        this.getYearFromDate("release_date"),
        {
          $group: {
            _id: "$yearField",
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": -1 } }
      ]);

      const moviesByMonth = await Movie.aggregate([
        { $match: { created_at: { $gte: this.getLastTwelveMonths() } } },
        {
          $group: {
            _id: {
              year: { $year: "$created_at" },
              month: { $month: "$created_at" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]);

      return {
        totalMovies,
        moviesByType,
        moviesByGenre,
        moviesByYear,
        moviesByMonth
      };
    } catch (error) {
      throw new Error(`Failed to get movie statistics: ${error.message}`);
    }
  }
}

module.exports = new StatisticsService();