const { body, param } = require('express-validator');

const createCouponValidation = [
  body('coupon_code').exists().isString().trim().isLength({ min: 1, max: 100 }),
  body('discount_percentage').optional().isFloat({ min: 0, max: 100 }).toFloat(),
  body('discount_amount').optional().isFloat({ min: 0 }).toFloat(),
  body('min_order_amount').optional().isFloat({ min: 0 }).toFloat(),
  body('max_discount_amount').optional().isFloat({ min: 0 }).toFloat(),
  body('usage_limit').optional().isInt({ min: 0 }).toInt(),
  body('start_date').exists().isISO8601(),
  body('end_date').exists().isISO8601(),
  body('is_active').optional().isBoolean().toBoolean(),
];

const updateCouponValidation = [
  param('id').isMongoId(),
  body('coupon_code').optional().isString().trim().isLength({ min: 1, max: 100 }),
  body('discount_percentage').optional().isFloat({ min: 0, max: 100 }).toFloat(),
  body('discount_amount').optional().isFloat({ min: 0 }).toFloat(),
  body('min_order_amount').optional().isFloat({ min: 0 }).toFloat(),
  body('max_discount_amount').optional().isFloat({ min: 0 }).toFloat(),
  body('usage_limit').optional().isInt({ min: 0 }).toInt(),
  body('start_date').optional().isISO8601(),
  body('end_date').optional().isISO8601(),
  body('is_active').optional().isBoolean().toBoolean(),
];

module.exports = {
  createCouponValidation,
  updateCouponValidation,
};
