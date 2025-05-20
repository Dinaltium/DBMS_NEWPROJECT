import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: ["all"],
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    // Skip API routes
    if (req.originalUrl.startsWith("/api")) {
      return next();
    }

    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    log(
      `Warning: Could not find the build directory: ${distPath}, creating a basic public directory`
    );

    try {
      // Create public directory if it doesn't exist
      fs.mkdirSync(distPath, { recursive: true });

      // Create a basic index.html if it doesn't exist
      const indexPath = path.resolve(distPath, "index.html");
      if (!fs.existsSync(indexPath)) {
        fs.writeFileSync(
          indexPath,
          `<!DOCTYPE html>
<html>
<head>
  <title>Aviation Logistics Management System</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
    h1 { color: #2c3e50; }
  </style>
</head>
<body>
  <h1>Aviation Logistics Management System</h1>
  <p>Server is running successfully. Please use the mobile app to access the system.</p>
  <p>API endpoint is available at <code>/api</code></p>
</body>
</html>`
        );
      }
    } catch (err) {
      log(`Failed to create public directory: ${err}`);
      throw new Error(`Could not create the build directory: ${distPath}`);
    }
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist, but exclude API routes
  app.use("*", (req, res) => {
    // Skip API routes
    if (req.originalUrl.startsWith("/api")) {
      return res.status(404).json({ message: "API endpoint not found" });
    }

    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
