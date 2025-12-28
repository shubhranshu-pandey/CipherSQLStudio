const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { validateSQLQuery } = require("../middlewares/validateQuery");
const { optionalAuth } = require("../middlewares/auth");
const queryExecutor = require("../services/queryExecutor");
const resultEvaluator = require("../services/resultEvaluator");
const Assignment = require("../models/Assignment");
const UserAttempt = require("../models/UserAttempt");
const UserProgress = require("../models/UserProgress");

// POST /api/queries/execute - Execute SQL query
router.post("/execute", optionalAuth, validateSQLQuery, async (req, res, next) => {
  try {
    const { query, assignmentId } = req.validatedQuery;

    // Verify assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment || !assignment.isActive) {
      return res.status(404).json({
        success: false,
        error: "Assignment not found",
      });
    }

    // Execute the query
    const result = await queryExecutor.executeQuery(query, assignmentId);

    // Evaluate result against expected output if assignment has expectedOutput
    let evaluationResult = null;
    let isCorrect = false;

    if (result.success) {
      // Check if expectedOutput exists and is valid
      const expectedOutput = assignment.get ? assignment.get('expectedOutput') : assignment.expectedOutput;
      if (expectedOutput && expectedOutput.type) {
        evaluationResult = resultEvaluator.evaluate(
          expectedOutput,
          result.data
        );
        isCorrect = evaluationResult.isCorrect;
      } else {
        // Fallback: if no expectedOutput, use old logic (rowCount > 0)
        isCorrect = result.data?.rowCount > 0;
      }
    }

    // Use authenticated user ID or fallback to anonymous
    const userId = req.userId || null;
    
    // Only save attempts for authenticated users
    let attempt = null;
    if (userId) {
      // Get attempt number for this user and assignment
      const attemptCount = await UserAttempt.countDocuments({
        userId,
        assignmentId,
      });

      // Save attempt to database
      attempt = new UserAttempt({
        userId,
        assignmentId,
        sqlQuery: query,
        isCorrect: isCorrect,
        executionTime: result.success
          ? result.data.executionTime
          : result.error?.executionTime || 0,
        resultRows: result.success ? result.data.rowCount : 0,
        errorMessage: result.success ? null : result.error?.message,
        attemptNumber: attemptCount + 1,
      });

      await attempt.save();

      // Update user progress
      let progress = await UserProgress.findOne({
        userId,
        assignmentId,
      });

      if (!progress) {
        progress = new UserProgress({
          userId,
          assignmentId,
          status: "in_progress",
        });
      }

      progress.totalAttempts += 1;
      progress.lastAttemptAt = new Date();

      if (isCorrect) {
        progress.successfulAttempts += 1;
        if (!progress.bestExecutionTime || result.data.executionTime < progress.bestExecutionTime) {
          progress.bestExecutionTime = result.data.executionTime;
        }
        if (progress.status !== "completed") {
          progress.status = "completed";
          progress.completedAt = new Date();
        }
      } else if (progress.status === "not_started") {
        progress.status = "in_progress";
      }

      await progress.save();
    }

    if (result.success) {
      res.json({
        success: true,
        data: {
          ...result.data,
          attemptId: attempt?._id,
          attemptNumber: attempt?.attemptNumber,
          isCorrect: isCorrect,
          evaluation: evaluationResult || undefined,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error.message,
        details: {
          code: result.error.code,
          executionTime: result.error.executionTime,
          attemptId: attempt?._id,
          attemptNumber: attempt?.attemptNumber,
          // Include processed query in development mode
          ...(process.env.NODE_ENV === 'development' && result.error.processedQuery && {
            processedQuery: result.error.processedQuery,
            originalError: result.error.originalError,
          }),
        },
      });
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/queries/attempts/:assignmentId - Get user attempts for assignment
router.get("/attempts/:assignmentId", optionalAuth, async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.userId;
    const { limit = 10 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Please login to view your attempts",
      });
    }

    const attempts = await UserAttempt.find({
      userId,
      assignmentId,
    })
      .select(
        "sqlQuery isCorrect executionTime resultRows errorMessage attemptNumber createdAt"
      )
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const stats = await UserAttempt.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          assignmentId: new mongoose.Types.ObjectId(assignmentId),
        },
      },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          successfulAttempts: { $sum: { $cond: ["$isCorrect", 1, 0] } },
          avgExecutionTime: { $avg: "$executionTime" },
          bestExecutionTime: {
            $min: { $cond: ["$isCorrect", "$executionTime", null] },
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        attempts,
        statistics: stats[0] || {
          totalAttempts: 0,
          successfulAttempts: 0,
          avgExecutionTime: 0,
          bestExecutionTime: null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/queries/validate - Validate SQL query without execution
router.post("/validate", validateSQLQuery, async (req, res, next) => {
  try {
    const { query } = req.validatedQuery;

    // Basic syntax validation (this is a simplified version)
    const syntaxChecks = {
      hasSelect: /^\s*SELECT/i.test(query),
      hasFrom: /\bFROM\b/i.test(query),
      balancedParentheses:
        (query.match(/\(/g) || []).length === (query.match(/\)/g) || []).length,
      noSemicolonAtEnd: !query.trim().endsWith(";"),
    };

    const isValid = Object.values(syntaxChecks).every((check) => check);

    res.json({
      success: true,
      data: {
        isValid,
        checks: syntaxChecks,
        suggestions: isValid
          ? []
          : [
              !syntaxChecks.hasSelect && "Query should start with SELECT",
              !syntaxChecks.hasFrom && "Query should include FROM clause",
              !syntaxChecks.balancedParentheses && "Check parentheses balance",
              !syntaxChecks.noSemicolonAtEnd && "Remove semicolon at the end",
            ].filter(Boolean),
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
