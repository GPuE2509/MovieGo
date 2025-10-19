const { body, param, query } = require("express-validator");

// Validation for festival query parameters
const festivalQueryValidation = [
  query("page")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Page must be a non-negative integer"),
  query("pageSize")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Page size must be between 1 and 100"),
  query("sortField")
    .optional()
    .isIn(["title", "start_time", "end_time", "created_at"])
    .withMessage("Invalid sort field"),
  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc"),
  query("search").optional().isString().withMessage("Search must be a string"),
];

// Validation for creating a festival
const createFestivalValidation = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 1, max: 255 })
    .withMessage("Title must be between 1 and 255 characters")
    .trim(),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .trim(),
  body("location")
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage("Location must be less than 255 characters")
    .trim(),
  body("image").optional().isString().withMessage("Image must be a string"),
  body("start_time")
    .notEmpty()
    .withMessage("Start time is required")
    .isISO8601()
    .withMessage("Start time must be a valid ISO 8601 date")
    .custom((value) => {
      const startTime = new Date(value);
      const now = new Date();
      if (startTime < now) {
        throw new Error("The start time must be from now on");
      }
      return true;
    }),
  body("end_time")
    .notEmpty()
    .withMessage("End time is required")
    .isISO8601()
    .withMessage("End time must be a valid ISO 8601 date")
    .custom((value, { req }) => {
      if (req.body.start_time) {
        const startTime = new Date(req.body.start_time);
        const endTime = new Date(value);
        if (endTime < startTime) {
          throw new Error("The end time must not be less than the start time");
        }
      }
      return true;
    }),
];

// Validation for updating a festival
const updateFestivalValidation = [
  param("id").isMongoId().withMessage("Invalid festival ID"),
  body("title")
    .optional()
    .isLength({ min: 1, max: 255 })
    .withMessage("Title must be between 1 and 255 characters")
    .trim(),
  body("description")
    .optional()
    .isString()
    .withMessage("Description must be a string")
    .trim(),
  body("location")
    .optional()
    .isString()
    .isLength({ max: 255 })
    .withMessage("Location must be less than 255 characters")
    .trim(),
  body("image").optional().isString().withMessage("Image must be a string"),
  body("start_time")
    .optional()
    .isISO8601()
    .withMessage("Start time must be a valid ISO 8601 date")
    .custom((value) => {
      if (value) {
        const startTime = new Date(value);
        const now = new Date();
        if (startTime < now) {
          throw new Error("The start time must be from now on");
        }
      }
      return true;
    }),
  body("end_time")
    .optional()
    .isISO8601()
    .withMessage("End time must be a valid ISO 8601 date")
    .custom((value, { req }) => {
      if (value && req.body.start_time) {
        const startTime = new Date(req.body.start_time);
        const endTime = new Date(value);
        if (endTime < startTime) {
          throw new Error("The end time must not be less than the start time");
        }
      }
      return true;
    }),
];

// Validation for festival ID parameter
const festivalIdValidation = [
  param("id").isMongoId().withMessage("Invalid festival ID"),
];

module.exports = {
  festivalQueryValidation,
  createFestivalValidation,
  updateFestivalValidation,
  festivalIdValidation,
};
