import Joi from 'joi';

// Validation for pagination parameters
export const validatePagination = (req, res, next) => {
  const { page, size } = req.query;
  
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

// Validation for date parameter
export const validateDate = (req, res, next) => {
  const { date } = req.query;
  
  if (date) {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        status: 400,
        code: 400,
        message: 'Validation Error',
        details: [{
          field: 'date',
          message: 'Date must be a valid date format'
        }]
      });
    }
  }
  
  next();
};

// Validation for theater ID parameter
export const validateTheaterId = (req, res, next) => {
  const { theaterId } = req.query;
  
  if (theaterId && (isNaN(theaterId) || parseInt(theaterId) < 1)) {
    return res.status(400).json({
      status: 400,
      code: 400,
      message: 'Validation Error',
      details: [{
        field: 'theaterId',
        message: 'Theater ID must be a positive number'
      }]
      });
  }
  
  next();
};

// Validation for movie ID parameter
export const validateMovieId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id || isNaN(id) || parseInt(id) < 1) {
    return res.status(400).json({
      status: 400,
      code: 400,
      message: 'Validation Error',
      details: [{
        field: 'id',
        message: 'Movie ID must be a positive number'
      }]
    });
  }
  
  next();
};

// Validation for now parameter (for showing/coming movies)
export const validateNow = (req, res, next) => {
  const { now } = req.query;
  
  if (now) {
    const parsedDate = new Date(now);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        status: 400,
        code: 400,
        message: 'Validation Error',
        details: [{
          field: 'now',
          message: 'Now parameter must be a valid date format'
        }]
      });
    }
  }
  
  next();
};
