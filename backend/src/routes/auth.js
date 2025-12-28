const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { generateToken, authenticate } = require("../middlewares/auth");
const { body, validationResult } = require("express-validator");

// Validation middleware
const validateSignup = [
  body("username")
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username must be 3-30 characters and contain only letters, numbers, and underscores"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("firstName")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("First name must be less than 50 characters"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Last name must be less than 50 characters"),
];

const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

// POST /api/auth/signup - Register new user
router.post("/signup", validateSignup, async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { username, email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: existingUser.email === email 
          ? "Email already registered" 
          : "Username already taken",
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      firstName,
      lastName,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Return user data (without password)
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt,
        },
        token,
      },
      message: "User registered successfully",
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login - Login user
router.post("/login", validateLogin, async (req, res, next) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Return user data (without password)
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt,
        },
        token,
      },
      message: "Login successful",
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me - Get current user
router.get("/me", authenticate, async (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        createdAt: req.user.createdAt,
      },
    },
  });
});

module.exports = router;

