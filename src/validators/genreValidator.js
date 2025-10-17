import Joi from 'joi';

// Validation schema for creating/updating a genre
export const genreSchema = Joi.object({
  genreName: Joi.string()
    .max(100)
    .required()
    .messages({
      'string.empty': 'Genre name cannot be empty',
      'string.max': 'Genre name cannot exceed 100 characters',
      'any.required': 'Genre name is required'
    })
});

// Validation middleware
export const validateGenre = (req, res, next) => {
  const { error, value } = genreSchema.validate(req.body, { abortEarly: false });
  
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
