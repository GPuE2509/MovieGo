const { body, param, query } = require('express-validator');

const theaterQueryValidation = [
  query('search').optional().isString().trim(),
  query('city').optional().isString().trim(),
  query('page').optional().isInt({ min: 0 }).toInt(),
  query('size').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sortField').optional().isString().isIn(['name','city','created_at','updated_at']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isString().isIn(['asc','desc']).withMessage('Invalid sort order'),
  query('is_active').optional().isBoolean().toBoolean(),
];

const createTheaterValidation = [
  body('name').exists().isString().trim().isLength({ min: 1, max: 255 }),
  body('address').exists().isString().trim().isLength({ min: 1, max: 500 }),
  body('city').exists().isString().trim().isLength({ min: 1, max: 100 }),
  body('phone').optional().isString().trim().isLength({ max: 20 }),
  body('email').optional().isString().trim().isLength({ max: 255 }),
  body('is_active').optional().isBoolean().toBoolean(),
];

const updateTheaterValidation = [
  param('id').isMongoId(),
  body('name').optional().isString().trim().isLength({ min: 1, max: 255 }),
  body('address').optional().isString().trim().isLength({ min: 1, max: 500 }),
  body('city').optional().isString().trim().isLength({ min: 1, max: 100 }),
  body('phone').optional().isString().trim().isLength({ max: 20 }),
  body('email').optional().isString().trim().isLength({ max: 255 }),
  body('is_active').optional().isBoolean().toBoolean(),
];

module.exports = {
  theaterQueryValidation,
  createTheaterValidation,
  updateTheaterValidation,
};
