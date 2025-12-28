const mongoose = require("mongoose");
require("dotenv").config();

async function simpleSeed() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/ciphersqlstudio"
    );
    console.log("Connected to MongoDB");

    // Get the assignments collection directly
    const db = mongoose.connection.db;
    const collection = db.collection("assignments");

    // Clear existing assignments
    await collection.deleteMany({});
    console.log("Cleared existing assignments");

    // Simple assignments
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
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
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
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
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
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Customer Orders Summary",
        description: "Find the total order amount for each customer.",
        difficulty: "Medium",
        problemStatement:
          "Write a SQL query to find the total order amount for each customer.",
        requirements: [
          "Join customers and orders tables",
          "Sum order amounts by customer",
        ],
        constraints: [],
        sampleTables: [
          {
            tableName: "customers",
            columns: [
              { columnName: "customer_id", dataType: "INTEGER" },
              { columnName: "customer_name", dataType: "VARCHAR(100)" },
            ],
            rows: [
              { customer_id: 1, customer_name: "Alice Johnson" },
              { customer_id: 2, customer_name: "Bob Smith" },
            ],
          },
          {
            tableName: "orders",
            columns: [
              { columnName: "order_id", dataType: "INTEGER" },
              { columnName: "customer_id", dataType: "INTEGER" },
              { columnName: "order_amount", dataType: "DECIMAL(10,2)" },
            ],
            rows: [
              { order_id: 1, customer_id: 1, order_amount: 150.0 },
              { order_id: 2, customer_id: 1, order_amount: 200.0 },
              { order_id: 3, customer_id: 2, order_amount: 75.0 },
            ],
          },
        ],
        expectedOutput: {
          type: "table",
          value: [
            { customer_name: "Alice Johnson", total_amount: 350.0 },
            { customer_name: "Bob Smith", total_amount: 75.0 },
          ],
        },
        expectedResultStructure: {
          columns: ["customer_name", "total_amount"],
          description: "Customer names with total order amounts",
        },
        hints: [],
        tags: ["JOIN", "SUM", "GROUP BY"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Top Performing Sales Representative",
        description:
          "Find the sales representative with the highest total sales amount.",
        difficulty: "Hard",
        problemStatement:
          "Write a SQL query to find the sales representative with the highest total sales amount.",
        requirements: [
          "Join sales_reps and sales tables",
          "Group by representative",
          "Find maximum total",
        ],
        constraints: [],
        sampleTables: [
          {
            tableName: "sales_reps",
            columns: [
              { columnName: "rep_id", dataType: "INTEGER" },
              { columnName: "rep_name", dataType: "VARCHAR(100)" },
            ],
            rows: [
              { rep_id: 1, rep_name: "John Davis" },
              { rep_id: 2, rep_name: "Sarah Wilson" },
              { rep_id: 3, rep_name: "Mike Johnson" },
            ],
          },
          {
            tableName: "sales",
            columns: [
              { columnName: "sale_id", dataType: "INTEGER" },
              { columnName: "rep_id", dataType: "INTEGER" },
              { columnName: "sale_amount", dataType: "DECIMAL(10,2)" },
            ],
            rows: [
              { sale_id: 1, rep_id: 1, sale_amount: 1500.0 },
              { sale_id: 2, rep_id: 2, sale_amount: 2200.0 },
              { sale_id: 3, rep_id: 1, sale_amount: 800.0 },
              { sale_id: 4, rep_id: 3, sale_amount: 1200.0 },
              { sale_id: 5, rep_id: 2, sale_amount: 900.0 },
            ],
          },
        ],
        expectedOutput: {
          type: "table",
          value: [{ rep_name: "Sarah Wilson", total_sales: 3100.0 }],
        },
        expectedResultStructure: {
          columns: ["rep_name", "total_sales"],
          description: "Top sales representative with highest total sales",
        },
        hints: [],
        tags: ["JOIN", "GROUP BY", "MAX", "subquery"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Insert assignments
    const result = await collection.insertMany(assignments);
    console.log(`✅ Successfully seeded ${result.insertedCount} assignments`);

    // Verify the data
    const count = await collection.countDocuments({ isActive: true });
    console.log(`📊 Total active assignments: ${count}`);

    mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("❌ Error seeding assignments:", error);
    mongoose.connection.close();
    process.exit(1);
  }
}

simpleSeed();
