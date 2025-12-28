const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Default error
  let error = {
    message: err.message || "Internal Server Error",
    status: err.status || 500,
  };

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = {
      message: `Validation Error: ${messages.join(", ")}`,
      status: 400,
    };
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = {
      message: `Duplicate value for field: ${field}`,
      status: 400,
    };
  }

  // PostgreSQL errors
  if (err.code && err.code.startsWith("42")) {
    error = {
      message: "SQL syntax error or invalid query",
      status: 400,
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = {
      message: "Invalid token",
      status: 401,
    };
  }

  if (err.name === "TokenExpiredError") {
    error = {
      message: "Token expired",
      status: 401,
    };
  }

  res.status(error.status).json({
    success: false,
    error: error.message,
    ...(error.details && { details: error.details }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
