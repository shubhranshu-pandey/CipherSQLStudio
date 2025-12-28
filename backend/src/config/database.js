const mongoose = require("mongoose");
const { Pool } = require("pg");

// MongoDB connection
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// PostgreSQL connection pool
const pgPool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  ssl: {
    rejectUnauthorized: false, // REQUIRED for Neon
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased timeout for Neon cloud connection
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Test PostgreSQL connection
const testPostgresConnection = async () => {
  try {
    const client = await pgPool.connect();
    await client.query("SELECT NOW()");
    client.release();
    console.log("PostgreSQL connected successfully");
  } catch (error) {
    console.error("PostgreSQL connection error:", error.message);
    process.exit(1);
  }
};

const connectDB = async () => {
  await connectMongoDB();
  await testPostgresConnection();
};

module.exports = {
  connectDB: connectDB,
  pgPool,
};