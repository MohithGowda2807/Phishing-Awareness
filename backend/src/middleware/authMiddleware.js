const jwt = require("jsonwebtoken");
const User = require("../models/User");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Admin authorization middleware
async function requireAdmin(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (err) {
    return res.status(500).json({ message: "Authorization error" });
  }
}

// Export both as named exports and the main middleware as default
module.exports = authMiddleware;
module.exports.authenticate = authMiddleware;
module.exports.requireAdmin = requireAdmin;

