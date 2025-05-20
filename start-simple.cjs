// A simple CommonJS script to start the server
require("dotenv").config();

// Set this to bypass SSL certificate verification (development only)
process.env.NODE_ENV = "development";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Use Node to execute the server directly
const { execSync } = require("child_process");

try {
  console.log("Starting server...");
  // Use npx to run tsx (this works even if tsx isn't installed globally)
  execSync("npx tsx server/index.ts", { stdio: "inherit" });
} catch (err) {
  console.error("Failed to start server:", err);
}
