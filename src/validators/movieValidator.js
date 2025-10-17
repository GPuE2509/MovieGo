import Joi from 'joi';

// Movie types enum
const MOVIE_TYPES = ['2D', '3D', '4DX', 'IMAX'];

// Validation schema for creating a movie
export const createMovieSchema = Joi.object({
  title: Joi.string()
    .max(255)
    .required()
    .messages({
      'string.empty': 'Title cannot be empty',
      'string.max': 'Title cannot exceed 255 characters',
      'any.required': 'Title is required'
    }),
  
  description: Joi.string()
    .max(1000)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  
  author: Joi.string()
    .max(100)
    .required()
    .messages({
      'string.empty': 'Author cannot be empty',
      'string.max': 'Author cannot exceed 100 characters',
      'any.required': 'Author is required'
    }),
  
  actors: Joi.string()
    .max(1000)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Actors list cannot exceed 1000 characters'
    }),
  
  nation: Joi.string()
    .max(100)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Nation cannot exceed 100 characters'
    }),
  
  trailer: Joi.string()
    .uri()
    .allow('')
    .optional()
    .messages({
      'string.uri': 'Trailer must be a valid URL'
    }),
  
  type: Joi.string()
    .valid(...MOVIE_TYPES)
    .required()
    .messages({
      'any.only': `Type must be one of: ${MOVIE_TYPES.join(', ')}`,
      'any.required': 'Type is required'
    }),
  
  duration: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'Duration must be a number',
      'number.integer': 'Duration must be an integer',
      'number.min': 'Duration must be greater than 0',
      'any.required': 'Duration is required'
    }),
  
  releaseDate: Joi.date()
    .required()
    .messages({
      'date.base': 'Release date must be a valid date',
      'any.required': 'Release date is required'
    }),
  
  genreIds: Joi.array()
    .items(Joi.number().integer().positive())
    .optional()
    .messages({
      'array.base': 'Genre IDs must be an array',
      'number.base': 'Each genre ID must be a number',
      'number.integer': 'Each genre ID must be an integer',
      'number.positive': 'Each genre ID must be positive'
    })
});

// Validation schema for updating a movie
export const updateMovieSchema = Joi.object({
  title: Joi.string()
    .max(255)
    .required()
    .messages({
      'string.empty': 'Title cannot be empty',
      'string.max': 'Title cannot exceed 255 characters',
      'any.required': 'Title is required'
    }),
  
  description: Joi.string()
    .max(1000)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  
  author: Joi.string()
    .max(100)
    .required()
    .messages({
      'string.empty': 'Author cannot be empty',
      'string.max': 'Author cannot exceed 100 characters',
      'any.required': 'Author is required'
    }),
  
  trailer: Joi.string()
    .uri()
    .allow('')
    .optional()
    .messages({
      'string.uri': 'Trailer must be a valid URL'
    }),
  
  type: Joi.string()
    .valid(...MOVIE_TYPES)
    .required()
    .messages({
      'any.only': `Type must be one of: ${MOVIE_TYPES.join(', ')}`,
      'any.required': 'Type is required'
    }),
  
  duration: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      'number.base': 'Duration must be a number',
      'number.integer': 'Duration must be an integer',
      'number.min': 'Duration must be greater than 0',
      'any.required': 'Duration is required'
    }),
  
  releaseDate: Joi.date()
    .required()
    .messages({
      'date.base': 'Release date must be a valid date',
      'any.required': 'Release date is required'
    }),
  
  genreIds: Joi.array()
    .items(Joi.number().integer().positive())
    .optional()
    .messages({
      'array.base': 'Genre IDs must be an array',
      'number.base': 'Each genre ID must be a number',
      'number.integer': 'Each genre ID must be an integer',
      'number.positive': 'Each genre ID must be positive'
    })
});

// Validation schema for query parameters
export const movieQuerySchema = Joi.object({
  title: Joi.string().optional(),
  author: Joi.string().optional(),
  sortBy: Joi.string().default('createdAt'),
  page: Joi.number().integer().min(0).default(0),
  size: Joi.number().integer().min(1).max(100).default(10),
  date: Joi.date().optional(),
  theaterId: Joi.number().integer().positive().optional()
});

// Validation middleware
export const validateMovie = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    
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
};

export const validateQuery = (req, res, next) => {
  const { error, value } = movieQuerySchema.validate(req.query, { abortEarly: false });
  
  if (error) {
    const details = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return res.status(400).json({
      status: 400,
      code: 400,
      message: 'Query Validation Error',
      details
    });
  }
  
  req.query = value;
  next();
};
