const { body, param, query } = require("express-validator");

// Validation for user query parameters
const userQueryValidation = [
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
    .isIn(["created_at", "updated_at", "first_name", "last_name", "email"])
    .withMessage("Invalid sort field"),
  query("search").optional().isString().withMessage("Search must be a string"),
  query("status")
    .optional()
    .isIn(["ACTIVE", "BLOCKED"])
    .withMessage("Status must be ACTIVE or BLOCKED"),
];

// Validation for updating user status
const updateUserStatusValidation = [
  param("id").isMongoId().withMessage("Invalid user ID"),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["ACTIVE", "BLOCKED"])
    .withMessage("Status must be ACTIVE or BLOCKED"),
  body("ban_until")
    .optional()
    .isISO8601()
    .withMessage("Ban until must be a valid ISO 8601 date")
    .custom((value, { req }) => {
      if (value && req.body.status === "ACTIVE") {
        throw new Error("Ban until should not be set for ACTIVE status");
      }
      if (req.body.status === "BLOCKED" && !value) {
        throw new Error("Ban until is required for BLOCKED status");
      }
      return true;
    }),
];

// Validation for user ID parameter
const userIdValidation = [
  param("id").isMongoId().withMessage("Invalid user ID"),
];

module.exports = {
  userQueryValidation,
  updateUserStatusValidation,
  userIdValidation,
};
