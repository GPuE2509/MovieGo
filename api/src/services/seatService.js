const Seat = require("../models/seat");
const Screen = require("../models/screen");
const ShowTime = require("../models/showtime");
const Booking = require("../models/booking");
const BookingSeat = require("../models/bookingSeat");

function buildSeatQuery({ keyword, deleted }) {
  const query = {};
  if (deleted === true) query.is_deleted = true;
  if (deleted === false) query.is_deleted = false;
  if (keyword) {
    query.$or = [
      { seat_number: { $regex: keyword, $options: "i" } },
      { row: { $regex: keyword, $options: "i" } },
    ];
  }
  return query;
}

async function listSeats({ keyword, page = 0, size = 10, sortBy = "seat_number", direction = "asc", deleted = false }) {
  const query = buildSeatQuery({ keyword, deleted });
  const sort = { [sortBy]: direction.toLowerCase() === "asc" ? 1 : -1 };
  const totalElements = await Seat.countDocuments(query);
  const items = await Seat.find(query)
    .sort(sort)
    .skip(page * size)
    .limit(size)
    .lean();

  return {
    content: items,
    page,
    size,
    totalElements,
    totalPages: Math.ceil(totalElements / size) || 0,
  };
}

async function createSeat(payload) {
  const seat = await Seat.create(payload);
  return seat.toObject();
}

async function updateSeat(id, payload) {
  const updated = await Seat.findByIdAndUpdate(id, payload, { new: true }).lean();
  if (!updated) throw new Error("Seat not found");
  return updated;
}

async function softDeleteSeat(id) {
  const updated = await Seat.findByIdAndUpdate(id, { is_deleted: true }, { new: true }).lean();
  if (!updated) throw new Error("Seat not found");
  return updated;
}

async function restoreSeat(id) {
  const updated = await Seat.findByIdAndUpdate(id, { is_deleted: false }, { new: true }).lean();
  if (!updated) throw new Error("Seat not found");
  return updated;
}

async function getDeletedSeats(opts) {
  return listSeats({ ...opts, deleted: true });
}

async function getAdminSeatStatusByShowtimeAndTheater(showtimeId, theaterId) {
  const showtime = await ShowTime.findById(showtimeId).lean();
  if (!showtime) throw new Error("Showtime not found");

  const screen = await Screen.findById(showtime.screen_id).lean();
  if (!screen) throw new Error("Screen not found");
  if (theaterId && String(screen.theater_id) !== String(theaterId)) {
    // If provided theaterId does not match, still proceed but note mismatch
  }

  const seats = await Seat.find({ screen_id: screen._id }).lean(); // include deleted seats for admin view

  const bookings = await Booking.find({
    showtime_id: showtime._id,
    status: { $in: ["PENDING", "CONFIRMED", "COMPLETED"] },
  })
    .select("_id")
    .lean();
  const bookingIds = bookings.map((b) => b._id);

  let bookedSeatIds = new Set();
  if (bookingIds.length) {
    const bookingSeats = await BookingSeat.find({ booking_id: { $in: bookingIds } })
      .select("seat_id")
      .lean();
    bookedSeatIds = new Set(bookingSeats.map((bs) => String(bs.seat_id)));
  }

  // Group by row
  const rowMap = new Map();
  for (const s of seats) {
    const rowKey = s.row;
    if (!rowMap.has(rowKey)) rowMap.set(rowKey, []);
    rowMap.get(rowKey).push({
      id: s._id,
      seat_number: s.seat_number,
      row: s.row,
      column: s.column,
      type: s.type,
      is_deleted: !!s.is_deleted,
      status: bookedSeatIds.has(String(s._id)) ? "BOOKED" : "AVAILABLE",
    });
  }

  const rows = [...rowMap.entries()]
    .map(([row, seatsInRow]) => ({
      row,
      seats: seatsInRow.sort((a, b) => a.column - b.column),
    }))
    .sort((a, b) => a.row.localeCompare(b.row));

  return rows;
}

async function getSeatStatusByShowtimeAndTheater(showtimeId, theaterId) {
  const showtime = await ShowTime.findById(showtimeId).lean();
  if (!showtime) throw new Error("Showtime not found");

  const screen = await Screen.findById(showtime.screen_id).lean();
  if (!screen) throw new Error("Screen not found");
  if (theaterId && String(screen.theater_id) !== String(theaterId)) {
    // proceed even if mismatch
  }

  // Exclude deleted seats for public selection
  const seats = await Seat.find({ screen_id: screen._id, $or: [{ is_deleted: false }, { is_deleted: { $exists: false } }] }).lean();

  const bookings = await Booking.find({
    showtime_id: showtime._id,
    status: { $in: ["PENDING", "CONFIRMED", "COMPLETED"] },
  })
    .select("_id")
    .lean();
  const bookingIds = bookings.map((b) => b._id);

  let bookedSeatIds = new Set();
  if (bookingIds.length) {
    const bookingSeats = await BookingSeat.find({ booking_id: { $in: bookingIds } })
      .select("seat_id")
      .lean();
    bookedSeatIds = new Set(bookingSeats.map((bs) => String(bs.seat_id)));
  }

  const rowMap = new Map();
  for (const s of seats) {
    const rowKey = s.row;
    if (!rowMap.has(rowKey)) rowMap.set(rowKey, []);
    rowMap.get(rowKey).push({
      id: s._id,
      seat_number: s.seat_number,
      row: s.row,
      column: s.column,
      type: s.type,
      status: bookedSeatIds.has(String(s._id)) ? "BOOKED" : "AVAILABLE",
    });
  }

  return [...rowMap.entries()]
    .map(([row, seatsInRow]) => ({ row, seats: seatsInRow.sort((a, b) => a.column - b.column) }))
    .sort((a, b) => a.row.localeCompare(b.row));
}

module.exports = {
  listSeats,
  createSeat,
  updateSeat,
  softDeleteSeat,
  restoreSeat,
  getDeletedSeats,
  getAdminSeatStatusByShowtimeAndTheater,
  getSeatStatusByShowtimeAndTheater,
};


