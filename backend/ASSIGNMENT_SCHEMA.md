# Assignment Schema & Validation Guide

## Overview

This document describes the assignment ingestion and validation system for CipherSQLStudio. The system ensures assignments are properly structured and user SQL results are validated against expected outputs **without leaking solutions**.

## Assignment Schema

### Required Fields

```javascript
{
  title: String,                    // Assignment title
  description: String,              // Brief description
  difficulty: "Easy" | "Medium" | "Hard",
  question: String,                 // The SQL problem statement
  sampleTables: [                  // Table definitions with sample data
    {
      tableName: String,
      columns: [
        {
          columnName: String,
          dataType: String          // e.g., "INTEGER", "VARCHAR(50)", "DATE"
        }
      ],
      rows: [Object]                // Array of row objects matching column structure
    }
  ],
  expectedOutput: {
    type: "table" | "single_value" | "column" | "count",
    value: <flexible>               // Structure depends on type
  },
  createdAt: ISO Date String,
  updatedAt: ISO Date String
}
```

### Expected Output Types

#### 1. `table`
For queries that return multiple rows with multiple columns.

```javascript
expectedOutput: {
  type: "table",
  value: [
    { column1: "value1", column2: "value2" },
    { column1: "value3", column2: "value4" }
  ]
}
```

**Validation Rules:**
- Row order does NOT matter
- Column names must match exactly (case-insensitive)
- All expected rows must be present
- No extra rows allowed

#### 2. `single_value`
For queries that return exactly one row with one value (e.g., `SELECT COUNT(*) FROM table`).

```javascript
expectedOutput: {
  type: "single_value",
  value: 42
}
```

**Validation Rules:**
- Must return exactly 1 row
- Value must match exactly (numeric equivalence allowed for INTEGER vs REAL)

#### 3. `column`
For queries that return multiple rows with one column (order-insensitive).

```javascript
expectedOutput: {
  type: "column",
  value: ["value1", "value2", "value3"]
}
```

**Validation Rules:**
- Order does NOT matter
- All values must be present
- No extra values allowed

#### 4. `count`
For queries that return a count value.

```javascript
expectedOutput: {
  type: "count",
  value: 10
}
```

**Validation Rules:**
- Numeric comparison
- Exact match required

## Adding Assignments

### Method 1: Using the Validation Script

```bash
# From JSON file
npm run seed:validate assignments.json

# From JSON string
node src/scripts/validateAndSeedAssignments.js --json '[{...}]'
```

### Method 2: Programmatic

```javascript
const { validateAndSeedAssignments } = require('./src/scripts/validateAndSeedAssignments');

const assignments = [
  {
    title: "Basic SELECT Query",
    description: "Retrieve all customers",
    difficulty: "Easy",
    question: "Write a query to get all customers from the customers table",
    sampleTables: [
      {
        tableName: "customers",
        columns: [
          { columnName: "id", dataType: "INTEGER" },
          { columnName: "name", dataType: "VARCHAR(100)" }
        ],
        rows: [
          { id: 1, name: "John" },
          { id: 2, name: "Jane" }
        ]
      }
    ],
    expectedOutput: {
      type: "table",
      value: [
        { id: 1, name: "John" },
        { id: 2, name: "Jane" }
      ]
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

validateAndSeedAssignments(assignments);
```

## Validation Rules

The validation script checks:

1. ✅ **Required Fields**: All required fields are present
2. ✅ **Data Types**: Fields match expected types
3. ✅ **Schema Consistency**: Column names in `rows` match `columns` definitions
4. ✅ **Expected Output Structure**: `expectedOutput.value` matches `expectedOutput.type`
5. ✅ **Table References**: Table names mentioned in question match `sampleTables`
6. ✅ **No Duplicates**: Prevents inserting duplicate assignments (by title)

## Result Evaluation

When a user executes a SQL query, the system:

1. Executes the query in PostgreSQL sandbox
2. Retrieves the result
3. Compares against `assignment.expectedOutput` using `ResultEvaluator`
4. Returns `{ isCorrect: boolean, reason?: string }`

**Important:** The evaluator:
- ❌ NEVER generates SQL queries
- ❌ NEVER reveals solutions
- ❌ NEVER modifies expected output
- ✅ ONLY compares results
- ✅ Provides clear feedback on mismatches

## Example Assignment JSON

```json
[
  {
    "title": "Find Customers in New York",
    "description": "Filter customers by city",
    "difficulty": "Easy",
    "question": "Write a SQL query to find all customers who live in 'New York'",
    "sampleTables": [
      {
        "tableName": "customers",
        "columns": [
          { "columnName": "id", "dataType": "INTEGER" },
          { "columnName": "name", "dataType": "VARCHAR(100)" },
          { "columnName": "city", "dataType": "VARCHAR(50)" }
        ],
        "rows": [
          { "id": 1, "name": "John", "city": "New York" },
          { "id": 2, "name": "Jane", "city": "Boston" },
          { "id": 3, "name": "Bob", "city": "New York" }
        ]
      }
    ],
    "expectedOutput": {
      "type": "table",
      "value": [
        { "id": 1, "name": "John", "city": "New York" },
        { "id": 3, "name": "Bob", "city": "New York" }
      ]
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

## Security & Solution Protection

The system is designed to **never leak solutions**:

1. **No SQL Generation**: The evaluator never generates or suggests SQL
2. **Result-Only Comparison**: Only compares results, not queries
3. **Clear Error Messages**: Provides feedback without revealing correct answers
4. **Schema Validation**: Ensures assignments are properly structured before ingestion

## Troubleshooting

### Validation Errors

If validation fails, check:
- All required fields are present
- `expectedOutput.type` matches the structure of `expectedOutput.value`
- Column names in `rows` match `columns` definitions
- Table names are consistent

### Evaluation Issues

If evaluation seems incorrect:
- Check that `expectedOutput.type` matches the query result structure
- Verify data types match (INTEGER vs REAL are treated as equivalent)
- Ensure column names match exactly (case-insensitive)

## API Response Format

When a query is executed:

```json
{
  "success": true,
  "data": {
    "rows": [...],
    "rowCount": 5,
    "isCorrect": true,
    "evaluation": {
      "isCorrect": true
    }
  }
}
```

If incorrect:

```json
{
  "success": true,
  "data": {
    "rows": [...],
    "rowCount": 3,
    "isCorrect": false,
    "evaluation": {
      "isCorrect": false,
      "reason": "Expected 5 row(s), but got 3"
    }
  }
}
```

