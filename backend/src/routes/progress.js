const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { authenticate } = require("../middlewares/auth");
const UserProgress = require("../models/UserProgress");
const UserAttempt = require("../models/UserAttempt");
const Assignment = require("../models/Assignment");

// GET /api/progress - Get all progress for current user
router.get("/", authenticate, async (req, res, next) => {
  try {
    const progress = await UserProgress.find({ userId: req.userId })
      .populate("assignmentId", "title description difficulty tags")
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: {
        progress,
        total: progress.length,
        completed: progress.filter((p) => p.status === "completed").length,
        inProgress: progress.filter((p) => p.status === "in_progress").length,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/progress/:assignmentId - Get progress for specific assignment
router.get("/:assignmentId", authenticate, async (req, res, next) => {
  try {
    const { assignmentId } = req.params;

    let progress = await UserProgress.findOne({
      userId: req.userId,
      assignmentId,
    }).populate("assignmentId", "title description difficulty tags");

    // If no progress exists, create one
    if (!progress) {
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) {
        return res.status(404).json({
          success: false,
          error: "Assignment not found",
        });
      }

      progress = new UserProgress({
        userId: req.userId,
        assignmentId,
        status: "not_started",
      });
      await progress.save();
      await progress.populate("assignmentId", "title description difficulty tags");
    }

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/progress/stats/overview - Get overall statistics
router.get("/stats/overview", authenticate, async (req, res, next) => {
  try {
    const stats = await UserProgress.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(req.userId) },
      },
      {
        $group: {
          _id: null,
          totalAssignments: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] },
          },
          notStarted: {
            $sum: { $cond: [{ $eq: ["$status", "not_started"] }, 1, 0] },
          },
          totalAttempts: { $sum: "$totalAttempts" },
          successfulAttempts: { $sum: "$successfulAttempts" },
          totalHintsUsed: { $sum: "$hintsUsed" },
        },
      },
    ]);

    const attemptStats = await UserAttempt.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(req.userId) },
      },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          successfulAttempts: {
            $sum: { $cond: ["$isCorrect", 1, 0] },
          },
          avgExecutionTime: { $avg: "$executionTime" },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        progress: stats[0] || {
          totalAssignments: 0,
          completed: 0,
          inProgress: 0,
          notStarted: 0,
          totalAttempts: 0,
          successfulAttempts: 0,
          totalHintsUsed: 0,
        },
        attempts: attemptStats[0] || {
          totalAttempts: 0,
          successfulAttempts: 0,
          avgExecutionTime: 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/progress/:assignmentId/update - Update progress (called after query execution)
router.post("/:assignmentId/update", authenticate, async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const { isCorrect, executionTime, hintsUsed } = req.body;

    // Get or create progress
    let progress = await UserProgress.findOne({
      userId: req.userId,
      assignmentId,
    });

    if (!progress) {
      progress = new UserProgress({
        userId: req.userId,
        assignmentId,
        status: "in_progress",
      });
    }

    // Update progress
    progress.totalAttempts += 1;
    progress.lastAttemptAt = new Date();

    if (isCorrect) {
      progress.successfulAttempts += 1;
      if (!progress.bestExecutionTime || executionTime < progress.bestExecutionTime) {
        progress.bestExecutionTime = executionTime;
      }
      if (progress.status !== "completed") {
        progress.status = "completed";
        progress.completedAt = new Date();
      }
    } else if (progress.status === "not_started") {
      progress.status = "in_progress";
    }

    if (hintsUsed) {
      progress.hintsUsed = (progress.hintsUsed || 0) + hintsUsed;
    }

    await progress.save();

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

