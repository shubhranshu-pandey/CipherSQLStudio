/**
 * Assignment Ingestion & Validation Script
 * 
 * Validates and seeds assignments into MongoDB following the strict schema.
 * This script ensures:
 * - Schema compliance
 * - Data integrity
 * - No solution leakage
 */

const mongoose = require("mongoose");
const Assignment = require("../models/Assignment");
require("dotenv").config();

/**
 * Validate assignment schema
 */
function validateAssignment(assignment) {
  const errors = [];

  // Required fields
  if (!assignment.title || typeof assignment.title !== "string") {
    errors.push("title is required and must be a string");
  }

  if (!assignment.description || typeof assignment.description !== "string") {
    errors.push("description is required and must be a string");
  }

  if (!assignment.difficulty || !["Easy", "Medium", "Hard"].includes(assignment.difficulty)) {
    errors.push("difficulty is required and must be 'Easy', 'Medium', or 'Hard'");
  }

  if (!assignment.question && !assignment.problemStatement) {
    errors.push("question or problemStatement is required");
  }

  // Validate sampleTables
  if (!Array.isArray(assignment.sampleTables)) {
    errors.push("sampleTables must be an array");
  } else {
    assignment.sampleTables.forEach((table, index) => {
      if (!table.tableName || typeof table.tableName !== "string") {
        errors.push(`sampleTables[${index}].tableName is required and must be a string`);
      }

      if (!Array.isArray(table.columns)) {
        errors.push(`sampleTables[${index}].columns must be an array`);
      } else {
        table.columns.forEach((col, colIndex) => {
          if (!col.columnName || typeof col.columnName !== "string") {
            errors.push(`sampleTables[${index}].columns[${colIndex}].columnName is required`);
          }
          if (!col.dataType || typeof col.dataType !== "string") {
            errors.push(`sampleTables[${index}].columns[${colIndex}].dataType is required`);
          }
        });
      }

      // Validate rows match columns
      if (Array.isArray(table.rows)) {
        table.rows.forEach((row, rowIndex) => {
          if (typeof row !== "object" || row === null) {
            errors.push(`sampleTables[${index}].rows[${rowIndex}] must be an object`);
          } else {
            // Check if row keys match column names
            const rowKeys = Object.keys(row).map((k) => k.toLowerCase());
            const columnNames = table.columns.map((c) => c.columnName.toLowerCase());
            
            rowKeys.forEach((key) => {
              if (!columnNames.includes(key)) {
                errors.push(
                  `sampleTables[${index}].rows[${rowIndex}] has key '${key}' that doesn't match any column`
                );
              }
            });
          }
        });
      }
    });
  }

  // Validate expectedOutput
  if (!assignment.expectedOutput) {
    errors.push("expectedOutput is required");
  } else {
    const { type, value } = assignment.expectedOutput;

    if (!type || !["table", "single_value", "column", "count"].includes(type)) {
      errors.push("expectedOutput.type must be one of: 'table', 'single_value', 'column', 'count'");
    }

    if (value === undefined || value === null) {
      errors.push("expectedOutput.value is required");
    } else {
      // Type-specific validation
      if (type === "table" && !Array.isArray(value)) {
        errors.push("expectedOutput.value must be an array for type 'table'");
      } else if (type === "column" && !Array.isArray(value)) {
        errors.push("expectedOutput.value must be an array for type 'column'");
      } else if (type === "count" && typeof value !== "number") {
        errors.push("expectedOutput.value must be a number for type 'count'");
      }
    }
  }

  // Validate table names consistency
  if (assignment.question || assignment.problemStatement) {
    const questionText = (assignment.question || assignment.problemStatement).toLowerCase();
    assignment.sampleTables.forEach((table) => {
      if (!questionText.includes(table.tableName.toLowerCase())) {
        // Warning, not error - table might be referenced differently
        console.warn(
          `Warning: Table '${table.tableName}' may not be mentioned in question`
        );
      }
    });
  }

  return errors;
}

/**
 * Normalize assignment data for insertion
 */
function normalizeAssignment(assignment) {
  return {
    title: assignment.title.trim(),
    description: assignment.description.trim(),
    difficulty: assignment.difficulty,
    question: assignment.question || assignment.problemStatement || "",
    problemStatement: assignment.problemStatement || assignment.question || "",
    sampleTables: assignment.sampleTables.map((table) => ({
      tableName: table.tableName.trim(),
      columns: table.columns.map((col) => ({
        columnName: col.columnName.trim(),
        dataType: col.dataType.trim(),
      })),
      rows: table.rows || [],
    })),
    expectedOutput: {
      type: assignment.expectedOutput.type,
      value: assignment.expectedOutput.value,
    },
    tags: assignment.tags || [],
    isActive: assignment.isActive !== false, // Default to true
    createdAt: assignment.createdAt ? new Date(assignment.createdAt) : new Date(),
    updatedAt: new Date(),
  };
}

/**
 * Main function to validate and seed assignments
 */
async function validateAndSeedAssignments(assignmentsArray) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    if (!Array.isArray(assignmentsArray)) {
      throw new Error("Input must be an array of assignments");
    }

    const results = {
      validated: [],
      errors: [],
      inserted: [],
      skipped: [],
    };

    // Validate each assignment
    for (let i = 0; i < assignmentsArray.length; i++) {
      const assignment = assignmentsArray[i];
      console.log(`\n📋 Validating assignment ${i + 1}: ${assignment.title || "Untitled"}`);

      const errors = validateAssignment(assignment);

      if (errors.length > 0) {
        console.error(`❌ Validation failed for assignment ${i + 1}:`);
        errors.forEach((error) => console.error(`   - ${error}`));
        results.errors.push({
          index: i,
          assignment: assignment.title || "Untitled",
          errors,
        });
        continue;
      }

      console.log(`✅ Assignment ${i + 1} validated successfully`);
      results.validated.push(i);

      // Normalize and prepare for insertion
      const normalized = normalizeAssignment(assignment);

      // Check if assignment already exists (by title)
      const existing = await Assignment.findOne({ title: normalized.title });

      if (existing) {
        console.log(`⏭️  Assignment "${normalized.title}" already exists, skipping...`);
        results.skipped.push({
          index: i,
          title: normalized.title,
          existingId: existing._id,
        });
        continue;
      }

      // Insert assignment
      try {
        const inserted = await Assignment.create(normalized);
        console.log(`✅ Inserted assignment: ${inserted.title} (ID: ${inserted._id})`);
        results.inserted.push({
          index: i,
          title: inserted.title,
          id: inserted._id,
        });
      } catch (insertError) {
        console.error(`❌ Failed to insert assignment ${i + 1}:`, insertError.message);
        results.errors.push({
          index: i,
          assignment: normalized.title,
          errors: [insertError.message],
        });
      }
    }

    // Print summary
    console.log("\n" + "=".repeat(60));
    console.log("📊 VALIDATION & SEEDING SUMMARY");
    console.log("=".repeat(60));
    console.log(`✅ Validated: ${results.validated.length}`);
    console.log(`✅ Inserted: ${results.inserted.length}`);
    console.log(`⏭️  Skipped: ${results.skipped.length}`);
    console.log(`❌ Errors: ${results.errors.length}`);

    if (results.errors.length > 0) {
      console.log("\n❌ ERRORS:");
      results.errors.forEach((error) => {
        console.log(`   Assignment ${error.index + 1} (${error.assignment}):`);
        error.errors.forEach((err) => console.log(`     - ${err}`));
      });
      process.exit(1);
    }

    if (results.validated.length === assignmentsArray.length && results.inserted.length > 0) {
      console.log("\n✅ All assignments validated and ready for insertion!");
      process.exit(0);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// If run directly, expect JSON input
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("Usage: node validateAndSeedAssignments.js <assignments.json>");
    console.error("   OR: node validateAndSeedAssignments.js --json '<JSON_ARRAY>'");
    process.exit(1);
  }

  let assignmentsArray;

  if (args[0] === "--json") {
    // Parse JSON from command line
    try {
      assignmentsArray = JSON.parse(args[1]);
    } catch (error) {
      console.error("❌ Invalid JSON:", error.message);
      process.exit(1);
    }
  } else {
    // Read from file
    const fs = require("fs");
    const path = require("path");
    const filePath = path.resolve(args[0]);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }

    try {
      const fileContent = fs.readFileSync(filePath, "utf8");
      assignmentsArray = JSON.parse(fileContent);
    } catch (error) {
      console.error(`❌ Error reading/parsing file: ${error.message}`);
      process.exit(1);
    }
  }

  validateAndSeedAssignments(assignmentsArray);
}

module.exports = { validateAssignment, normalizeAssignment, validateAndSeedAssignments };

