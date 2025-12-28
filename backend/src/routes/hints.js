const express = require("express");
const router = express.Router();
const llmService = require("../services/llmService");
const Assignment = require("../models/Assignment");
const UserAttempt = require("../models/UserAttempt");

// POST /api/hints/generate - Generate hint for assignment
router.post("/generate", async (req, res, next) => {
  try {
    const { assignmentId, currentQuery, hintLevel = 1 } = req.body;

    // Validate input
    if (!assignmentId) {
      return res.status(400).json({
        success: false,
        error: "Assignment ID is required",
      });
    }

    if (hintLevel < 1 || hintLevel > 3) {
      return res.status(400).json({
        success: false,
        error: "Hint level must be between 1 and 3",
      });
    }

    // Get assignment details
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment || !assignment.isActive) {
      return res.status(404).json({
        success: false,
        error: "Assignment not found",
      });
    }

    // Generate hint using LLM (skip predefined hints)
    const assignmentContext = {
      title: assignment.title,
      difficulty: assignment.difficulty,
      problemStatement: assignment.problemStatement,
      requirements: assignment.requirements,
      constraints: assignment.constraints,
    };

    const hintResult = await llmService.generateHint(
      assignmentContext,
      currentQuery,
      hintLevel
    );

    if (!hintResult.success) {
      return res.status(500).json({
        success: false,
        error: hintResult.error,
        fallbackHint: hintResult.fallbackHint,
      });
    }

    // Track hint usage (skip if user is anonymous)
    const userId = req.headers["x-user-id"] || "anonymous";

    if (userId !== "anonymous") {
      // Update the latest attempt with hint usage
      await UserAttempt.findOneAndUpdate(
        { userId, assignmentId },
        { $inc: { hintsUsed: 1 } },
        { sort: { createdAt: -1 } }
      );
    }

    res.json({
      success: true,
      data: {
        hint: hintResult.hint,
        level: hintLevel,
        source: "llm",
        timestamp: hintResult.timestamp,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/hints/assignment/:id - Get all predefined hints for assignment
router.get("/assignment/:id", async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id).select(
      "hints title difficulty"
    );

    if (!assignment || !assignment.isActive) {
      return res.status(404).json({
        success: false,
        error: "Assignment not found",
      });
    }

    const hints = assignment.hints || [];

    res.json({
      success: true,
      data: {
        assignmentTitle: assignment.title,
        difficulty: assignment.difficulty,
        hints: hints.sort((a, b) => a.level - b.level),
        totalLevels: Math.max(...hints.map((h) => h.level), 0),
      },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid assignment ID",
      });
    }
    next(error);
  }
});

// GET /api/hints/usage/:assignmentId - Get hint usage statistics
router.get("/usage/:assignmentId", async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.headers["x-user-id"] || "anonymous";

    const stats = await UserAttempt.aggregate([
      {
        $match: {
          userId,
          assignmentId: require("mongoose").Types.ObjectId(assignmentId),
        },
      },
      {
        $group: {
          _id: null,
          totalHintsUsed: { $sum: "$hintsUsed" },
          attemptsWithHints: {
            $sum: { $cond: [{ $gt: ["$hintsUsed", 0] }, 1, 0] },
          },
          totalAttempts: { $sum: 1 },
          avgHintsPerAttempt: { $avg: "$hintsUsed" },
        },
      },
    ]);

    const result = stats[0] || {
      totalHintsUsed: 0,
      attemptsWithHints: 0,
      totalAttempts: 0,
      avgHintsPerAttempt: 0,
    };

    res.json({
      success: true,
      data: {
        ...result,
        hintUsageRate:
          result.totalAttempts > 0
            ? ((result.attemptsWithHints / result.totalAttempts) * 100).toFixed(
                1
              )
            : 0,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
