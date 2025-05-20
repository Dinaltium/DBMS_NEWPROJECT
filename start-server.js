// ES Module format start script
import * as dotenv from "dotenv";
import { createRequire } from "module";
import { pathToFileURL } from "url";

// Load environment variables
dotenv.config();

// Set this to bypass SSL certificate verification (development only)
process.env.NODE_ENV = "development";
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Import and start the server using TSX
import("tsx")
  .then((tsx) => {
    tsx.run(["server/index.ts"]);
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
  });
