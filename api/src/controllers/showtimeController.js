const showtimeService = require("../services/showtimeService");

class ShowtimeController {
  async getShowtimesByMovieId(req, res) {
    try {
      const { movieId } = req.params;
      const { page = 0, size = 50 } = req.query;
      const data = await showtimeService.findByMovieId(movieId, Number(page) || 0, Number(size) || 50);
      return res.status(200).json({ success: true, data });
    } catch (e) {
      return res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách suất chiếu: " + e.message });
    }
  }

  async getShowtimesByMovieIdAndTheater(req, res) {
    try {
      const { movieId } = req.params;
      const { theaterId, page = 0, size = 10, date } = req.query;
      const data = await showtimeService.findShowtimesByMovieIdAndTheater(movieId, theaterId, Number(page)||0, Number(size)||10, date);
      return res.status(200).json({ success: true, data });
    } catch (e) {
      return res.status(404).json({ success: false, message: "Movie or theater not found: " + e.message });
    }
  }

  async getAvailableDatesByMovieIdAndTheater(req, res) {
    try {
      const { movieId } = req.params;
      const { theaterId } = req.query;
      const data = await showtimeService.getAvailableDatesByMovieIdAndTheater(movieId, theaterId);
      return res.status(200).json({ success: true, data });
    } catch (e) {
      return res.status(404).json({ success: false, message: "No available dates found: " + e.message });
    }
  }

  async createShowtime(req, res) {
    try {
      const result = await showtimeService.createShowtime(req.body);
      return res.status(201).json({ success: true, data: result });
    } catch (e) {
      return res.status(400).json({ success: false, message: "Invalid input: " + e.message });
    }
  }

  async getShowtimeById(req, res) {
    try {
      const { id } = req.params;
      const data = await showtimeService.findById(id);
      return res.status(200).json({ success: true, data });
    } catch (e) {
      return res.status(404).json({ success: false, message: "Showtime not found: " + e.message });
    }
  }

  async deleteShowtime(req, res) {
    try {
      const { id } = req.params;
      await showtimeService.deleteShowtime(id);
      return res.status(204).json();
    } catch (e) {
      return res.status(404).json({ success: false, message: "Showtime not found: " + e.message });
    }
  }

  async getSeatsByShowtimeId(req, res) {
    try {
      const { showtimeId } = req.params;
      const { theaterId } = req.query;
      const data = await showtimeService.getSeatsByShowtimeIdAndTheater(showtimeId, theaterId);
      return res.status(200).json({ success: true, data });
    } catch (e) {
      return res.status(404).json({ success: false, message: "Showtime or theater not found: " + e.message });
    }
  }

  async getShowtimesByMovieAndTheater(req, res) {
    try {
      const { movieId, theaterId } = req.params;
      const { date } = req.query;
      const data = await showtimeService.findShowtimesByMovieAndTheaterAndDate(movieId, theaterId, date);
      return res.status(200).json({ success: true, data });
    } catch (e) {
      return res.status(400).json({ success: false, message: e.message });
    }
  }

  async getShowtimesAdminByMovieIdAndTheater(req, res) {
    try {
      const { movieId } = req.params;
      const { theaterId, screenId, page = 0, size = 10, date } = req.query;
      const data = await showtimeService.findShowtimesByMovieIdTheaterAndScreen(movieId, theaterId, screenId, Number(page)||0, Number(size)||10, date);
      return res.status(200).json({ success: true, data });
    } catch (e) {
      return res.status(404).json({ success: false, message: "Movie or theater not found: " + e.message });
    }
  }
}

module.exports = new ShowtimeController();


