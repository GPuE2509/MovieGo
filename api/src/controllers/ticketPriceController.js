const { validationResult } = require('express-validator');
const ticketPriceService = require('../services/ticketPriceService');

class TicketPriceController {
  async getAll(req, res) {
    try {
      const { typeSeat, typeMovie, sortBy, page, size } = req.query;
      const data = await ticketPriceService.getAllTicketPrices({ typeSeat, typeMovie, sortBy, page, size });
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const doc = await ticketPriceService.getTicketPriceById(req.params.id);
      res.status(200).json({ success: true, data: doc });
    } catch (error) {
      if (error.message === 'Ticket price not found') {
        return res.status(404).json({ success: false, message: 'Ticket price not found' });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
      }
      const created = await ticketPriceService.addTicketPrice(req.body);
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
      }
      const updated = await ticketPriceService.updateTicketPrice(req.params.id, req.body);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      if (error.message === 'Ticket price not found') {
        return res.status(404).json({ success: false, message: 'Ticket price not found' });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await ticketPriceService.deleteTicketPrice(req.params.id);
      res.status(200).json({ success: true, message: 'Ticket price deleted successfully' });
    } catch (error) {
      if (error.message === 'Ticket price not found') {
        return res.status(404).json({ success: false, message: 'Ticket price not found' });
      }
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new TicketPriceController();
