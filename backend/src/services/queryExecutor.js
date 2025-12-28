const { pgPool } = require("../config/database");
const Assignment = require("../models/Assignment");

class QueryExecutor {
  constructor() {
    this.maxExecutionTime = 10000; // 10 seconds
    this.maxRows = 1000; // Maximum rows to return
  }

  async executeQuery(sqlQuery, assignmentId) {
    const startTime = Date.now();
    let client;
    let limitedQuery = null;

    try {
      // Get connection from pool
      client = await pgPool.connect();

      // Set query timeout (use string interpolation as SET doesn't support parameterized queries)
      await client.query(`SET statement_timeout = ${this.maxExecutionTime}`);

      // Create assignment-specific sample tables if assignmentId is provided
      if (assignmentId) {
        await this.setupAssignmentTables(client, assignmentId);
      }

      // Execute the query with row limit
      limitedQuery = this.addRowLimit(sqlQuery);
      const result = await client.query(limitedQuery);

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          rows: result.rows,
          rowCount: result.rowCount,
          fields:
            result.fields?.map((field) => ({
              name: field.name,
              dataType: field.dataTypeID,
            })) || [],
          executionTime,
          query: sqlQuery,
        },
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      // Enhanced error logging for debugging
      console.error("[QueryExecutor] Query execution failed:");
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Original query:", sqlQuery);
      console.error("Processed query:", limitedQuery || "N/A");
      console.error("Full error:", error);

      // Include processed query in error details for debugging
      const errorMessage = this.formatErrorMessage(error);

      return {
        success: false,
        error: {
          message: errorMessage,
          code: error.code,
          executionTime,
          query: sqlQuery,
          // Always include processed query in development
          ...(process.env.NODE_ENV === "development" &&
            limitedQuery && {
              processedQuery: limitedQuery.substring(0, 500),
              originalError: error.message,
            }),
        },
      };
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  async setupAssignmentTables(client, assignmentId) {
    try {
      // Fetch assignment data from MongoDB
      const assignment = await Assignment.findById(assignmentId);
      if (
        !assignment ||
        !assignment.sampleTables ||
        assignment.sampleTables.length === 0
      ) {
        console.log(
          `[QueryExecutor] No sample tables found for assignment ${assignmentId}`
        );
        return;
      }

      console.log(
        `[QueryExecutor] Setting up ${assignment.sampleTables.length} sample tables for assignment ${assignmentId}`
      );

      // Begin transaction to ensure all tables are created atomically
      await client.query("BEGIN");

      // Drop existing assignment tables if they exist
      for (const table of assignment.sampleTables) {
        await client.query(`DROP TABLE IF EXISTS ${table.tableName} CASCADE`);
      }

      // Create each sample table
      for (const table of assignment.sampleTables) {
        await this.createSampleTable(client, table);
      }

      // Commit transaction
      await client.query("COMMIT");
      console.log(
        `[QueryExecutor] Successfully created sample tables for assignment ${assignmentId}`
      );
    } catch (error) {
      // Rollback on error
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("[QueryExecutor] Rollback failed:", rollbackError);
      }
      console.error(
        "[QueryExecutor] Failed to setup assignment tables:",
        error
      );
      throw error;
    }
  }

  async createSampleTable(client, tableData) {
    const { tableName, columns, rows } = tableData;

    // Build CREATE TABLE statement
    const columnDefinitions = columns
      .map((col) => {
        let dataType = this.mapDataType(col.dataType);
        return `${col.columnName} ${dataType}`;
      })
      .join(", ");

    const createTableSQL = `CREATE TABLE ${tableName} (${columnDefinitions})`;

    console.log(`[QueryExecutor] Creating table: ${createTableSQL}`);
    await client.query(createTableSQL);

    // Insert sample data if provided
    if (rows && rows.length > 0) {
      const columnNames = columns.map((col) => col.columnName);
      const placeholders = columnNames
        .map((_, index) => `$${index + 1}`)
        .join(", ");
      const insertSQL = `INSERT INTO ${tableName} (${columnNames.join(
        ", "
      )}) VALUES (${placeholders})`;

      for (const row of rows) {
        const values = columnNames.map((colName) => row[colName]);
        await client.query(insertSQL, values);
      }

      console.log(
        `[QueryExecutor] Inserted ${rows.length} rows into ${tableName}`
      );
    }
  }

  mapDataType(mongoDataType) {
    // Map MongoDB/generic data types to PostgreSQL data types
    const typeMap = {
      INTEGER: "INTEGER",
      INT: "INTEGER",
      "VARCHAR(50)": "VARCHAR(50)",
      "VARCHAR(100)": "VARCHAR(100)",
      "VARCHAR(200)": "VARCHAR(200)",
      TEXT: "TEXT",
      "DECIMAL(10,2)": "DECIMAL(10,2)",
      DECIMAL: "DECIMAL(10,2)",
      DATE: "DATE",
      TIMESTAMP: "TIMESTAMP",
      BOOLEAN: "BOOLEAN",
      SERIAL: "SERIAL",
    };

    return typeMap[mongoDataType.toUpperCase()] || "TEXT";
  }

  addRowLimit(query) {
    // Check if query already has LIMIT clause
    const hasLimit = /\bLIMIT\s+\d+/i.test(query);

    if (!hasLimit) {
      // Remove trailing semicolon before adding LIMIT
      const trimmedQuery = query.trim().replace(/;+$/, "");
      return `${trimmedQuery} LIMIT ${this.maxRows}`;
    }

    return query;
  }

  formatErrorMessage(error) {
    // Common PostgreSQL error codes and user-friendly messages
    const errorMessages = {
      42601: "Syntax error in SQL query. Please check your SQL syntax.",
      42703: "Column does not exist. Please check column names.",
      "42P01": "Table does not exist. Please check table names.",
      42883: "Function does not exist. Please check function names.",
      23502: "Not null violation. A required field is missing.",
      23503: "Foreign key violation. Referenced record does not exist.",
      23505: "Unique constraint violation. Duplicate value found.",
      "25P02": "Transaction is aborted. Please check your query.",
      57014: "Query timeout. Your query took too long to execute.",
    };

    if (error.code && errorMessages[error.code]) {
      return errorMessages[error.code];
    }

    // Generic error handling
    if (error.message) {
      // Remove sensitive information from error messages
      let message = error.message
        .replace(/\b(password|pwd|secret|key|token)\b/gi, "[REDACTED]")
        .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, "[IP_ADDRESS]");

      return message;
    }

    return "An unexpected error occurred while executing the query.";
  }

  async getTableSchema(tableName) {
    let client;

    try {
      client = await pgPool.connect();

      const schemaQuery = `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position;
      `;

      const result = await client.query(schemaQuery, [tableName]);

      return {
        success: true,
        schema: result.rows,
      };
    } catch (error) {
      return {
        success: false,
        error: this.formatErrorMessage(error),
      };
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  async getSampleData(tableName, limit = 10) {
    let client;

    try {
      client = await pgPool.connect();

      const sampleQuery = `SELECT * FROM ${tableName} LIMIT $1`;
      const result = await client.query(sampleQuery, [limit]);

      return {
        success: true,
        data: result.rows,
        rowCount: result.rowCount,
      };
    } catch (error) {
      return {
        success: false,
        error: this.formatErrorMessage(error),
      };
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  async getAvailableTables() {
    let client;

    try {
      client = await pgPool.connect();

      const tablesQuery = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `;

      const result = await client.query(tablesQuery);

      return {
        success: true,
        tables: result.rows.map((row) => row.table_name),
      };
    } catch (error) {
      return {
        success: false,
        error: this.formatErrorMessage(error),
      };
    } finally {
      if (client) {
        client.release();
      }
    }
  }
}

module.exports = new QueryExecutor();
