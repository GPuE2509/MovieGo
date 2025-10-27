const { validationResult } = require('express-validator');
const paymentManagementService = require('../services/paymentManagementService');

class PaymentManagementController {
  async addPaymentMethod(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Validation failed', 
          errors: errors.array() 
        });
      }

      const paymentMethod = await paymentManagementService.addPaymentMethod(req.body);
      res.status(201).json({ 
        success: true, 
        message: 'Payment method added successfully',
        data: paymentMethod 
      });
    } catch (error) {
      if (error.message.includes('duplicate') || error.message.includes('already exists')) {
        return res.status(409).json({ 
          success: false, 
          message: error.message 
        });
      }
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async getAllPaymentMethods(req, res) {
    try {
      const { page = 0, size = 10, search, is_active } = req.query;
      
      const data = await paymentManagementService.getAllPaymentMethods({
        page: parseInt(page),
        size: parseInt(size),
        search,
        is_active: is_active !== undefined ? is_active === 'true' : undefined
      });
      
      res.status(200).json({ 
        success: true, 
        data 
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  async deletePaymentMethod(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Payment method ID is required' 
        });
      }

      // Validate ObjectId format
      if (!/^[0-9a-fA-F]{24}$/.test(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid payment method ID format' 
        });
      }

      await paymentManagementService.deletePaymentMethod(id);
      res.status(200).json({ 
        success: true, 
        message: 'Payment method deleted successfully' 
      });
    } catch (error) {
      if (error.message === 'Payment method not found') {
        return res.status(404).json({ 
          success: false, 
          message: 'Payment method not found' 
        });
      }
      if (error.message.includes('in use') || error.message.includes('cannot delete')) {
        return res.status(409).json({ 
          success: false, 
          message: error.message 
        });
      }
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  }
}

module.exports = new PaymentManagementController();
