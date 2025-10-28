const seatService = require("../services/seatService");

class SeatController {
  async list(req, res) {
    try {
      const { keyword, page = 0, size = 10, sortBy = "seat_number", direction = "asc" } = req.query;
      const data = await seatService.listSeats({
        keyword,
        page: Number(page) || 0,
        size: Number(size) || 10,
        sortBy,
        direction,
        deleted: false,
      });
      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async create(req, res) {
    try {
      const created = await seatService.createSeat(req.body);
      return res.status(201).json({ success: true, data: created });
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async update(req, res) {
    try {
      const updated = await seatService.updateSeat(req.params.id, req.body);
      return res.status(200).json({ success: true, data: updated });
    } catch (err) {
      if (err.message === "Seat not found") return res.status(404).json({ success: false, message: err.message });
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async remove(req, res) {
    try {
      await seatService.softDeleteSeat(req.params.id);
      return res.status(204).json({ success: true, data: "Seat deleted successfully" });
    } catch (err) {
      if (err.message === "Seat not found") return res.status(404).json({ success: false, message: err.message });
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async listDeleted(req, res) {
    try {
      const { keyword, page = 0, size = 10, sortBy = "seat_number", direction = "asc" } = req.query;
      const data = await seatService.getDeletedSeats({
        keyword,
        page: Number(page) || 0,
        size: Number(size) || 10,
        sortBy,
        direction,
      });
      return res.status(200).json({ success: true, data });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async restore(req, res) {
    try {
      const restored = await seatService.restoreSeat(req.params.id);
      return res.status(200).json({ success: true, data: restored });
    } catch (err) {
      if (err.message === "Seat not found") return res.status(404).json({ success: false, message: err.message });
      return res.status(400).json({ success: false, message: err.message });
    }
  }

  async adminSeatStatus(req, res) {
    try {
      const { showtimeId } = req.params;
      const { theaterId } = req.query;
      if (!showtimeId) return res.status(400).json({ success: false, message: "Invalid showtimeId" });

      const data = await seatService.getAdminSeatStatusByShowtimeAndTheater(showtimeId, theaterId);
      return res.status(200).json({ success: true, data });
    } catch (err) {
      if (/(Showtime|Screen) not found/.test(err.message)) {
        return res.status(404).json({ success: false, message: err.message });
      }
      return res.status(400).json({ success: false, message: err.message });
    }
  }
}

module.exports = new SeatController();


