const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to verify JWT token
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "No token provided. Please login first.",
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.userId).select("-password");
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found. Token is invalid.",
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id.toString();
    
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Invalid token. Please login again.",
      });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired. Please login again.",
      });
    }
    next(error);
  }
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      req.user = null;
      req.userId = null;
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    
    req.user = user || null;
    req.userId = user ? user._id.toString() : null;
    
    next();
  } catch (error) {
    // If token is invalid, just continue without user
    req.user = null;
    req.userId = null;
    next();
  }
};

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

module.exports = {
  authenticate,
  optionalAuth,
  generateToken,
};

