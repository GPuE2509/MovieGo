const seatService = require("../services/seatService");

class SeatSelectionController {
  async getSeatStatus(req, res) {
    try {
      const { showtimeId } = req.params;
      const { theaterId } = req.query;
      if (!showtimeId) {
        return res.status(400).json({ success: false, message: "Invalid showtimeId" });
      }
      const data = await seatService.getSeatStatusByShowtimeAndTheater(showtimeId, theaterId);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      if (/(Showtime|Screen) not found/.test(err.message)) {
        return res.status(404).json({ success: false, message: err.message });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new SeatSelectionController();


