const { body, query } = require('express-validator');

const SEAT_TYPES = ['STANDARD', 'VIP', 'SWEETBOX'];
const MOVIE_TYPES = ['2D', '3D', '4DX', 'IMAX'];

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;

const createTicketPriceValidation = [
  body('seat_type').isIn(SEAT_TYPES).withMessage(`seat_type must be one of: ${SEAT_TYPES.join(', ')}`),
  body('movie_type').isIn(MOVIE_TYPES).withMessage(`movie_type must be one of: ${MOVIE_TYPES.join(', ')}`),
  body('price').isFloat({ min: 0 }).withMessage('price must be a number >= 0'),
  body('day_type').isBoolean().withMessage('day_type must be boolean'),
  body('start_time').matches(timeRegex).withMessage('start_time must be HH:mm:ss'),
  body('end_time').matches(timeRegex).withMessage('end_time must be HH:mm:ss'),
];

const updateTicketPriceValidation = [
  body('seat_type').optional().isIn(SEAT_TYPES),
  body('movie_type').optional().isIn(MOVIE_TYPES),
  body('price').optional().isFloat({ min: 0 }),
  body('day_type').optional().isBoolean(),
  body('start_time').optional().matches(timeRegex),
  body('end_time').optional().matches(timeRegex),
];

const ticketPriceQueryValidation = [
  query('typeSeat').optional().isIn(SEAT_TYPES),
  query('typeMovie').optional().isIn(MOVIE_TYPES),
  query('sortBy').optional().isString(),
  query('page').optional().isInt({ min: 0 }).toInt(),
  query('size').optional().isInt({ min: 1, max: 100 }).toInt(),
];

const ticketPricePublicQueryValidation = [
  query('typeSeat').isIn(SEAT_TYPES).withMessage(`typeSeat must be one of: ${SEAT_TYPES.join(', ')}`),
  query('typeMovie').isIn(MOVIE_TYPES).withMessage(`typeMovie must be one of: ${MOVIE_TYPES.join(', ')}`),
];

const applicableTicketPriceQueryValidation = [
  query('page').optional().isInt({ min: 0 }).toInt(),
  query('size').optional().isInt({ min: 1, max: 100 }).toInt(),
];

module.exports = {
  createTicketPriceValidation,
  updateTicketPriceValidation,
  ticketPriceQueryValidation,
  ticketPricePublicQueryValidation,
  applicableTicketPriceQueryValidation,
};
