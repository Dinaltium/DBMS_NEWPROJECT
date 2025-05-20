import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import ws from "ws";
import * as schema from "@shared/schema";
import { log } from "./vite";

// Configure Neon to use WebSockets
neonConfig.webSocketConstructor = ws;

// For development only - disable SSL verification if having connection issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}

log("Connecting to database:", process.env.DATABASE_URL);

// Create a SQL executor using the neon function - this is more reliable for connecting to Neon
export const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
