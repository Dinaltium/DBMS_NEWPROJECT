import { pgTable, text, serial, integer, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum('user_role', ['employee', 'admin', 'manager']);
export const userStatusEnum = pgEnum('user_status', ['available', 'busy', 'away']);
export const taskStatusEnum = pgEnum('task_status', ['pending', 'in_progress', 'completed', 'overdue']);
export const taskPriorityEnum = pgEnum('task_priority', ['low', 'medium', 'high']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  dob: text("dob"),
  role: userRoleEnum("role").notNull().default('employee'),
  status: userStatusEnum("status").default('available'),
  nameLastChanged: timestamp("name_last_changed", { withTimezone: true }),
  theme: text("theme").default('system'),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  lastActive: timestamp("last_active", { withTimezone: true }).defaultNow(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").notNull().default('pending'),
  priority: taskPriorityEnum("priority").notNull().default('medium'),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  createdById: integer("created_by_id").references(() => users.id).notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  assignedTasks: many(tasks, { relationName: "assignedTasks" }),
  createdTasks: many(tasks, { relationName: "createdTasks" }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  assignedTo: one(users, {
    fields: [tasks.assignedToId],
    references: [users.id],
    relationName: "assignedTasks",
  }),
  createdBy: one(users, {
    fields: [tasks.createdById],
    references: [users.id],
    relationName: "createdTasks",
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastActive: true,
  nameLastChanged: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "Employee ID is required"),
  password: z.string().min(1, "Password is required"),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserSchema = createInsertSchema(users).omit({
  id: true,
  password: true,
  createdAt: true,
}).partial();

export const updateUserPasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export const updateTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
}).partial();

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
