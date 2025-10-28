const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Attach req.user if Authorization Bearer token is present and valid; otherwise continue
module.exports = async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate("roles").select("-password");
    if (!user) return next();

    req.user = {
      id: user._id,
      email: user.email,
      role: user.roles && user.roles.length > 0 ? user.roles[0].role_name : "ROLE_USER",
    };
    return next();
  } catch (err) {
    return next();
  }
};


