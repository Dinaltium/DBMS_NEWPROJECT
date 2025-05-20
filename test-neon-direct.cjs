// Simple Neon direct connection test (CommonJS)
require("dotenv").config();

const { neon } = require("@neondatabase/serverless");
const sql = neon(process.env.DATABASE_URL);

async function testNeonConnection() {
  try {
    console.log("Testing connection to Neon database...");
    console.log("Connection string:", process.env.DATABASE_URL);

    // Test query using the neon SQL executor
    const result = await sql`SELECT version()`;
    console.log("Connection successful!");
    console.log("PostgreSQL version:", result[0].version);

    // Test another query to list tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

    console.log("\nDatabase tables:");
    if (tables.length === 0) {
      console.log("No tables found. Database is empty.");
    } else {
      tables.forEach((row) => {
        console.log(`- ${row.table_name}`);
      });
    }
  } catch (error) {
    console.error("Connection failed with error:");
    console.error(error);
  }
}

testNeonConnection();
