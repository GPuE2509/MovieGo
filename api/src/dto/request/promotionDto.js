const { body, param, query } = require("express-validator");

// Validation for promotion query parameters
const promotionQueryValidation = [
  query("page")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Page must be a non-negative integer"),
  query("size")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Size must be between 1 and 100"),
  query("sortBy")
    .optional()
    .isIn(["created_at", "updated_at", "title", "start_date", "end_date"])
    .withMessage("Invalid sort field"),
  query("search").optional().isString().withMessage("Search must be a string"),
  query("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Status must be ACTIVE or INACTIVE"),
];

// Validation for creating promotion
const createPromotionValidation = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 1, max: 200 })
    .withMessage("Title must be between 1 and 200 characters"),
  body("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),
  body("discount_percentage")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount percentage must be between 0 and 100"),
  body("discount_amount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Discount amount must be a positive number"),
  body("min_order_amount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum order amount must be a positive number"),
  body("max_discount_amount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum discount amount must be a positive number"),
  body("start_date")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),
  body("end_date")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.start_date)) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),
  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("Is active must be a boolean value"),
  body("image")
    .optional()
    .isURL()
    .withMessage("Image must be a valid URL"),
];

// Validation for updating promotion
const updatePromotionValidation = [
  param("id").isMongoId().withMessage("Invalid promotion ID"),
  body("title")
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage("Title must be between 1 and 200 characters"),
  body("description")
    .optional()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),
  body("discount_percentage")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount percentage must be between 0 and 100"),
  body("discount_amount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Discount amount must be a positive number"),
  body("min_order_amount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Minimum order amount must be a positive number"),
  body("max_discount_amount")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Maximum discount amount must be a positive number"),
  body("start_date")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),
  body("end_date")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date"),
  body("is_active")
    .optional()
    .isBoolean()
    .withMessage("Is active must be a boolean value"),
  body("image")
    .optional()
    .isURL()
    .withMessage("Image must be a valid URL"),
];

// Validation for promotion ID parameter
const promotionIdValidation = [
  param("id").isMongoId().withMessage("Invalid promotion ID"),
];

module.exports = {
  promotionQueryValidation,
  createPromotionValidation,
  updatePromotionValidation,
  promotionIdValidation,
};
