import Joi from 'joi';

// Validation schema for creating/updating coupon
export const validateCoupon = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string()
      .max(255)
      .required()
      .messages({
        'string.empty': 'Name coupon cannot be empty',
        'string.max': 'Name coupon cannot exceed 255 characters',
        'any.required': 'Name coupon is required'
      }),
    code: Joi.string()
      .max(255)
      .required()
      .messages({
        'string.empty': 'Code cannot be empty',
        'string.max': 'Code cannot exceed 255 characters',
        'any.required': 'Code is required'
      }),
    value: Joi.number()
      .integer()
      .min(0)
      .required()
      .messages({
        'number.base': 'Value must be a number',
        'number.integer': 'Value must be an integer',
        'number.min': 'Value must be >= 0',
        'any.required': 'Value is required'
      }),
    exchange_point: Joi.number()
      .integer()
      .min(0)
      .required()
      .messages({
        'number.base': 'Exchange point must be a number',
        'number.integer': 'Exchange point must be an integer',
        'number.min': 'Exchange point must be >= 0',
        'any.required': 'Exchange point is required'
      })
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      status: 400,
      code: 400,
      message: 'Validation Error',
      details: error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }))
    });
  }
  
  next();
};

// Validation for pagination parameters
export const validatePagination = (req, res, next) => {
  const { page, pageSize, sortField, sortOrder } = req.query;
  
  const errors = [];
  
  // Validate page
  if (page && (isNaN(page) || parseInt(page) < 0)) {
    errors.push({
      field: 'page',
      message: 'Page must be a non-negative number'
    });
  }
  
  // Validate pageSize
  if (pageSize && (isNaN(pageSize) || parseInt(pageSize) < 1 || parseInt(pageSize) > 100)) {
    errors.push({
      field: 'pageSize',
      message: 'Page size must be between 1 and 100'
    });
  }
  
  // Validate sortField
  const allowedSortFields = ['name', 'code', 'value', 'exchange_point', 'createdAt', 'updatedAt'];
  if (sortField && !allowedSortFields.includes(sortField)) {
    errors.push({
      field: 'sortField',
      message: `Sort field must be one of: ${allowedSortFields.join(', ')}`
    });
  }
  
  // Validate sortOrder
  if (sortOrder && !['asc', 'desc'].includes(sortOrder.toLowerCase())) {
    errors.push({
      field: 'sortOrder',
      message: 'Sort order must be either "asc" or "desc"'
    });
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      status: 400,
      code: 400,
      message: 'Validation Error',
      details: errors
    });
  }
  
  next();
};

// Validation for user ID parameter
export const validateUserId = (req, res, next) => {
  const { userId } = req.params;
  
  if (!userId || isNaN(userId) || parseInt(userId) < 1) {
    return res.status(400).json({
      status: 400,
      code: 400,
      message: 'Validation Error',
      details: [{
        field: 'userId',
        message: 'User ID must be a positive number'
      }]
    });
  }
  
  next();
};

// Validation for coupon ID parameter
export const validateCouponId = (req, res, next) => {
  const { couponId, id } = req.params;
  const couponIdToValidate = couponId || id;
  
  if (!couponIdToValidate || isNaN(couponIdToValidate) || parseInt(couponIdToValidate) < 1) {
    return res.status(400).json({
      status: 400,
      code: 400,
      message: 'Validation Error',
      details: [{
        field: couponId ? 'couponId' : 'id',
        message: 'Coupon ID must be a positive number'
      }]
    });
  }
  
  next();
};

// Validation for search parameter
export const validateSearch = (req, res, next) => {
  const { search } = req.query;
  
  if (search && typeof search !== 'string') {
    return res.status(400).json({
      status: 400,
      code: 400,
      message: 'Validation Error',
      details: [{
        field: 'search',
        message: 'Search must be a string'
      }]
    });
  }
  
  next();
};
