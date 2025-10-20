const { body, param } = require("express-validator");

// Validation for updating user profile
const updateProfileValidation = [
  param("id").isMongoId().withMessage("Invalid user ID"),
  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("First name must be between 1 and 100 characters")
    .trim(),
  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Last name must be between 1 and 100 characters")
    .trim(),
  body("phone")
    .optional()
    .matches(/^(03|05|07|08|09)[0-9]{8}$/)
    .withMessage("Invalid phone number format"),
  body("address")
    .notEmpty()
    .withMessage("Address is required")
    .isString()
    .withMessage("Address must be a string")
    .trim(),
];

// Validation for updating user avatar
const updateAvatarValidation = [
  param("id").isMongoId().withMessage("Invalid user ID"),
];

// Validation for changing user password
const changePasswordValidation = [
  param("id").isMongoId().withMessage("Invalid user ID"),
  body("oldPassword")
    .notEmpty()
    .withMessage("Old password is required")
    .isString()
    .withMessage("Old password must be a string"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6, max: 255 })
    .withMessage("Password must be between 6 and 255 characters")
    .isString()
    .withMessage("New password must be a string"),
  body("confirmNewPassword")
    .notEmpty()
    .withMessage("Confirm new password is required")
    .isLength({ min: 6, max: 255 })
    .withMessage("Confirm password must be between 6 and 255 characters")
    .isString()
    .withMessage("Confirm password must be a string")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("New password and confirm password do not match");
      }
      return true;
    }),
];

// Validation for user ID parameter
const userIdValidation = [
  param("id").isMongoId().withMessage("Invalid user ID"),
];

module.exports = {
  updateProfileValidation,
  updateAvatarValidation,
  changePasswordValidation,
  userIdValidation,
};
