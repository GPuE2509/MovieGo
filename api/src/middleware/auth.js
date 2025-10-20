const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id)
      .populate("roles")
      .select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Token is not valid.",
      });
    }

    // Add role information to req.user
    req.user = {
      id: user._id,
      email: user.email,
      role:
        user.roles && user.roles.length > 0
          ? user.roles[0].role_name
          : "ROLE_USER",
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token is not valid.",
    });
  }
};

const authorize = (...roles) => {
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

// Middleware to check if the user has ADMIN role
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "ROLE_ADMIN") {
    next();
  } else {
    res.status(403).json({
      status: "ERROR",
      code: 403,
      data: null,
      message: "Access denied. Admin role required.",
    });
  }
};

// Middleware to check if the user has USER role
const userMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "ROLE_USER") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Access denied. User role required.",
    });
  }
};

module.exports = {
  auth,
  authorize,
  adminMiddleware,
  userMiddleware,
};
