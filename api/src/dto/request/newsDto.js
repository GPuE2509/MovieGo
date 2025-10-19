const { body, param, query } = require('express-validator');

const newsQueryValidation = [
  query('search').optional().isString().trim(),
  query('page').optional().isInt({ min: 0 }).toInt(),
  query('size').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sortField').optional().isString().isIn(['title','author','created_at','updated_at','published_at']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isString().isIn(['asc','desc']).withMessage('Invalid sort order'),
];

const createNewsValidation = [
  body('title').exists().isString().trim().isLength({ min: 1, max: 255 }),
  body('content').exists().isString().isLength({ min: 1 }),
  body('author').exists().isString().trim().isLength({ min: 1, max: 100 }),
  body('image').optional().isString().isLength({ max: 255 }),
  body('is_published').optional().isBoolean().toBoolean(),
  body('published_at').optional().isISO8601().toDate(),
];

const updateNewsValidation = [
  param('id').isMongoId(),
  body('title').optional().isString().trim().isLength({ min: 1, max: 255 }),
  body('content').optional().isString().isLength({ min: 1 }),
  body('author').optional().isString().trim().isLength({ min: 1, max: 100 }),
  body('image').optional().isString().isLength({ max: 255 }),
  body('is_published').optional().isBoolean().toBoolean(),
  body('published_at').optional().isISO8601().toDate(),
];

module.exports = {
  newsQueryValidation,
  createNewsValidation,
  updateNewsValidation,
};
