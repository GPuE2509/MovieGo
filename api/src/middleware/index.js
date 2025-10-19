// Middleware exports
const { auth, authorize, adminMiddleware } = require("./auth");
const {
  requireAdmin,
  requireUser,
  requireModerator,
  requireRole,
  requireAnyRole,
} = require("./role");

module.exports = {
  // Auth middleware
  auth,
  authorize,
  adminMiddleware,

  // Role middleware
  requireAdmin,
  requireUser,
  requireModerator,
  requireRole,
  requireAnyRole,
};
