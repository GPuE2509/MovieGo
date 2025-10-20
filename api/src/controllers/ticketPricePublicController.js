const ticketPriceService = require('../services/ticketPriceService');

class TicketPricePublicController {
  async getTicketPrice(req, res) {
    try {
      const { typeSeat, typeMovie } = req.query;
      if (!typeSeat || !typeMovie) {
        return res.status(400).json({ success: false, message: 'typeSeat and typeMovie are required' });
      }
      const price = await ticketPriceService.getPriceBySeatAndMovieType(typeSeat, typeMovie);
      res.status(200).json({ success: true, data: price });
    } catch (error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getApplicable(req, res) {
    try {
      const { page = 0, size = 10 } = req.query;
      const data = await ticketPriceService.getApplicableTicketPrices(req.params.showtimeId, { page, size });
      res.status(200).json({ success: true, data });
    } catch (error) {
      if (error.message === 'Showtime not found') {
        return res.status(404).json({ success: false, message: 'Showtime not found' });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new TicketPricePublicController();
