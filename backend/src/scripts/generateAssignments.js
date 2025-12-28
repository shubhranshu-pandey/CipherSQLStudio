const mongoose = require("mongoose");
require("dotenv").config();

const assignments = [
  {
    title: "Employee Information Retrieval",
    description: "Easy",
    question:
      "Retrieve all information for employees who work in the 'Engineering' department.",
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "employee_id", dataType: "INTEGER" },
          { columnName: "first_name", dataType: "VARCHAR(50)" },
          { columnName: "last_name", dataType: "VARCHAR(50)" },
          { columnName: "department", dataType: "VARCHAR(50)" },
          { columnName: "salary", dataType: "DECIMAL(10,2)" },
        ],
        rows: [
          {
            employee_id: 1,
            first_name: "Alice",
            last_name: "Johnson",
            department: "Engineering",
            salary: 75000.0,
          },
          {
            employee_id: 2,
            first_name: "Bob",
            last_name: "Smith",
            department: "Marketing",
            salary: 65000.0,
          },
          {
            employee_id: 3,
            first_name: "Carol",
            last_name: "Davis",
            department: "Engineering",
            salary: 80000.0,
          },
          {
            employee_id: 4,
            first_name: "David",
            last_name: "Wilson",
            department: "Sales",
            salary: 60000.0,
          },
          {
            employee_id: 5,
            first_name: "Eve",
            last_name: "Brown",
            department: "Engineering",
            salary: 72000.0,
          },
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        {
          employee_id: 1,
          first_name: "Alice",
          last_name: "Johnson",
          department: "Engineering",
          salary: 75000.0,
        },
        {
          employee_id: 3,
          first_name: "Carol",
          last_name: "Davis",
          department: "Engineering",
          salary: 80000.0,
        },
        {
          employee_id: 5,
          first_name: "Eve",
          last_name: "Brown",
          department: "Engineering",
          salary: 72000.0,
        },
      ],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: "Product Count by Category",
    description: "Easy",
    question:
      "Count how many products are available in the 'Electronics' category.",
    sampleTables: [
      {
        tableName: "products",
        columns: [
          { columnName: "product_id", dataType: "INTEGER" },
          { columnName: "product_name", dataType: "VARCHAR(100)" },
          { columnName: "category", dataType: "VARCHAR(50)" },
          { columnName: "price", dataType: "DECIMAL(8,2)" },
        ],
        rows: [
          {
            product_id: 1,
            product_name: "Laptop",
            category: "Electronics",
            price: 999.99,
          },
          {
            product_id: 2,
            product_name: "Chair",
            category: "Furniture",
            price: 149.99,
          },
          {
            product_id: 3,
            product_name: "Phone",
            category: "Electronics",
            price: 699.99,
          },
          {
            product_id: 4,
            product_name: "Desk",
            category: "Furniture",
            price: 299.99,
          },
          {
            product_id: 5,
            product_name: "Tablet",
            category: "Electronics",
            price: 399.99,
          },
        ],
      },
    ],
    expectedOutput: {
      type: "count",
      value: 3,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: "Department Average Salary",
    description: "Medium",
    question: "Calculate the average salary for each department.",
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "employee_id", dataType: "INTEGER" },
          { columnName: "first_name", dataType: "VARCHAR(50)" },
          { columnName: "department", dataType: "VARCHAR(50)" },
          { columnName: "salary", dataType: "DECIMAL(10,2)" },
        ],
        rows: [
          {
            employee_id: 1,
            first_name: "Alice",
            department: "Engineering",
            salary: 80000.0,
          },
          {
            employee_id: 2,
            first_name: "Bob",
            department: "Engineering",
            salary: 70000.0,
          },
          {
            employee_id: 3,
            first_name: "Carol",
            department: "Marketing",
            salary: 60000.0,
          },
          {
            employee_id: 4,
            first_name: "David",
            department: "Marketing",
            salary: 65000.0,
          },
          {
            employee_id: 5,
            first_name: "Eve",
            department: "Sales",
            salary: 55000.0,
          },
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        { department: "Engineering", avg_salary: 75000.0 },
        { department: "Marketing", avg_salary: 62500.0 },
        { department: "Sales", avg_salary: 55000.0 },
      ],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: "Customer Order Summary",
    description: "Medium",
    question: "Show customer names along with their total number of orders.",
    sampleTables: [
      {
        tableName: "customers",
        columns: [
          { columnName: "customer_id", dataType: "INTEGER" },
          { columnName: "customer_name", dataType: "VARCHAR(100)" },
        ],
        rows: [
          { customer_id: 1, customer_name: "John Smith" },
          { customer_id: 2, customer_name: "Jane Doe" },
          { customer_id: 3, customer_name: "Mike Johnson" },
        ],
      },
      {
        tableName: "orders",
        columns: [
          { columnName: "order_id", dataType: "INTEGER" },
          { columnName: "customer_id", dataType: "INTEGER" },
          { columnName: "order_date", dataType: "DATE" },
        ],
        rows: [
          { order_id: 101, customer_id: 1, order_date: "2024-01-15" },
          { order_id: 102, customer_id: 2, order_date: "2024-01-16" },
          { order_id: 103, customer_id: 1, order_date: "2024-01-17" },
          { order_id: 104, customer_id: 3, order_date: "2024-01-18" },
          { order_id: 105, customer_id: 1, order_date: "2024-01-19" },
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        { customer_name: "John Smith", order_count: 3 },
        { customer_name: "Jane Doe", order_count: 1 },
        { customer_name: "Mike Johnson", order_count: 1 },
      ],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: "Top Selling Product Categories",
    description: "Hard",
    question:
      "Find the product categories that have generated more than $1000 in total sales, showing category name and total sales amount.",
    sampleTables: [
      {
        tableName: "products",
        columns: [
          { columnName: "product_id", dataType: "INTEGER" },
          { columnName: "product_name", dataType: "VARCHAR(100)" },
          { columnName: "category", dataType: "VARCHAR(50)" },
          { columnName: "price", dataType: "DECIMAL(8,2)" },
        ],
        rows: [
          {
            product_id: 1,
            product_name: "Laptop",
            category: "Electronics",
            price: 800.0,
          },
          {
            product_id: 2,
            product_name: "Chair",
            category: "Furniture",
            price: 150.0,
          },
          {
            product_id: 3,
            product_name: "Phone",
            category: "Electronics",
            price: 600.0,
          },
          {
            product_id: 4,
            product_name: "Desk",
            category: "Furniture",
            price: 300.0,
          },
        ],
      },
      {
        tableName: "order_items",
        columns: [
          { columnName: "order_item_id", dataType: "INTEGER" },
          { columnName: "product_id", dataType: "INTEGER" },
          { columnName: "quantity", dataType: "INTEGER" },
        ],
        rows: [
          { order_item_id: 1, product_id: 1, quantity: 2 },
          { order_item_id: 2, product_id: 2, quantity: 1 },
          { order_item_id: 3, product_id: 3, quantity: 3 },
          { order_item_id: 4, product_id: 4, quantity: 2 },
          { order_item_id: 5, product_id: 1, quantity: 1 },
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        { category: "Electronics", total_sales: 4200.0 },
        { category: "Furniture", total_sales: 750.0 },
      ],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: "Employee Performance Analysis",
    description: "Hard",
    question:
      "Find employees who have completed more projects than the average number of projects per employee in their department.",
    sampleTables: [
      {
        tableName: "employees",
        columns: [
          { columnName: "employee_id", dataType: "INTEGER" },
          { columnName: "employee_name", dataType: "VARCHAR(100)" },
          { columnName: "department", dataType: "VARCHAR(50)" },
        ],
        rows: [
          {
            employee_id: 1,
            employee_name: "Alice Johnson",
            department: "Engineering",
          },
          {
            employee_id: 2,
            employee_name: "Bob Smith",
            department: "Engineering",
          },
          {
            employee_id: 3,
            employee_name: "Carol Davis",
            department: "Marketing",
          },
          {
            employee_id: 4,
            employee_name: "David Wilson",
            department: "Marketing",
          },
        ],
      },
      {
        tableName: "projects",
        columns: [
          { columnName: "project_id", dataType: "INTEGER" },
          { columnName: "employee_id", dataType: "INTEGER" },
          { columnName: "project_name", dataType: "VARCHAR(100)" },
          { columnName: "status", dataType: "VARCHAR(20)" },
        ],
        rows: [
          {
            project_id: 1,
            employee_id: 1,
            project_name: "Website Redesign",
            status: "completed",
          },
          {
            project_id: 2,
            employee_id: 1,
            project_name: "Mobile App",
            status: "completed",
          },
          {
            project_id: 3,
            employee_id: 1,
            project_name: "Database Migration",
            status: "completed",
          },
          {
            project_id: 4,
            employee_id: 2,
            project_name: "API Development",
            status: "completed",
          },
          {
            project_id: 5,
            employee_id: 3,
            project_name: "Marketing Campaign",
            status: "completed",
          },
          {
            project_id: 6,
            employee_id: 3,
            project_name: "Social Media Strategy",
            status: "completed",
          },
          {
            project_id: 7,
            employee_id: 4,
            project_name: "Brand Guidelines",
            status: "completed",
          },
        ],
      },
    ],
    expectedOutput: {
      type: "table",
      value: [
        {
          employee_name: "Alice Johnson",
          department: "Engineering",
          completed_projects: 3,
        },
        {
          employee_name: "Carol Davis",
          department: "Marketing",
          completed_projects: 2,
        },
      ],
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

async function seedNewAssignments() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/ciphersqlstudio"
    );
    console.log("Connected to MongoDB");

    // Get the assignments collection directly
    const db = mongoose.connection.db;
    const assignmentsCollection = db.collection("assignments");

    // Clear existing assignments
    await assignmentsCollection.deleteMany({});
    console.log("Cleared existing assignments");

    // Convert assignments to proper format for MongoDB
    const formattedAssignments = assignments.map((assignment) => ({
      title: assignment.title,
      description: `Learn ${assignment.title.toLowerCase()} concepts through practical SQL exercises.`,
      difficulty: assignment.description, // Easy, Medium, Hard
      problemStatement: assignment.question,
      requirements: [`Complete the SQL query to: ${assignment.question}`],
      constraints: [],
      sampleTables: assignment.sampleTables,
      expectedOutput: assignment.expectedOutput,
      hints: [
        {
          level: 1,
          content:
            "Think about what data you need to retrieve and from which table(s).",
        },
        {
          level: 2,
          content:
            "Consider what SQL clauses and functions you might need for this query.",
        },
        {
          level: 3,
          content:
            "Break down the problem step by step and build your query incrementally.",
        },
      ],
      tags:
        assignment.difficulty === "Easy"
          ? ["basics", "single-table"]
          : assignment.difficulty === "Medium"
          ? ["joins", "aggregation"]
          : ["advanced", "subqueries", "complex-joins"],
      createdAt: new Date(assignment.createdAt),
      updatedAt: new Date(assignment.updatedAt),
      isActive: true,
    }));

    // Insert assignments
    const result = await assignmentsCollection.insertMany(formattedAssignments);
    console.log(`✅ Successfully inserted ${result.insertedCount} assignments`);

    // List inserted assignments
    formattedAssignments.forEach((assignment, index) => {
      console.log(
        `${index + 1}. ${assignment.title} (${assignment.difficulty})`
      );
    });
  } catch (error) {
    console.error("Error seeding assignments:", error);
  } finally {
    await mongoose.connection.close();
    console.log("Database connection closed");
  }
}

// Run the seeding function
seedNewAssignments();
