const mongoose = require("mongoose");

const userAttemptSchema = new mongoose.Schema({
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
  sqlQuery: {
    type: String,
    required: true,
    trim: true,
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
  executionTime: {
    type: Number, // milliseconds
    default: 0,
  },
  resultRows: {
    type: Number,
    default: 0,
  },
  errorMessage: {
    type: String,
    default: null,
  },
  hintsUsed: {
    type: Number,
    default: 0,
  },
  attemptNumber: {
    type: Number,
    required: true,
    min: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userAttemptSchema.index({ userId: 1, assignmentId: 1 });
userAttemptSchema.index({ createdAt: -1 });
userAttemptSchema.index({ isCorrect: 1 });

module.exports = mongoose.model("UserAttempt", userAttemptSchema);
