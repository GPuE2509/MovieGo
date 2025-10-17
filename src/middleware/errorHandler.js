export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    status: err.status || 500,
    message: err.message || 'Internal Server Error',
    code: err.code || 500
  };

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    error.status = 400;
    error.code = 400;
    error.message = 'Validation Error';
    error.details = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    error.status = 409;
    error.code = 409;
    error.message = 'Duplicate Entry';
    error.details = err.errors.map(e => ({
      field: e.path,
      message: `${e.path} already exists`
    }));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.status = 401;
    error.code = 401;
    error.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    error.status = 401;
    error.code = 401;
    error.message = 'Token expired';
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.status = 400;
    error.code = 400;
    error.message = 'File too large';
  }

  // Custom application errors
  if (err.name === 'ValidationError') {
    error.status = 400;
    error.code = 400;
    error.message = err.message;
  }

  if (err.name === 'NotFoundError') {
    error.status = 404;
    error.code = 404;
    error.message = err.message;
  }

  if (err.name === 'UnauthorizedError') {
    error.status = 401;
    error.code = 401;
    error.message = err.message;
  }

  if (err.name === 'ForbiddenError') {
    error.status = 403;
    error.code = 403;
    error.message = err.message;
  }

  if (err.name === 'ConflictError') {
    error.status = 409;
    error.code = 409;
    error.message = err.message;
  }

  // Response
  res.status(error.status).json({
    status: error.status,
    code: error.code,
    message: error.message,
    ...(error.details && { details: error.details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
