const mongoose = require("mongoose");

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Assignment",
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ["not_started", "in_progress", "completed"],
    default: "not_started",
  },
  completedAt: {
    type: Date,
    default: null,
  },
  totalAttempts: {
    type: Number,
    default: 0,
  },
  successfulAttempts: {
    type: Number,
    default: 0,
  },
  bestExecutionTime: {
    type: Number, // milliseconds
    default: null,
  },
  hintsUsed: {
    type: Number,
    default: 0,
  },
  lastAttemptAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Ensure one progress record per user-assignment combination
userProgressSchema.index({ userId: 1, assignmentId: 1 }, { unique: true });
userProgressSchema.index({ userId: 1, status: 1 });
userProgressSchema.index({ completedAt: -1 });

// Update updatedAt before saving
userProgressSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("UserProgress", userProgressSchema);

