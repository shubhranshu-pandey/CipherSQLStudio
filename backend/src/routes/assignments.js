const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment");
const queryExecutor = require("../services/queryExecutor");

// GET /api/assignments - Get all assignments
router.get("/", async (req, res, next) => {
  try {
    const { difficulty, page = 1, limit = 20 } = req.query;

    const filter = { isActive: true };
    if (difficulty && ["Easy", "Medium", "Hard"].includes(difficulty)) {
      filter.difficulty = difficulty;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const assignments = await Assignment.find(filter)
      .select("title description difficulty tags createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Assignment.countDocuments(filter);

    res.json({
      success: true,
      data: {
        assignments,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          count: assignments.length,
          totalAssignments: total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/assignments/:id - Get specific assignment
router.get("/:id", async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment || !assignment.isActive) {
      return res.status(404).json({
        success: false,
        error: "Assignment not found",
      });
    }

    res.json({
      success: true,
      data: assignment,
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

// GET /api/assignments/:id/sample-data - Get sample data for assignment
router.get("/:id/sample-data", async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment || !assignment.isActive) {
      return res.status(404).json({
        success: false,
        error: "Assignment not found",
      });
    }

    // Get available tables
    const tablesResult = await queryExecutor.getAvailableTables();

    if (!tablesResult.success) {
      return res.status(500).json({
        success: false,
        error: "Unable to fetch table information",
      });
    }

    // Get schema and sample data for each table
    const tableData = [];

    for (const tableName of tablesResult.tables) {
      const [schemaResult, sampleResult] = await Promise.all([
        queryExecutor.getTableSchema(tableName),
        queryExecutor.getSampleData(tableName, 5),
      ]);

      if (schemaResult.success && sampleResult.success) {
        tableData.push({
          tableName,
          schema: schemaResult.schema,
          sampleRows: sampleResult.data,
          rowCount: sampleResult.rowCount,
        });
      }
    }

    // Format sampleTables for frontend (handle both old and new schema)
    const formattedSampleTables = (assignment.sampleTables || []).map((table) => {
      // New schema format
      if (table.columns && Array.isArray(table.columns)) {
        return {
          tableName: table.tableName,
          schema: table.columns.map((col) => ({
            columnName: col.columnName,
            dataType: col.dataType,
            constraints: col.constraints || [],
          })),
          sampleRows: table.rows || [],
        };
      }
      // Old schema format (backward compatibility)
      return {
        tableName: table.tableName,
        schema: table.schema || [],
        sampleRows: [],
      };
    });

    res.json({
      success: true,
      data: {
        tables: tableData,
        assignmentTables: formattedSampleTables,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/assignments/difficulty/:level - Get assignments by difficulty
router.get("/difficulty/:level", async (req, res, next) => {
  try {
    const { level } = req.params;

    if (!["Easy", "Medium", "Hard"].includes(level)) {
      return res.status(400).json({
        success: false,
        error: "Invalid difficulty level. Must be Easy, Medium, or Hard",
      });
    }

    const assignments = await Assignment.find({
      difficulty: level,
      isActive: true,
    })
      .select("title description difficulty tags createdAt")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        assignments,
        difficulty: level,
        count: assignments.length,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
