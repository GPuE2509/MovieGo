import Joi from 'joi';

// Validation schema for creating/updating a theater
export const theaterSchema = Joi.object({
  name: Joi.string()
    .max(100)
    .required()
    .messages({
      'string.empty': 'Name cannot be empty',
      'string.max': 'Name must not exceed 100 characters',
      'any.required': 'Name is required'
    }),
  location: Joi.string()
    .required()
    .messages({
      'string.empty': 'Location cannot be empty',
      'any.required': 'Location is required'
    }),
  phone: Joi.string()
    .pattern(/^[0-9]{8,11}$/)
    .required()
    .messages({
      'string.empty': 'Phone cannot be empty',
      'string.pattern.base': 'Phone number must be from 8 to 11 digits',
      'any.required': 'Phone is required'
    }),
  latitude: Joi.number()
    .min(-90)
    .max(90)
    .required()
    .messages({
      'number.base': 'Latitude must be a number',
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90',
      'any.required': 'Latitude is required'
    }),
  longitude: Joi.number()
    .min(-180)
    .max(180)
    .required()
    .messages({
      'number.base': 'Longitude must be a number',
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180',
      'any.required': 'Longitude is required'
    }),
  state: Joi.string()
    .max(50)
    .required()
    .messages({
      'string.empty': 'State cannot be empty',
      'string.max': 'State must not exceed 50 characters',
      'any.required': 'State is required'
    })
});

// Validation middleware
export const validateTheater = (req, res, next) => {
  const { error, value } = theaterSchema.validate(req.body, { abortEarly: false });
  
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
  const { page, size, sortBy, direction } = req.query;
  
  const errors = [];
  
  // Validate page
  if (page && (isNaN(page) || parseInt(page) < 0)) {
    errors.push({
      field: 'page',
      message: 'Page must be a non-negative number'
    });
  }
  
  // Validate size
  if (size && (isNaN(size) || parseInt(size) < 1 || parseInt(size) > 100)) {
    errors.push({
      field: 'size',
      message: 'Size must be between 1 and 100'
    });
  }
  
  // Validate sortBy
  const allowedSortFields = ['name', 'location', 'state', 'createdAt', 'updatedAt'];
  if (sortBy && !allowedSortFields.includes(sortBy)) {
    errors.push({
      field: 'sortBy',
      message: `Sort field must be one of: ${allowedSortFields.join(', ')}`
    });
  }
  
  // Validate direction
  if (direction && !['asc', 'desc'].includes(direction.toLowerCase())) {
    errors.push({
      field: 'direction',
      message: 'Direction must be either "asc" or "desc"'
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

// Validation for nearby theaters parameters
export const validateNearbyTheaters = (req, res, next) => {
  const { lat, lon, radius, limit } = req.query;
  
  const errors = [];
  
  // Validate latitude
  if (!lat || isNaN(lat) || parseFloat(lat) < -90 || parseFloat(lat) > 90) {
    errors.push({
      field: 'lat',
      message: 'Latitude must be a number between -90 and 90'
    });
  }
  
  // Validate longitude
  if (!lon || isNaN(lon) || parseFloat(lon) < -180 || parseFloat(lon) > 180) {
    errors.push({
      field: 'lon',
      message: 'Longitude must be a number between -180 and 180'
    });
  }
  
  // Validate radius
  if (radius && (isNaN(radius) || parseFloat(radius) < 1)) {
    errors.push({
      field: 'radius',
      message: 'Radius must be a number greater than 0'
    });
  }
  
  // Validate limit
  if (limit && (isNaN(limit) || parseInt(limit) < 1)) {
    errors.push({
      field: 'limit',
      message: 'Limit must be a number greater than 0'
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
