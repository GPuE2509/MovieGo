const { body, param } = require('express-validator');

const createCouponValidation = [
  body('coupon_name').exists().isString().trim().isLength({ min: 1, max: 100 }),
  body('coupon_code').exists().isString().trim().isLength({ min: 1, max: 100 }),
  body('coupon_value').exists().isFloat({ min: 0 }).toFloat(),
  body('exchange_point').exists().isInt({ min: 0 }).toInt(),
];

const updateCouponValidation = [
  param('id').isMongoId(),
  body('coupon_name').optional().isString().trim().isLength({ min: 1, max: 100 }),
  body('coupon_code').optional().isString().trim().isLength({ min: 1, max: 100 }),
  body('coupon_value').optional().isFloat({ min: 0 }).toFloat(),
  body('exchange_point').optional().isInt({ min: 0 }).toInt(),
];

module.exports = {
  createCouponValidation,
  updateCouponValidation,
};
