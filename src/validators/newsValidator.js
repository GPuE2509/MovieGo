import Joi from 'joi';

// Validation schema for creating/updating news
export const newsSchema = Joi.object({
  title: Joi.string()
    .max(255)
    .required()
    .messages({
      'string.empty': 'Title cannot be empty',
      'string.max': 'Title cannot exceed 255 characters',
      'any.required': 'Title is required'
    }),
  content: Joi.string()
    .allow('')
    .optional()
    .messages({
      'string.base': 'Content must be a string'
    })
});

// Validation middleware for news data
export const validateNews = (req, res, next) => {
  const { error, value } = newsSchema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const details = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      status: 400,
      code: 400,
      message: 'Validation Error',
      details
    });
  }
  
  req.body = value;
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
  const allowedSortFields = ['title', 'createdAt', 'updatedAt'];
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
