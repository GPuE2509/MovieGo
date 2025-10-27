const { body, query } = require('express-validator');

const addPaymentMethodValidation = [
  body('name')
    .notEmpty()
    .withMessage('Payment method name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Payment method name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Payment method name can only contain letters, numbers, spaces, hyphens, and underscores'),
  
  body('description')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Description must not exceed 255 characters'),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value'),
  
  body('gateway_config')
    .optional()
    .isObject()
    .withMessage('Gateway configuration must be a valid object'),
  
  body('gateway_config.gateway_type')
    .optional()
    .isIn(['VNPAY', 'PAYPAL', 'MOMO', 'CUSTOM'])
    .withMessage('Gateway type must be one of: VNPAY, PAYPAL, MOMO, CUSTOM'),
  
  body('gateway_config.tmn_code')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('TMN code must be between 1 and 50 characters'),
  
  body('gateway_config.hash_secret')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Hash secret must be between 1 and 100 characters'),
  
  body('gateway_config.client_id')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Client ID must be between 1 and 100 characters'),
  
  body('gateway_config.client_secret')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Client secret must be between 1 and 100 characters'),
  
  body('gateway_config.partner_code')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Partner code must be between 1 and 50 characters'),
  
  body('gateway_config.access_key')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Access key must be between 1 and 100 characters'),
  
  body('gateway_config.secret_key')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Secret key must be between 1 and 100 characters')
];

const updatePaymentMethodValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Payment method name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-_]+$/)
    .withMessage('Payment method name can only contain letters, numbers, spaces, hyphens, and underscores'),
  
  body('description')
    .optional()
    .isLength({ max: 255 })
    .withMessage('Description must not exceed 255 characters'),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value'),
  
  body('gateway_config')
    .optional()
    .isObject()
    .withMessage('Gateway configuration must be a valid object'),
  
  body('gateway_config.gateway_type')
    .optional()
    .isIn(['VNPAY', 'PAYPAL', 'MOMO', 'CUSTOM'])
    .withMessage('Gateway type must be one of: VNPAY, PAYPAL, MOMO, CUSTOM'),
  
  body('gateway_config.tmn_code')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('TMN code must be between 1 and 50 characters'),
  
  body('gateway_config.hash_secret')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Hash secret must be between 1 and 100 characters'),
  
  body('gateway_config.client_id')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Client ID must be between 1 and 100 characters'),
  
  body('gateway_config.client_secret')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Client secret must be between 1 and 100 characters'),
  
  body('gateway_config.partner_code')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Partner code must be between 1 and 50 characters'),
  
  body('gateway_config.access_key')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Access key must be between 1 and 100 characters'),
  
  body('gateway_config.secret_key')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Secret key must be between 1 and 100 characters')
];

const paymentMethodQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Page must be a non-negative integer')
    .toInt(),
  
  query('size')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Size must be between 1 and 100')
    .toInt(),
  
  query('search')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Search term must not exceed 100 characters')
    .trim(),
  
  query('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean value')
    .toBoolean()
];

module.exports = {
  addPaymentMethodValidation,
  updatePaymentMethodValidation,
  paymentMethodQueryValidation
};
