const { body, query } = require('express-validator');

const MOVIE_TYPES = ['2D', '3D', '4DX', 'IMAX'];

const createMovieValidation = [
  body('title').isString().notEmpty().isLength({ max: 255 }).withMessage('Title is required and max 255 chars'),
  body('description').optional().isString().isLength({ max: 1000 }).withMessage('Description max 1000 chars'),
  body('author').isString().notEmpty().isLength({ max: 100 }).withMessage('Author is required and max 100 chars'),
  body('actors').optional().isString().isLength({ max: 1000 }).withMessage('Actors max 1000 chars'),
  body('nation').optional().isString().isLength({ max: 100 }).withMessage('Nation max 100 chars'),
  body('trailer').optional().isString().isLength({ max: 255 }).withMessage('Trailer max 255 chars'),
  body('type').isIn(MOVIE_TYPES).withMessage(`Type must be one of: ${MOVIE_TYPES.join(', ')}`),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be integer >= 1'),
  body('releaseDate').optional().isISO8601().withMessage('releaseDate must be a date'),
  body('release_date').optional().isISO8601().withMessage('release_date must be a date'),
  body('genreIds').optional()
    .custom((val) => {
      if (Array.isArray(val)) return true;
      if (typeof val === 'string') return true; // allow CSV or JSON string
      return false;
    })
];

const updateMovieValidation = [
  body('title').isString().notEmpty().isLength({ max: 255 }).withMessage('Title is required and max 255 chars'),
  body('description').optional().isString().isLength({ max: 1000 }).withMessage('Description max 1000 chars'),
  body('author').isString().notEmpty().isLength({ max: 100 }).withMessage('Author is required and max 100 chars'),
  body('trailer').optional().isString().isLength({ max: 255 }).withMessage('Trailer max 255 chars'),
  body('type').isIn(MOVIE_TYPES).withMessage(`Type must be one of: ${MOVIE_TYPES.join(', ')}`),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be integer >= 1'),
  body('releaseDate').optional().isISO8601().withMessage('releaseDate must be a date'),
  body('release_date').optional().isISO8601().withMessage('release_date must be a date'),
  body('genreIds').optional()
    .custom((val) => {
      if (Array.isArray(val)) return true;
      if (typeof val === 'string') return true;
      return false;
    })
];

const movieQueryValidation = [
  query('title').optional().isString(),
  query('author').optional().isString(),
  query('sortBy').optional().isString(),
  query('page').optional().isInt({ min: 0 }).toInt(),
  query('size').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('date').optional().isISO8601(),
  query('theaterId').optional().isString()
];

module.exports = {
  createMovieValidation,
  updateMovieValidation,
  movieQueryValidation
};
