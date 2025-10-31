const { body, param, query } = require("express-validator");

const screenQueryValidation = [
  query("page").optional().isInt({ min: 0 }).withMessage("Page must be a non-negative integer"),
  query("pageSize").optional().isInt({ min: 1, max: 100 }).withMessage("Page size must be between 1 and 100"),
  query("sortField")
    .optional()
    .isIn(["createdAt", "updatedAt", "name", "seatCapacity"])
    .withMessage("Invalid sort field"),
  query("sortOrder").optional().isIn(["asc", "desc"]).withMessage("Sort order must be 'asc' or 'desc'"),
  query("search").optional().isString().withMessage("Search must be a string"),
];

const checkSeatVsRowsColumns = (seatCapacityField, maxRowsField, maxColumnsField) =>
  body(seatCapacityField).custom((seatCapacity, { req }) => {
    // Lấy giá trị maxRows và maxColumns
    const maxRows = req.body[maxRowsField];
    const maxColumns = req.body[maxColumnsField];
    // Chỉ kiểm tra ràng buộc nếu cả 3 trường cùng tồn tại
    if (
      seatCapacity !== undefined &&
      maxRows !== undefined &&
      maxColumns !== undefined &&
      Number.isInteger(Number(seatCapacity)) &&
      Number.isInteger(Number(maxRows)) &&
      Number.isInteger(Number(maxColumns))
    ) {
      if (Number(seatCapacity) > Number(maxRows) * Number(maxColumns)) {
        throw new Error(
          `Seat capacity (${seatCapacity}) cannot be greater than max_rows * max_columns (${Number(maxRows) * Number(maxColumns)})`
        );
      }
    }
    return true;
  });

const createScreenValidation = [
  body("name")
    .notEmpty().withMessage("Name is required")
    .isLength({ max: 100 }).withMessage("Name must be at most 100 characters"),
  body("theaterId")
    .notEmpty().withMessage("Theater ID is required")
    .isMongoId().withMessage("Invalid theater ID"),
  body("seatCapacity")
    .notEmpty().withMessage("Seat capacity is required")
    .isInt({ min: 51, max: 249 }).withMessage("Seat capacity must be greater than 50 and less than 250"),
  body("maxRows")
    .notEmpty().withMessage("Max rows is required")
    .isInt({ min: 5 }).withMessage("Max rows must be at least 5")
    .custom(val => val % 2 === 0).withMessage("Max rows must be an even number"),
  body("maxColumns")
    .notEmpty().withMessage("Max columns is required")
    .isInt({ min: 5 }).withMessage("Max columns must be at least 5")
    .custom(val => val % 2 === 0).withMessage("Max columns must be an even number"),
  checkSeatVsRowsColumns("seatCapacity", "maxRows", "maxColumns"),
  body("seatLayout").optional().isArray().withMessage("Seat layout must be an array"),
];

const updateScreenValidation = [
  param("id").isMongoId().withMessage("Invalid screen ID"),
  body("name").optional().isLength({ max: 100 }).withMessage("Name must be at most 100 characters"),
  body("theaterId").optional().isMongoId().withMessage("Invalid theater ID"),
  body("seatCapacity").optional().isInt({ min: 51, max: 249 }).withMessage("Seat capacity must be greater than 50 and less than 250"),
  body("maxRows").optional().isInt({ min: 5 }).withMessage("Max rows must be at least 5")
    .custom(val => (val === undefined ? true : val % 2 === 0)).withMessage("Max rows must be an even number"),
  body("maxColumns").optional().isInt({ min: 5 }).withMessage("Max columns must be at least 5")
    .custom(val => (val === undefined ? true : val % 2 === 0)).withMessage("Max columns must be an even number"),
  checkSeatVsRowsColumns("seatCapacity", "maxRows", "maxColumns"),
  body("seatLayout").optional().isArray().withMessage("Seat layout must be an array"),
];

const screenIdValidation = [param("id").isMongoId().withMessage("Invalid screen ID")];

module.exports = {
  screenQueryValidation,
  createScreenValidation,
  updateScreenValidation,
  screenIdValidation,
};


