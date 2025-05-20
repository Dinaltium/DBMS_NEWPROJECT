import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import {
  insertTaskSchema,
  updateTaskSchema,
  updateUserSchema,
  updateUserPasswordSchema,
  insertUserSchema,
  insertSupplierSchema,
  updateSupplierSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  console.log("registerRoutes called: registering API routes...");
  // Setup authentication
  setupAuth(app);

  // Health check endpoint (no authentication required)
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
    });
  });

  // API middleware for checking authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  };

  // Middleware for checking admin role
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (req.user && req.user.role !== "admin") {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };

  // Middleware for checking manager or admin role
  const requireManagerOrAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    if (req.user && req.user.role !== "admin" && req.user.role !== "manager") {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };

  // Create user (admin only)
  app.post("/api/users", requireAdmin, async (req, res, next) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  });

  // User routes
  app.get("/api/users", requireAdmin, async (req, res, next) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/users/:id", requireAuth, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);

      // Non-admins can only view their own profile
      if (req.user && req.user.role !== "admin" && req.user.id !== id) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/users/:id", requireAuth, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);

      // Non-admins can only update their own profile
      if (req.user && req.user.role !== "admin" && req.user.id !== id) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      // Check name change restrictions for employees
      if (req.body.name && req.user && req.user.role === "employee") {
        const user = await storage.getUser(id);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        if (user.nameLastChanged) {
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

          if (new Date(user.nameLastChanged) > sixMonthsAgo) {
            return res.status(403).json({
              message: "Name can only be changed once every 6 months",
            });
          }
        }
      }

      // Only manager can update status
      if (
        req.body.status &&
        req.user &&
        req.user.name !== "T Mohammed Jazeel" &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          message: "Only managers can update status",
        });
      }

      const validatedData = updateUserSchema.parse(req.body);
      const updatedUser = await storage.updateUser(id, validatedData);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/users/:id", requireAdmin, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteUser(id);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // Task routes
  app.get("/api/tasks", requireAuth, async (req, res, next) => {
    try {
      // Admins see all tasks
      if (req.user && req.user.role === "admin") {
        const tasks = await storage.getAllTasks();
        return res.json(tasks);
      }

      // Regular users see only their tasks
      if (req.user) {
        const tasks = await storage.getTasksByAssignee(req.user.id);
        return res.json(tasks);
      }
      return res.status(401).json({ message: "Not authenticated" });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/tasks/recent", requireAuth, async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const tasks = await storage.getRecentTasks(limit);
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/tasks/:id", requireAuth, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Non-admins can only view their own tasks
      if (
        req.user &&
        req.user.role !== "admin" &&
        task.assignedToId !== req.user.id
      ) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      res.json(task);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/tasks", requireAuth, async (req, res, next) => {
    try {
      // Only admins and managers can create tasks
      if (
        req.user &&
        req.user.role !== "admin" &&
        req.user.role !== "manager"
      ) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask({
        ...taskData,
        createdById: req.user ? req.user.id : 0,
      });

      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/tasks/:id", requireAuth, async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      if (req.user) {
        // Admin can update any task
        if (req.user.role === "admin") {
          // Admin has full permissions
        }
        // Manager can update any task but can't change certain fields
        else if (req.user.role === "manager") {
          // Managers can update any task but with some restrictions
        }
        // Regular employee can only update their assigned tasks
        else if (task.assignedToId !== req.user.id) {
          return res.status(403).json({ message: "Insufficient permissions" });
        }

        // Only admins and managers can reassign tasks
        if (
          req.body.assignedToId &&
          req.user.role !== "admin" &&
          req.user.role !== "manager"
        ) {
          return res.status(403).json({
            message: "Only admins and managers can reassign tasks",
          });
        }
      }

      const validatedData = updateTaskSchema.parse(req.body);
      const updatedTask = await storage.updateTask(id, validatedData);

      res.json(updatedTask);
    } catch (error) {
      next(error);
    }
  });

  app.delete(
    "/api/tasks/:id",
    requireManagerOrAdmin,
    async (req, res, next) => {
      try {
        const id = parseInt(req.params.id);
        await storage.deleteTask(id);
        res.status(204).end();
      } catch (error) {
        next(error);
      }
    }
  );

  // Supplier (Employee) CRUD routes
  app.get("/api/suppliers", requireAdmin, async (req, res, next) => {
    try {
      const suppliers = await storage.getAllSuppliers();
      res.json(suppliers);
    } catch (error) {
      next(error);
    }
  });
  app.post("/api/suppliers", requireAdmin, async (req, res, next) => {
    try {
      const parseResult = insertSupplierSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: "Invalid supplier data",
          details: parseResult.error.errors,
        });
      }
      const supplier = await storage.createSupplier(parseResult.data);
      res.status(201).json(supplier);
    } catch (error) {
      next(error);
    }
  });
  app.put("/api/suppliers/:id", requireAdmin, async (req, res, next) => {
    try {
      const parseResult = updateSupplierSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: "Invalid supplier data",
          details: parseResult.error.errors,
        });
      }
      const supplier = await storage.updateSupplier(
        parseInt(req.params.id),
        parseResult.data
      );
      res.json(supplier);
    } catch (error) {
      next(error);
    }
  });
  app.delete("/api/suppliers/:id", requireAdmin, async (req, res, next) => {
    try {
      await storage.deleteSupplier(parseInt(req.params.id));
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  // Orders route
  app.get("/api/orders", requireAuth, async (req, res, next) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });
  console.log("/api/orders route registered");

  const httpServer = createServer(app);
  return httpServer;
}
