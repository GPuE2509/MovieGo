const { body } = require("express-validator");

const createShowtimeValidation = [
  body("screen_id")
    .notEmpty().withMessage("Screen ID is required")
    .isMongoId().withMessage("Invalid screen ID"),
  body("movie_id")
    .notEmpty().withMessage("Movie ID is required")
    .isMongoId().withMessage("Invalid movie ID"),
  body("start_time")
    .notEmpty().withMessage("Start time is required")
    .isISO8601().withMessage("Start time must be a valid ISO date")
    .custom((value) => {
      const dt = new Date(value);
      if (isNaN(dt.getTime())) throw new Error("Start time must be a valid date");
      if (dt <= new Date()) throw new Error("Start time must be in the future");
      return true;
    }),
  body("end_time")
    .notEmpty().withMessage("End time is required")
    .isISO8601().withMessage("End time must be a valid ISO date")
    .custom((value, { req }) => {
      const end = new Date(value);
      const start = new Date(req.body.start_time);
      if (isNaN(end.getTime())) throw new Error("End time must be a valid date");
      if (end <= new Date()) throw new Error("End time must be in the future");
      if (!isNaN(start.getTime()) && end <= start) throw new Error("End time must be after start time");
      return true;
    }),
];

module.exports = { createShowtimeValidation };
