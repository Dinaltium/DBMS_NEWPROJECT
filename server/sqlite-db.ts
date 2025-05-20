// SQLite database configuration
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";
import { log } from "./vite";

// Set up SQLite database
log("Connecting to SQLite database");
const sqlite = new Database("aviation_logistics.db");
export const db = drizzle(sqlite, { schema });

// Create tables based on schema
// You would need to convert your PostgreSQL schema to SQLite schema
// This is just an example and would need proper migration from pg to sqlite types
export async function initializeDb() {
  log("Initializing SQLite database");
  // Create tables here
  // Example: sqlite.exec(`CREATE TABLE IF NOT EXISTS users (...)`);

  // This could be built out more fully if you decide to use SQLite
}
