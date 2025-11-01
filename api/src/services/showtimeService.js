const mongoose = require("mongoose");
const ShowTime = require("../models/showtime");
const Movie = require("../models/movie");
const Theater = require("../models/theater");
const Screen = require("../models/screen");
const Seat = require("../models/seat");
const Booking = require("../models/booking");
const BookingSeat = require("../models/bookingSeat");

function toObjectId(id) {
  return new mongoose.Types.ObjectId(id);
}

function paginate(result, page, size) {
  const totalPages = Math.ceil(result.total / size) || 0;
  return {
    content: result.items,
    page,
    size,
    totalElements: result.total,
    totalPages,
    hasPrevious: page > 0,
    hasNext: page < totalPages - 1,
  };
}

async function findByMovieId(movieId, page = 0, size = 50) {
  const filter = { movie_id: movieId };
  const total = await ShowTime.countDocuments(filter);
  const items = await ShowTime.find(filter)
    .sort({ start_time: 1 })
    .skip(page * size)
    .limit(size)
    .lean();
  return paginate({ items, total }, page, size);
}

async function findShowtimesByMovieIdAndTheater(movieId, theaterId, page = 0, size = 10, date) {
  if (!movieId || Number(movieId) <= 0) {
    return paginate({ items: [], total: 0 }, page, size);
  }
  if (page < 0 || size <= 0) {
    return paginate({ items: [], total: 0 }, page, size);
  }

  const screenFilter = { };
  if (theaterId) screenFilter.theater_id = theaterId;
  const screens = theaterId ? await Screen.find(screenFilter).select("_id").lean() : null;
  const screenIds = screens ? screens.map((s) => s._id) : undefined;

  const filter = { movie_id: movieId };
  if (screenIds) filter.screen_id = { $in: screenIds };
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    filter.start_time = { $gte: start, $lt: end };
  }

  const total = await ShowTime.countDocuments(filter);
  const items = await ShowTime.find(filter)
    .sort({ start_time: 1 })
    .skip(page * size)
    .limit(size)
    .lean();
  return paginate({ items, total }, page, size);
}

async function getAvailableDatesByMovieIdAndTheater(movieId, theaterId) {
  const screenFilter = { };
  if (theaterId) screenFilter.theater_id = theaterId;
  const screens = theaterId ? await Screen.find(screenFilter).select("_id").lean() : null;
  const match = { movie_id: toObjectId(movieId) };
  if (screens) match.screen_id = { $in: screens.map((s) => s._id) };

  const dates = await ShowTime.aggregate([
    { $match: match },
    { $project: { day: { $dateToString: { format: "%Y-%m-%d", date: "$start_time" } } } },
    { $group: { _id: "$day" } },
    { $sort: { _id: 1 } },
  ]);
  return dates.map((d) => d._id);
}

async function createShowtime({ movie_id, screen_id, start_time, end_time, is_active = true }) {
  const movie = await Movie.findById(movie_id).lean();
  if (!movie) throw new Error("Movie not found");
  const screen = await Screen.findById(screen_id).lean();
  if (!screen) throw new Error("Screen not found");

  // Release date check: start_time must be on/after release_date if present
  if (movie.release_date) {
    const start = new Date(start_time);
    if (start < new Date(movie.release_date)) {
      throw new Error(`Movie "${movie.title}" will be released on ${new Date(movie.release_date).toISOString()}. Cannot schedule before release date.`);
    }
  }

  // Overlap check on the same screen: new.start < existing.end && new.end > existing.start
  const overlap = await ShowTime.findOne({
    screen_id: screen_id,
    start_time: { $lt: new Date(end_time) },
    end_time: { $gt: new Date(start_time) },
  }).lean();
  if (overlap) {
    throw new Error("Showtime overlaps with existing showtime for this screen");
  }

  // Duration check: (end-start in minutes) + 15 must equal movie.duration
  const diffMinutes = Math.floor((new Date(end_time) - new Date(start_time)) / (60 * 1000));
  if (diffMinutes + 15 !== Number(movie.duration)) {
    throw new Error(`Showtime duration mismatch: start-end + 15 minutes must equal movie duration (${movie.duration} minutes).`);
  }

  const created = await ShowTime.create({ movie_id, screen_id, start_time, end_time, is_active });
  return created.toObject();
}

async function findById(id) {
  const st = await ShowTime.findById(id).lean();
  if (!st) throw new Error("Showtime not found");
  return st;
}

async function deleteShowtime(id) {
  const st = await ShowTime.findById(id).lean();
  if (!st) throw new Error("Showtime not found");
  await ShowTime.deleteOne({ _id: id });
}

async function getSeatsByShowtimeIdAndTheater(showtimeId, theaterId) {
  const showtime = await ShowTime.findById(showtimeId).lean();
  if (!showtime) throw new Error("Showtime not found");
  const screen = await Screen.findById(showtime.screen_id).lean();
  if (!screen) throw new Error("Screen not found");
  if (theaterId && String(screen.theater_id) !== String(theaterId)) {
    throw new Error("Theater ID does not match the showtime's theater");
  }

  const seats = await Seat.find({ screen_id: screen._id, is_deleted: { $in: [false, undefined] } }).lean();

  const bookings = await Booking.find({
    showtime_id: showtime._id,
    status: { $in: ["PENDING", "CONFIRMED", "COMPLETED"] },
  }).select("_id").lean();
  const bookingIds = bookings.map((b) => b._id);
  let bookedSeatIds = new Set();
  if (bookingIds.length) {
    const bookingSeats = await BookingSeat.find({ booking_id: { $in: bookingIds } }).select("seat_id").lean();
    bookedSeatIds = new Set(bookingSeats.map((bs) => String(bs.seat_id)));
  }

  return seats.map((s) => ({
    id: s._id,
    seatNumber: s.seat_number,
    row: s.row,
    column: s.column,
    type: s.type,
    taken: bookedSeatIds.has(String(s._id)),
  }));
}

async function findShowtimesByMovieAndTheaterAndDate(movieId, theaterId, date) {
  const screens = await Screen.find({ theater_id: theaterId }).select("_id").lean();
  const screenIds = screens.map((s) => s._id);
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  const items = await ShowTime.find({
    movie_id: movieId,
    screen_id: { $in: screenIds },
    start_time: { $gte: start, $lt: end },
  })
    .sort({ start_time: 1 })
    .lean();
  return items;
}

async function findShowtimesByMovieIdTheaterAndScreen(movieId, theaterId, screenId, page = 0, size = 10, date) {
  try {
    const filter = { movie_id: movieId };
    if (theaterId) {
      const screens = await Screen.find({ theater_id: theaterId }).select("_id").lean();
      filter.screen_id = { $in: screens.map((s) => s._id) };
    }
    if (screenId) {
      filter.screen_id = toObjectId(screenId);
    }
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      filter.start_time = { $gte: start, $lt: end };
    }
    const total = await ShowTime.countDocuments(filter);
    const items = await ShowTime.find(filter)
      .sort({ start_time: 1 })
      .skip(page * size)
      .limit(size)
      .lean();
    return paginate({ items, total }, page, size);
  } catch (e) {
    return paginate({ items: [], total: 0 }, page, size);
  }
}

module.exports = {
  findByMovieId,
  findShowtimesByMovieIdAndTheater,
  getAvailableDatesByMovieIdAndTheater,
  createShowtime,
  findById,
  deleteShowtime,
  getSeatsByShowtimeIdAndTheater,
  findShowtimesByMovieAndTheaterAndDate,
  findShowtimesByMovieIdTheaterAndScreen,
};


