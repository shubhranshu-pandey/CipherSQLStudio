/**
 * SQL Result Evaluation Engine
 * 
 * Compares user's SQL query result against expected output
 * WITHOUT leaking solutions or generating SQL queries
 */

class ResultEvaluator {
  /**
   * Evaluate user result against expected output
   * @param {Object} expectedOutput - { type: string, value: any }
   * @param {Object} userResult - { rows: Array, rowCount: number, fields: Array }
   * @returns {Object} - { isCorrect: boolean, reason?: string }
   */
  evaluate(expectedOutput, userResult) {
    if (!expectedOutput || !expectedOutput.type) {
      return {
        isCorrect: false,
        reason: "Expected output configuration is missing",
      };
    }

    if (!userResult || !userResult.rows) {
      return {
        isCorrect: false,
        reason: "Query execution failed or returned no results",
      };
    }

    const { type, value: expectedValue } = expectedOutput;
    const { rows, rowCount } = userResult;

    try {
      switch (type) {
        case "table":
          return this.evaluateTable(expectedValue, rows, rowCount);
        case "single_value":
          return this.evaluateSingleValue(expectedValue, rows, rowCount);
        case "column":
          return this.evaluateColumn(expectedValue, rows, rowCount);
        case "count":
          return this.evaluateCount(expectedValue, rows, rowCount);
        default:
          return {
            isCorrect: false,
            reason: `Unknown expected output type: ${type}`,
          };
      }
    } catch (error) {
      return {
        isCorrect: false,
        reason: `Evaluation error: ${error.message}`,
      };
    }
  }

  /**
   * Evaluate table result (order-insensitive row comparison)
   */
  evaluateTable(expectedRows, userRows, userRowCount) {
    if (!Array.isArray(expectedRows)) {
      return {
        isCorrect: false,
        reason: "Expected output must be an array of rows",
      };
    }

    const expectedCount = expectedRows.length;

    // Check row count
    if (userRowCount !== expectedCount) {
      return {
        isCorrect: false,
        reason: `Expected ${expectedCount} row(s), but got ${userRowCount}`,
      };
    }

    if (expectedCount === 0) {
      return { isCorrect: userRowCount === 0 };
    }

    // Normalize rows for comparison (convert to comparable format)
    const normalizedExpected = this.normalizeRows(expectedRows);
    const normalizedUser = this.normalizeRows(userRows);

    // Check if all expected rows exist in user result (order-insensitive)
    const missingRows = [];
    const extraRows = [];

    // Create a map of expected rows for efficient lookup
    const expectedMap = new Map();
    normalizedExpected.forEach((row, index) => {
      const key = this.getRowKey(row);
      if (!expectedMap.has(key)) {
        expectedMap.set(key, []);
      }
      expectedMap.get(key).push(index);
    });

    // Track which expected rows have been matched
    const matchedExpected = new Set();
    const userRowMatches = new Map();

    // Try to match each user row to an expected row
    normalizedUser.forEach((userRow, userIndex) => {
      const userKey = this.getRowKey(userRow);
      let matched = false;

      if (expectedMap.has(userKey)) {
        const expectedIndices = expectedMap.get(userKey);
        for (const expectedIndex of expectedIndices) {
          if (!matchedExpected.has(expectedIndex)) {
            const expectedRow = normalizedExpected[expectedIndex];
            if (this.rowsEqual(userRow, expectedRow)) {
              matchedExpected.add(expectedIndex);
              userRowMatches.set(userIndex, expectedIndex);
              matched = true;
              break;
            }
          }
        }
      }

      if (!matched) {
        extraRows.push(userIndex);
      }
    });

    // Find missing expected rows
    normalizedExpected.forEach((expectedRow, expectedIndex) => {
      if (!matchedExpected.has(expectedIndex)) {
        missingRows.push(expectedIndex);
      }
    });

    if (missingRows.length > 0 || extraRows.length > 0) {
      let reason = "";
      if (missingRows.length > 0) {
        reason += `Missing ${missingRows.length} expected row(s). `;
      }
      if (extraRows.length > 0) {
        reason += `Found ${extraRows.length} unexpected row(s).`;
      }
      return {
        isCorrect: false,
        reason: reason.trim(),
      };
    }

    return { isCorrect: true };
  }

  /**
   * Evaluate single value result
   */
  evaluateSingleValue(expectedValue, userRows, userRowCount) {
    if (userRowCount !== 1) {
      return {
        isCorrect: false,
        reason: `Expected exactly 1 row, but got ${userRowCount}`,
      };
    }

    const userRow = userRows[0];
    const userValue = this.extractSingleValue(userRow);

    if (this.valuesEqual(expectedValue, userValue)) {
      return { isCorrect: true };
    }

    return {
      isCorrect: false,
      reason: `Expected value does not match the result`,
    };
  }

  /**
   * Evaluate column result (order-insensitive)
   */
  evaluateColumn(expectedColumn, userRows, userRowCount) {
    if (!Array.isArray(expectedColumn)) {
      return {
        isCorrect: false,
        reason: "Expected output must be an array for column type",
      };
    }

    if (userRowCount !== expectedColumn.length) {
      return {
        isCorrect: false,
        reason: `Expected ${expectedColumn.length} value(s), but got ${userRowCount}`,
      };
    }

    // Extract values from user rows (assuming single column)
    const userValues = userRows.map((row) => this.extractSingleValue(row));

    // Normalize and compare (order-insensitive)
    const normalizedExpected = expectedColumn.map((v) => this.normalizeValue(v)).sort();
    const normalizedUser = userValues.map((v) => this.normalizeValue(v)).sort();

    if (normalizedExpected.length !== normalizedUser.length) {
      return {
        isCorrect: false,
        reason: "Column values do not match",
      };
    }

    for (let i = 0; i < normalizedExpected.length; i++) {
      if (!this.valuesEqual(normalizedExpected[i], normalizedUser[i])) {
        return {
          isCorrect: false,
          reason: "Column values do not match",
        };
      }
    }

    return { isCorrect: true };
  }

  /**
   * Evaluate count result
   */
  evaluateCount(expectedCount, userRows, userRowCount) {
    const userCount = this.extractCount(userRows);

    if (typeof expectedCount !== "number" || typeof userCount !== "number") {
      return {
        isCorrect: false,
        reason: "Count comparison requires numeric values",
      };
    }

    if (expectedCount === userCount) {
      return { isCorrect: true };
    }

    return {
      isCorrect: false,
      reason: `Expected count ${expectedCount}, but got ${userCount}`,
    };
  }

  /**
   * Normalize rows for comparison (handle different key cases, types)
   */
  normalizeRows(rows) {
    return rows.map((row) => {
      const normalized = {};
      for (const [key, val] of Object.entries(row)) {
        // Normalize keys to lowercase for comparison
        normalized[key.toLowerCase()] = this.normalizeValue(val);
      }
      return normalized;
    });
  }

  /**
   * Normalize a value for comparison
   */
  normalizeValue(value) {
    if (value === null || value === undefined) {
      return null;
    }
    if (typeof value === "number") {
      // Handle numeric equivalence (INTEGER vs REAL)
      return Number(value);
    }
    if (typeof value === "string") {
      // Case-sensitive for TEXT
      return value.trim();
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    return value;
  }

  /**
   * Compare two values for equality
   */
  valuesEqual(a, b) {
    const normA = this.normalizeValue(a);
    const normB = this.normalizeValue(b);

    // Handle null/undefined
    if (normA === null && normB === null) return true;
    if (normA === null || normB === null) return false;

    // Numeric comparison (allows INTEGER vs REAL)
    if (typeof normA === "number" && typeof normB === "number") {
      return Math.abs(normA - normB) < 0.0001; // Floating point tolerance
    }

    // String comparison (case-sensitive)
    if (typeof normA === "string" && typeof normB === "string") {
      return normA === normB;
    }

    // Default strict equality
    return normA === normB;
  }

  /**
   * Compare two rows for equality
   */
  rowsEqual(row1, row2) {
    const keys1 = Object.keys(row1).sort();
    const keys2 = Object.keys(row2).sort();

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (!this.valuesEqual(row1[key], row2[key])) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get a unique key for a row (for efficient matching)
   */
  getRowKey(row) {
    const sortedKeys = Object.keys(row).sort();
    return sortedKeys.join("|");
  }

  /**
   * Extract single value from a row (assumes single column)
   */
  extractSingleValue(row) {
    const keys = Object.keys(row);
    if (keys.length === 0) {
      return null;
    }
    // If single column, return its value
    if (keys.length === 1) {
      return row[keys[0]];
    }
    // If multiple columns, return the first one
    return row[keys[0]];
  }

  /**
   * Extract count from result (assumes COUNT(*) or similar)
   */
  extractCount(rows) {
    if (rows.length === 0) {
      return 0;
    }
    const firstRow = rows[0];
    const keys = Object.keys(firstRow);
    if (keys.length > 0) {
      const value = firstRow[keys[0]];
      return typeof value === "number" ? value : parseInt(value, 10) || 0;
    }
    return 0;
  }
}

module.exports = new ResultEvaluator();

