import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { log } from "./vite";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Session setup - 2 hours max age as per requirements
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "advanced-logistics-secret-key",
    resave: true, // Changed to true to ensure session is saved
    saveUninitialized: true, // Changed to true to ensure even uninitialized sessions are saved
    store: storage.sessionStore,
    cookie: {
      maxAge: 2 * 60 * 60 * 1000, // 2 hours
      secure: false, // Must be false for development, true only in production with HTTPS
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        log("Login attempt for username:", username);
        const user = await storage.getUserByUsername(username);

        if (!user) {
          log("User not found:", username);
          return done(null, false);
        }

        // For testing purposes, accept AL2023 directly without hashing
        if (password === "AL2023") {
          log("Login successful with default password");
          // Update last active time
          await storage.updateUserLastActive(user.id);
          return done(null, user);
        }

        const isValidPassword = await comparePasswords(password, user.password);
        if (!isValidPassword) {
          log("Invalid password for user:", username);
          return done(null, false);
        }

        // Update last active time
        await storage.updateUserLastActive(user.id);
        log("Login successful for user:", username);
        return done(null, user);
      } catch (err) {
        log("Login error:", err);
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Register a new user (only for admins in real app)
  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });

  // Login
  app.post("/api/login", (req, res, next) => {
    console.log("Login attempt:", req.body);
    // Allow direct password AL2023 for testing
    if (req.body.password === "AL2023") {
      // Directly authenticate with username
      storage
        .getUserByUsername(req.body.username)
        .then((user) => {
          if (!user) {
            console.log("User not found:", req.body.username);
            return res.status(401).json({ message: "Invalid credentials" });
          }

          console.log("Logging in with test password:", user.username);
          req.login(user, (err) => {
            if (err) return next(err);
            return res.status(200).json(user);
          });
        })
        .catch((err) => next(err));
    } else {
      // Regular passport authentication
      passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user)
          return res.status(401).json({ message: "Invalid credentials" });

        req.login(user, (err) => {
          if (err) return next(err);
          return res.status(200).json(user);
        });
      })(req, res, next);
    }
  });

  // Logout - NUCLEAR VERSION
  app.post("/api/logout", (req, res, next) => {
    // Log the logout request
    console.log("⚠️ NUCLEAR LOGOUT INITIATED ⚠️", {
      isAuthenticated: req.isAuthenticated(),
      sessionID: req.sessionID,
      hasSession: !!req.session,
      cookies: req.cookies,
      time: new Date().toISOString(),
    });

    // AGGRESSIVELY CLEAR ALL COOKIES
    // Clear the specific session cookie
    res.clearCookie("connect.sid", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      domain: req.hostname,
    });

    // Try additional cookie clearing with different settings
    res.clearCookie("connect.sid");
    res.clearCookie("connect.sid", { path: "/" });

    // Set EXTREMELY aggressive cache-control headers
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "-1");
    res.setHeader("Surrogate-Control", "no-store");
    res.setHeader("Clear-Site-Data", '"cache", "cookies", "storage"'); // Modern browsers will clear everything

    // Try to invalidate any session-related data regardless of auth state
    if (req.session) {
      console.log("Attempting to clear session data directly");

      // Empty the session object
      Object.keys(req.session).forEach((key) => {
        if (key !== "cookie") {
          delete req.session[key];
        }
      });

      // Regenerate the session ID
      req.session.regenerate((err) => {
        if (err) console.error("Failed to regenerate session:", err);
        else console.log("Session regenerated with empty data");
      });
    }

    // Force logout regardless of current auth state
    if (req.logout) {
      try {
        console.log("Executing passport logout");
        // Logout through passport
        req.logout((err) => {
          if (err) console.error("Passport logout error:", err);
          else console.log("Passport logout successful");

          // Whether or not passport logout succeeded, destroy the session
          if (req.session) {
            req.session.destroy((err) => {
              if (err) console.error("Session destruction error:", err);
              else console.log("Session successfully destroyed");

              // Send successful response
              res.status(200).json({
                success: true,
                redirectTo: "/auth",
                timestamp: Date.now(),
                forceLogout: true,
              });
            });
          } else {
            // If somehow there's no session, still return success
            res.status(200).json({
              success: true,
              redirectTo: "/auth",
              timestamp: Date.now(),
              noSession: true,
            });
          }
        });
      } catch (logoutErr) {
        console.error("Fatal error in logout process:", logoutErr);

        // Even if everything fails, send a success response
        // The client will force navigation regardless
        res.status(200).json({
          success: true,
          redirectTo: "/auth",
          timestamp: Date.now(),
          error: "Logout error occurred but proceeding with client-side logout",
        });
      }
    } else {
      // If req.logout is somehow not available, still return success
      console.warn("req.logout function not available!");
      res.status(200).json({
        success: true,
        redirectTo: "/auth",
        timestamp: Date.now(),
        noLogoutFunction: true,
      });
    }
  });

  // Get current user
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  // Forgot password
  app.post("/api/forgot-password", async (req, res, next) => {
    try {
      const { username } = req.body;

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // For employees, reset to default
      if (user.role === "employee") {
        const newPassword = await hashPassword("AL2023");
        await storage.updateUserPassword(user.id, newPassword);
        return res
          .status(200)
          .json({ message: "Password has been reset to default" });
      } else {
        // For admins, this would be handled manually
        return res
          .status(403)
          .json({ message: "Admin passwords must be reset manually" });
      }
    } catch (err) {
      next(err);
    }
  });

  // Change password
  app.post("/api/change-password", async (req, res, next) => {
    if (!req.isAuthenticated())
      return res.status(401).json({ message: "Not authenticated" });

    try {
      const { currentPassword, newPassword } = req.body;
      const user = await storage.getUser(req.user!.id);

      if (!user || !(await comparePasswords(currentPassword, user.password))) {
        return res
          .status(400)
          .json({ message: "Current password is incorrect" });
      }

      const hashedNewPassword = await hashPassword(newPassword);
      await storage.updateUserPassword(user.id, hashedNewPassword);

      res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
      next(err);
    }
  });
}
