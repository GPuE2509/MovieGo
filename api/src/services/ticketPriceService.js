const TicketPrice = require('../models/ticketPrice');
const ShowTime = require('../models/showtime');
const Movie = require('../models/movie');

function toSec(hms) {
  const [h, m, s] = (hms || '00:00:00').split(':').map(Number);
  return h * 3600 + m * 60 + (isNaN(s) ? 0 : s);
}

function timeToHMS(date) {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

function isWeekendByDate(d) {
  const day = d.getDay();
  return day === 0 || day === 6;
}

class TicketPriceService {
  async getAllTicketPrices({ typeSeat, typeMovie, sortBy = 'created_at', page = 0, size = 10 }) {
    const query = {};
    if (typeSeat) query.seat_type = typeSeat;
    if (typeMovie) query.movie_type = typeMovie;

    const pageNum = Math.max(Number(page) || 0, 0);
    const sizeNum = Math.min(Math.max(Number(size) || 10, 1), 100);

    const [items, total] = await Promise.all([
      TicketPrice.find(query).sort({ [sortBy]: sortBy.startsWith('-') ? -1 : 1 }).skip(pageNum * sizeNum).limit(sizeNum),
      TicketPrice.countDocuments(query),
    ]);

    return {
      content: items,
      totalElements: total,
      totalPages: Math.ceil(total / sizeNum),
      size: sizeNum,
      number: pageNum,
    };
  }

  async getTicketPriceById(id) {
    const doc = await TicketPrice.findById(id);
    if (!doc) throw new Error('Ticket price not found');
    return doc;
  }

  async addTicketPrice(data) {
    const created = await TicketPrice.create(data);
    return created;
  }

  async updateTicketPrice(id, data) {
    const updated = await TicketPrice.findByIdAndUpdate(id, data, { new: true });
    if (!updated) throw new Error('Ticket price not found');
    return updated;
  }

  async deleteTicketPrice(id) {
    const res = await TicketPrice.findByIdAndDelete(id);
    if (!res) throw new Error('Ticket price not found');
  }

  async getPriceBySeatAndMovieType(typeSeat, typeMovie, refDate = new Date()) {
    // Validate input parameters
    if (!typeSeat || !typeMovie) {
      throw new Error('seat_type and movie_type are required');
    }
    
    const validSeatTypes = ['STANDARD', 'VIP', 'SWEETBOX'];
    const validMovieTypes = ['2D', '3D', '4DX', 'IMAX'];
    
    if (!validSeatTypes.includes(typeSeat)) {
      throw new Error(`Invalid seat type. Must be one of: ${validSeatTypes.join(', ')}`);
    }
    
    if (!validMovieTypes.includes(typeMovie)) {
      throw new Error(`Invalid movie type. Must be one of: ${validMovieTypes.join(', ')}`);
    }
    
    const nowHMS = timeToHMS(refDate);
    const isWeekend = isWeekendByDate(refDate);
    
    // Filter by window: start_time <= now <= end_time (simple within-day window)
    const candidates = await TicketPrice.find({
      seat_type: typeSeat,
      movie_type: typeMovie,
      day_type: isWeekend,
      is_active: true,
    });
    
    if (candidates.length === 0) {
      throw new Error('No ticket prices found for the given seat type and movie type');
    }
    
    const nowSec = toSec(nowHMS);
    const matched = candidates.find(tp => {
      const startSec = toSec(tp.start_time);
      const endSec = toSec(tp.end_time);
      if (endSec >= startSec) {
        return nowSec >= startSec && nowSec <= endSec;
      }
      // Overnight window (e.g., 22:00:00 - 02:00:00)
      return nowSec >= startSec || nowSec <= endSec;
    });
    
    if (!matched) {
      throw new Error('No ticket price found for the current time window');
    }
    
    return matched;
  }

  async getApplicableTicketPrices(showtimeId, { page = 0, size = 10 }) {
    // Validate showtimeId
    if (!showtimeId) {
      throw new Error('showtimeId is required');
    }
    
    // Validate showtimeId format (should be a valid MongoDB ObjectId)
    if (!/^[0-9a-fA-F]{24}$/.test(showtimeId)) {
      throw new Error('Invalid showtimeId format');
    }
    
    const show = await ShowTime.findById(showtimeId).populate('movie_id');
    if (!show) throw new Error('Showtime not found');
    
    const movie = show.movie_id;
    if (!movie) throw new Error('Movie not found for showtime');

    const isWeekend = isWeekendByDate(new Date(show.start_time));
    const showHMS = timeToHMS(new Date(show.start_time));
    const showSec = toSec(showHMS);

    const query = { movie_type: movie.type, day_type: isWeekend, is_active: true };

    const pageNum = Math.max(Number(page) || 0, 0);
    const sizeNum = Math.min(Math.max(Number(size) || 10, 1), 100);

    const [items, total] = await Promise.all([
      TicketPrice.find(query).sort({ price: 1 }).skip(pageNum * sizeNum).limit(sizeNum),
      TicketPrice.countDocuments(query),
    ]);

    const filtered = items.filter(tp => {
      const startSec = toSec(tp.start_time);
      const endSec = toSec(tp.end_time);
      if (endSec >= startSec) return showSec >= startSec && showSec <= endSec;
      return showSec >= startSec || showSec <= endSec;
    });

    return {
      content: filtered,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / sizeNum),
      size: sizeNum,
      number: pageNum,
    };
  }
}

module.exports = new TicketPriceService();
