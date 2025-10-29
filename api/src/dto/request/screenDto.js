const { body, param, query } = require("express-validator");

const screenQueryValidation = [
  query("page").optional().isInt({ min: 0 }).withMessage("Page must be a non-negative integer"),
  query("size").optional().isInt({ min: 1, max: 100 }).withMessage("Size must be between 1 and 100"),
  query("sortBy")
    .optional()
    .isIn(["created_at", "updated_at", "name", "capacity"]) 
    .withMessage("Invalid sort field"),
  query("search").optional().isString().withMessage("Search must be a string"),
  query("status").optional().isIn(["ACTIVE", "INACTIVE"]).withMessage("Status must be ACTIVE or INACTIVE"),
  query("theaterId").optional().isMongoId().withMessage("Invalid theater ID"),
];

const createScreenValidation = [
  body("name").notEmpty().withMessage("Name is required").isLength({ max: 100 }).withMessage("Name must be at most 100 characters"),
  body("theater_id").notEmpty().withMessage("Theater is required").isMongoId().withMessage("Invalid theater ID"),
  body("capacity").notEmpty().withMessage("Capacity is required").isInt({ min: 1 }).withMessage("Capacity must be at least 1"),
  body("screen_type")
    .optional()
    .isIn(["STANDARD", "IMAX", "4DX", "VIP"]) 
    .withMessage("Invalid screen type"),
  body("is_active").optional().isBoolean().withMessage("Is active must be a boolean value"),
];

const updateScreenValidation = [
  param("id").isMongoId().withMessage("Invalid screen ID"),
  body("name").optional().isLength({ max: 100 }).withMessage("Name must be at most 100 characters"),
  body("theater_id").optional().isMongoId().withMessage("Invalid theater ID"),
  body("capacity").optional().isInt({ min: 1 }).withMessage("Capacity must be at least 1"),
  body("screen_type").optional().isIn(["STANDARD", "IMAX", "4DX", "VIP"]).withMessage("Invalid screen type"),
  body("is_active").optional().isBoolean().withMessage("Is active must be a boolean value"),
];

const updateScreenStatusValidation = [
  param("id").isMongoId().withMessage("Invalid screen ID"),
  body("is_active").notEmpty().withMessage("is_active is required").isBoolean().withMessage("is_active must be boolean"),
];

const screenIdValidation = [param("id").isMongoId().withMessage("Invalid screen ID")];

module.exports = {
  screenQueryValidation,
  createScreenValidation,
  updateScreenValidation,
  updateScreenStatusValidation,
  screenIdValidation,
};


