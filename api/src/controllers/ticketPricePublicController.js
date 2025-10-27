const { validationResult } = require('express-validator');
const ticketPriceService = require('../services/ticketPriceService');

class TicketPricePublicController {
  async getTicketPrice(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
      }
      
      const { typeSeat, typeMovie } = req.query;
      const price = await ticketPriceService.getPriceBySeatAndMovieType(typeSeat, typeMovie);
      res.status(200).json({ success: true, data: price });
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('No ticket price')) {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message.includes('Invalid') || error.message.includes('required')) {
        return res.status(400).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getApplicable(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
      }
      
      const { showtimeId } = req.params;
      const { page = 0, size = 10 } = req.query;
      
      // Validate pagination parameters
      const pageNum = Math.max(parseInt(page) || 0, 0);
      const sizeNum = Math.min(Math.max(parseInt(size) || 10, 1), 100);
      
      const data = await ticketPriceService.getApplicableTicketPrices(showtimeId, { page: pageNum, size: sizeNum });
      res.status(200).json({ success: true, data });
    } catch (error) {
      if (error.message === 'Showtime not found') {
        return res.status(404).json({ success: false, message: 'Showtime not found' });
      }
      if (error.message === 'Movie not found for showtime') {
        return res.status(404).json({ success: false, message: 'Movie not found for showtime' });
      }
      if (error.message.includes('Invalid') || error.message.includes('required')) {
        return res.status(400).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new TicketPricePublicController();
