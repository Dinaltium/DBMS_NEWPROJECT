// ES Modules version for your HTTP server example
import * as dotenv from "dotenv";
import http from "http";
import { neon } from "@neondatabase/serverless";

// Load env variables
dotenv.config();

const sql = neon(process.env.DATABASE_URL);

const requestHandler = async (req, res) => {
  const result = await sql`SELECT version()`;
  const { version } = result[0];
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end(version);
};

http.createServer(requestHandler).listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
