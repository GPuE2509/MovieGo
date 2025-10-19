// Role-based middleware
const { authorize } = require("./auth");

// Predefined role middlewares
const requireAdmin = authorize("ROLE_ADMIN");
const requireUser = authorize("ROLE_USER");
const requireModerator = authorize("ROLE_MODERATOR");

// Custom role middleware factory
const requireRole = (role) => authorize(role);

// Multiple roles middleware
const requireAnyRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Please login first.",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }

    next();
  };
};

module.exports = {
  requireAdmin,
  requireUser,
  requireModerator,
  requireRole,
  requireAnyRole,
};
