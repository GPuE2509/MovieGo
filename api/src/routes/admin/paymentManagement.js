const express = require('express');
const router = express.Router();
const paymentManagementController = require('../../controllers/paymentManagementController');
const { auth, adminMiddleware } = require('../../middleware/auth');
const { 
  addPaymentMethodValidation, 
  updatePaymentMethodValidation, 
  paymentMethodQueryValidation 
} = require('../../dto/request/paymentManagementDto');

// POST /api/v1/admin/add-payment-method
router.post('/add-payment-method', 
  auth, 
  adminMiddleware, 
  addPaymentMethodValidation, 
  paymentManagementController.addPaymentMethod
);

// GET /api/v1/admin/get-all-payment-method
router.get('/get-all-payment-method', 
  auth, 
  adminMiddleware, 
  paymentMethodQueryValidation, 
  paymentManagementController.getAllPaymentMethods
);

// DELETE /api/v1/admin/delete-payment-method/:id
router.delete('/delete-payment-method/:id', 
  auth, 
  adminMiddleware, 
  paymentManagementController.deletePaymentMethod
);

module.exports = router;
