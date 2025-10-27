const { body, param, query } = require("express-validator");

// Validation for banner query parameters
const bannerQueryValidation = [
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
    .isIn(["created_at", "updated_at", "title", "display_order"])
    .withMessage("Invalid sort field"),
  query("search")
    .optional()
    .isString()
    .withMessage("Search must be a string"),
  query("is_active")
    .optional()
    .custom((value) => {
      if (value === "" || value === "true" || value === "false") {
        return true;
      }
      throw new Error("is_active must be true, false, or empty");
    }),
];

// Validation for banner ID parameter
const bannerIdValidation = [
  param("id").isMongoId().withMessage("Invalid banner ID"),
];

// Validation for creating banner
const createBannerValidation = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isString()
    .withMessage("Title must be a string")
    .isLength({ max: 255 })
    .withMessage("Title must not exceed 255 characters"),
  body("image")
    .notEmpty()
    .withMessage("Image is required")
    .isString()
    .withMessage("Image must be a string")
    .isLength({ max: 500 })
    .withMessage("Image URL must not exceed 500 characters"),
  body("link")
    .optional()
    .isString()
    .withMessage("Link must be a string")
    .isLength({ max: 500 })
    .withMessage("Link must not exceed 500 characters")
    .isURL()
    .withMessage("Link must be a valid URL"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
  body("displayOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("displayOrder must be a non-negative integer"),
];

// Validation for updating banner
const updateBannerValidation = [
  param("id").isMongoId().withMessage("Invalid banner ID"),
  body("title")
    .optional()
    .isString()
    .withMessage("Title must be a string")
    .isLength({ max: 255 })
    .withMessage("Title must not exceed 255 characters"),
  body("image")
    .optional()
    .isString()
    .withMessage("Image must be a string")
    .isLength({ max: 500 })
    .withMessage("Image URL must not exceed 500 characters"),
  body("link")
    .optional()
    .isString()
    .withMessage("Link must be a string")
    .isLength({ max: 500 })
    .withMessage("Link must not exceed 500 characters")
    .isURL()
    .withMessage("Link must be a valid URL"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
  body("displayOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("displayOrder must be a non-negative integer"),
];

module.exports = {
  bannerQueryValidation,
  bannerIdValidation,
  createBannerValidation,
  updateBannerValidation,
};
