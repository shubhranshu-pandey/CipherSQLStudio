const mongoose = require("mongoose");
const Assignment = require("../models/Assignment");
require("dotenv").config();

async function quickSeed() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/ciphersqlstudio"
    );
    console.log("Connected to MongoDB");

    // Clear existing assignments
    await Assignment.deleteMany({});
    console.log("Cleared existing assignments");

    // Simple assignments that match the schema exactly
    const assignments = [
      {
        title: "Employee Information Retrieval",
        description:
          "Retrieve all employee information from the employees table.",
        difficulty: "Easy",
        problemStatement:
          "Write a SQL query to retrieve all employee information from the employees table.",
        requirements: ["Select all columns from employees table"],
        constraints: [],
        sampleTables: [
          {
            tableName: "employees",
            columns: [
              { columnName: "employee_id", dataType: "INTEGER" },
              { columnName: "first_name", dataType: "VARCHAR(50)" },
              { columnName: "last_name", dataType: "VARCHAR(50)" },
              { columnName: "department", dataType: "VARCHAR(50)" },
            ],
            rows: [
              {
                employee_id: 1,
                first_name: "John",
                last_name: "Smith",
                department: "Engineering",
              },
              {
                employee_id: 2,
                first_name: "Sarah",
                last_name: "Johnson",
                department: "Marketing",
              },
              {
                employee_id: 3,
                first_name: "Mike",
                last_name: "Brown",
                department: "Engineering",
              },
            ],
          },
        ],
        expectedOutput: {
          type: "table",
          value: [
            {
              employee_id: 1,
              first_name: "John",
              last_name: "Smith",
              department: "Engineering",
            },
            {
              employee_id: 2,
              first_name: "Sarah",
              last_name: "Johnson",
              department: "Marketing",
            },
            {
              employee_id: 3,
              first_name: "Mike",
              last_name: "Brown",
              department: "Engineering",
            },
          ],
        },
        expectedResultStructure: {
          columns: ["employee_id", "first_name", "last_name", "department"],
          description: "Table with all employee information",
        },
        hints: [],
        tags: ["SELECT", "basic"],
      },
      {
        title: "Product Count",
        description:
          "Count the total number of products in the products table.",
        difficulty: "Easy",
        problemStatement:
          "Write a SQL query to count the total number of products in the products table.",
        requirements: ["Count all rows in products table"],
        constraints: [],
        sampleTables: [
          {
            tableName: "products",
            columns: [
              { columnName: "product_id", dataType: "INTEGER" },
              { columnName: "product_name", dataType: "VARCHAR(100)" },
              { columnName: "price", dataType: "DECIMAL(10,2)" },
            ],
            rows: [
              { product_id: 1, product_name: "Laptop", price: 999.99 },
              { product_id: 2, product_name: "Mouse", price: 25.5 },
              { product_id: 3, product_name: "Keyboard", price: 75.0 },
              { product_id: 4, product_name: "Monitor", price: 299.99 },
            ],
          },
        ],
        expectedOutput: {
          type: "count",
          value: 4,
        },
        expectedResultStructure: {
          columns: ["count"],
          description: "Single count value",
        },
        hints: [],
        tags: ["COUNT", "basic"],
      },
      {
        title: "Department Employee Count",
        description: "Count the number of employees in each department.",
        difficulty: "Medium",
        problemStatement:
          "Write a SQL query to count the number of employees in each department.",
        requirements: [
          "Group employees by department",
          "Count employees in each group",
        ],
        constraints: [],
        sampleTables: [
          {
            tableName: "employees",
            columns: [
              { columnName: "employee_id", dataType: "INTEGER" },
              { columnName: "first_name", dataType: "VARCHAR(50)" },
              { columnName: "department", dataType: "VARCHAR(50)" },
            ],
            rows: [
              { employee_id: 1, first_name: "John", department: "Engineering" },
              { employee_id: 2, first_name: "Sarah", department: "Marketing" },
              { employee_id: 3, first_name: "Mike", department: "Engineering" },
              { employee_id: 4, first_name: "Lisa", department: "HR" },
              { employee_id: 5, first_name: "Tom", department: "Engineering" },
            ],
          },
        ],
        expectedOutput: {
          type: "table",
          value: [
            { department: "Engineering", employee_count: 3 },
            { department: "Marketing", employee_count: 1 },
            { department: "HR", employee_count: 1 },
          ],
        },
        expectedResultStructure: {
          columns: ["department", "employee_count"],
          description: "Department names with employee counts",
        },
        hints: [],
        tags: ["GROUP BY", "COUNT", "aggregation"],
      },
    ];

    // Insert assignments one by one
    for (const assignment of assignments) {
      try {
        const newAssignment = new Assignment(assignment);
        await newAssignment.save();
        console.log(`✅ Created: ${assignment.title}`);
      } catch (error) {
        console.log(`❌ Failed to create: ${assignment.title}`, error.message);
      }
    }

    const count = await Assignment.countDocuments();
    console.log(`\n🎉 Successfully seeded ${count} assignments`);

    mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("❌ Error seeding assignments:", error);
    mongoose.connection.close();
    process.exit(1);
  }
}

quickSeed();
