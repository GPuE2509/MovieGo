const { body, param, query } = require('express-validator');

const queryValidation = [
  query('search').optional().isString().trim(),
  query('page').optional().isInt({ min: 0 }).toInt(),
  query('size').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('sortField').optional().isString().isIn(['genre_name', 'created_at', 'updated_at']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isString().isIn(['asc', 'desc']).withMessage('Invalid sort order'),
];

const createGenreValidation = [
  body('genre_name')
    .exists().withMessage('genre_name is required')
    .bail()
    .isString().withMessage('genre_name must be string')
    .bail()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('genre_name length 1-100')
];

const updateGenreValidation = [
  param('id').isMongoId(),
  body('genre_name')
    .optional()
    .isString().withMessage('genre_name must be string')
    .bail()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('genre_name length 1-100')
];

module.exports = {
  queryValidation,
  createGenreValidation,
  updateGenreValidation
};
