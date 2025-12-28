const mongoose = require("mongoose");
const Assignment = require("../models/Assignment");
require("dotenv").config();

async function seedAssignments() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/ciphersqlstudio"
    );
    console.log("Connected to MongoDB");

    // Clear existing assignments
    await Assignment.deleteMany({});
    console.log("Cleared existing assignments");

    // Create assignments one by one to handle validation better
    const assignments = [
      {
        title: "Basic SELECT Query",
        description:
          "Learn the fundamentals of retrieving data from a single table using SELECT statements.",
        difficulty: "Easy",
        problemStatement:
          "Write a SQL query to retrieve all customer information from the customers table.",
        requirements: [
          "Select all columns from the customers table",
          "Return all rows without any filtering",
        ],
        constraints: [],
        sampleTables: [
          {
            tableName: "customers",
            columns: [
              { columnName: "customer_id", dataType: "INTEGER" },
              { columnName: "first_name", dataType: "VARCHAR(50)" },
              { columnName: "last_name", dataType: "VARCHAR(50)" },
              { columnName: "email", dataType: "VARCHAR(100)" },
            ],
            rows: [
              [1, "John", "Doe", "john.doe@email.com"],
              [2, "Jane", "Smith", "jane.smith@email.com"],
              [3, "Bob", "Johnson", "bob.johnson@email.com"],
            ],
          },
        ],
        expectedOutput: {
          type: "table",
          value: [
            [1, "John", "Doe", "john.doe@email.com"],
            [2, "Jane", "Smith", "jane.smith@email.com"],
            [3, "Bob", "Johnson", "bob.johnson@email.com"],
          ],
        },
        hints: [
          {
            level: 1,
            content:
              "Think about the most basic SQL command to retrieve data from a table.",
          },
          {
            level: 2,
            content:
              "Use the SELECT statement with * to get all columns from a table.",
          },
          {
            level: 3,
            content:
              "The syntax is: SELECT * FROM table_name; where table_name is 'customers'.",
          },
        ],
        tags: ["SELECT", "basics", "single-table"],
      },
      {
        title: "Filtering with WHERE Clause",
        description:
          "Practice using WHERE clauses to filter data based on specific conditions.",
        difficulty: "Easy",
        problemStatement: "Find all customers who live in 'New York' city.",
        requirements: [
          "Select customer_id, first_name, last_name, and city",
          "Filter results to show only customers from New York",
        ],
        constraints: ["City names are case-sensitive"],
        sampleTables: [
          {
            tableName: "customers",
            columns: [
              { columnName: "customer_id", dataType: "INTEGER" },
              { columnName: "first_name", dataType: "VARCHAR(50)" },
              { columnName: "last_name", dataType: "VARCHAR(50)" },
              { columnName: "city", dataType: "VARCHAR(50)" },
            ],
            rows: [
              [1, "John", "Doe", "New York"],
              [2, "Jane", "Smith", "Los Angeles"],
              [3, "Bob", "Johnson", "New York"],
              [4, "Alice", "Brown", "Chicago"],
            ],
          },
        ],
        expectedOutput: {
          type: "table",
          value: [
            [1, "John", "Doe", "New York"],
            [3, "Bob", "Johnson", "New York"],
          ],
        },
        hints: [
          {
            level: 1,
            content:
              "You need to filter the results based on a specific condition.",
          },
          {
            level: 2,
            content:
              "Use the WHERE clause to filter rows based on the city column.",
          },
          {
            level: 3,
            content:
              "Combine SELECT with WHERE: SELECT columns FROM table WHERE city = 'New York'.",
          },
        ],
        tags: ["WHERE", "filtering", "conditions"],
      },
      {
        title: "COUNT Function",
        description:
          "Learn to use aggregate functions to count records in a table.",
        difficulty: "Easy",
        problemStatement:
          "Count the total number of customers in the customers table.",
        requirements: [
          "Use the COUNT function",
          "Return a single number representing the total count",
        ],
        constraints: [],
        sampleTables: [
          {
            tableName: "customers",
            columns: [
              { columnName: "customer_id", dataType: "INTEGER" },
              { columnName: "first_name", dataType: "VARCHAR(50)" },
              { columnName: "last_name", dataType: "VARCHAR(50)" },
            ],
            rows: [
              [1, "John", "Doe"],
              [2, "Jane", "Smith"],
              [3, "Bob", "Johnson"],
              [4, "Alice", "Brown"],
              [5, "Charlie", "Wilson"],
            ],
          },
        ],
        expectedOutput: {
          type: "single_value",
          value: 5,
        },
        hints: [
          {
            level: 1,
            content: "You need to use an aggregate function to count records.",
          },
          {
            level: 2,
            content: "The COUNT function can count all rows in a table.",
          },
          {
            level: 3,
            content: "Use: SELECT COUNT(*) FROM customers;",
          },
        ],
        tags: ["COUNT", "aggregate", "functions"],
      },
      {
        title: "INNER JOIN",
        description:
          "Learn to combine data from multiple tables using INNER JOIN.",
        difficulty: "Medium",
        problemStatement:
          "Display customer names along with their order information.",
        requirements: [
          "Show customer first_name, last_name, and order_id",
          "Join customers and orders tables",
          "Include only customers who have placed orders",
        ],
        constraints: ["Use INNER JOIN"],
        sampleTables: [
          {
            tableName: "customers",
            columns: [
              { columnName: "customer_id", dataType: "INTEGER" },
              { columnName: "first_name", dataType: "VARCHAR(50)" },
              { columnName: "last_name", dataType: "VARCHAR(50)" },
            ],
            rows: [
              [1, "John", "Doe"],
              [2, "Jane", "Smith"],
              [3, "Bob", "Johnson"],
            ],
          },
          {
            tableName: "orders",
            columns: [
              { columnName: "order_id", dataType: "INTEGER" },
              { columnName: "customer_id", dataType: "INTEGER" },
            ],
            rows: [
              [101, 1],
              [102, 2],
              [103, 1],
            ],
          },
        ],
        expectedOutput: {
          type: "table",
          value: [
            ["John", "Doe", 101],
            ["Jane", "Smith", 102],
            ["John", "Doe", 103],
          ],
        },
        hints: [
          {
            level: 1,
            content:
              "You need to combine data from two tables based on a common column.",
          },
          {
            level: 2,
            content:
              "Use INNER JOIN to connect tables where customer_id matches.",
          },
          {
            level: 3,
            content:
              "SELECT c.first_name, c.last_name, o.order_id FROM customers c INNER JOIN orders o ON c.customer_id = o.customer_id;",
          },
        ],
        tags: ["JOIN", "INNER JOIN", "multiple-tables"],
      },
    ];

    // Insert assignments one by one
    const insertedAssignments = [];
    for (const assignmentData of assignments) {
      try {
        const assignment = new Assignment(assignmentData);
        const saved = await assignment.save();
        insertedAssignments.push(saved);
        console.log(`✓ Created: ${saved.title}`);
      } catch (error) {
        console.error(
          `✗ Failed to create: ${assignmentData.title}`,
          error.message
        );
      }
    }

    console.log(
      `\nSuccessfully seeded ${insertedAssignments.length} assignments`
    );
  } catch (error) {
    console.error("Error seeding assignments:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Run the seeding function
seedAssignments();
