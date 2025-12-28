const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Database and route imports
const { connectDB } = require("./config/database");
const assignmentRoutes = require("./routes/assignments");
const queryRoutes = require("./routes/queries");
const hintRoutes = require("./routes/hints");
const authRoutes = require("./routes/auth");
const progressRoutes = require("./routes/progress");
const errorHandler = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to databases
connectDB();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-frontend-domain.com"]
        : ["http://localhost:3002"],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use("/api/", limiter);

// Logging
app.use(morgan("combined"));

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/hints", hintRoutes);
app.use("/api/progress", progressRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    service: "CipherSQLStudio Backend",
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`CipherSQLStudio Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
