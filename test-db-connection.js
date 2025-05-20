// Use ES Module syntax
import { Pool, neonConfig } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import ws from "ws";

// Load environment variables
dotenv.config();

// Configure Neon to use WebSockets
neonConfig.webSocketConstructor = ws;

// Set this to bypass SSL certificate verification (development only)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function testConnection() {
  console.log("Testing connection to Neon database...");
  console.log("Connection string:", process.env.DATABASE_URL);

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    // Test query
    const result = await pool.query("SELECT NOW()");
    console.log("Connection successful!");
    console.log("Server time:", result.rows[0].now);

    // Try another query to list tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    console.log("\nDatabase tables:");
    if (tables.rows.length === 0) {
      console.log("No tables found. Database is empty.");
    } else {
      tables.rows.forEach((row) => {
        console.log(`- ${row.table_name}`);
      });
    }
  } catch (error) {
    console.error("Connection failed with error:");
    console.error(error);
  } finally {
    // Close the connection
    await pool.end();
  }
}

// Run the test
testConnection();
