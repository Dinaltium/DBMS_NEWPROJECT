import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", [
  "employee",
  "admin",
  "manager",
]);
export const userStatusEnum = pgEnum("user_status", [
  "available",
  "busy",
  "away",
]);
export const taskStatusEnum = pgEnum("task_status", [
  "pending",
  "in_progress",
  "completed",
  "overdue",
]);
export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
]);

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
  role: userRoleEnum("role").notNull().default("employee"),
  status: userStatusEnum("status").default("available"),
  nameLastChanged: timestamp("name_last_changed", { withTimezone: true }),
  theme: text("theme").default("system"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  lastActive: timestamp("last_active", { withTimezone: true }).defaultNow(),
});

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").notNull().default("pending"),
  priority: taskPriorityEnum("priority").notNull().default("medium"),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  createdById: integer("created_by_id")
    .references(() => users.id)
    .notNull(),
  dueDate: timestamp("due_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// Buyers table
export const buyers = pgTable("buyers", {
  buyer_id: serial("buyer_id").primaryKey(),
  buyer_company_name: text("buyer_company_name").notNull(),
  buyer_email: text("buyer_email").notNull().unique(),
  buyer_phone: text("buyer_phone").notNull(),
  buyer_first_name: text("buyer_first_name"),
  buyer_last_name: text("buyer_last_name"),
  buyer_description: text("buyer_description"),
  buyer_city: text("buyer_city").notNull(),
  buyer_state: text("buyer_state").notNull(),
  buyer_country: text("buyer_country").notNull(),
  buyer_zipcode: text("buyer_zipcode").notNull(),
});

// Suppliers table
export const suppliers = pgTable("suppliers", {
  supplier_id: serial("supplier_id").primaryKey(),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  country: text("country").notNull(),
  zipcode: text("zipcode").notNull(),
});

// Orders table
export const orders = pgTable("orders", {
  order_no: serial("order_no").primaryKey(),
  order_status: text("order_status").notNull(),
  order_cost: text("order_cost").notNull(),
  order_date: text("order_date").notNull(),
  order_buyer_id: integer("order_buyer_id").notNull(),
  order_supplier_id: integer("order_supplier_id").notNull(),
});

// Orders_Suppliers bridge table
export const orders_suppliers = pgTable("orders_suppliers", {
  os_order_no: integer("os_order_no").notNull(),
  os_supplier_id: integer("os_supplier_id").notNull(),
});

// Warehouses table
export const warehouses = pgTable("warehouses", {
  warehouse_id: serial("warehouse_id").primaryKey(),
  warehouse_name: text("warehouse_name").notNull(),
  warehouse_email: text("warehouse_email").notNull().unique(),
  warehouse_phone: text("warehouse_phone").notNull(),
  warehouse_description: text("warehouse_description"),
  warehouse_city: text("warehouse_city").notNull(),
  warehouse_state: text("warehouse_state").notNull(),
  warehouse_country: text("warehouse_country").notNull(),
  warehouse_zipcode: text("warehouse_zipcode").notNull(),
  warehouse_supplier_id: integer("warehouse_supplier_id").notNull(),
});

// Stores bridge table
export const stores = pgTable("stores", {
  store_supplier_id: integer("store_supplier_id").notNull(),
  store_warehouse_id: integer("store_warehouse_id").notNull(),
});

// Invoices table
export const invoices = pgTable("invoices", {
  invoice_no: serial("invoice_no").primaryKey(),
  invoice_date: text("invoice_date").notNull(),
  invoice_description: text("invoice_description"),
  invoice_payment_id: integer("invoice_payment_id").notNull(),
  invoice_order_no: integer("invoice_order_no").notNull(),
  invoice_shipping_id: integer("invoice_shipping_id").notNull(),
});

// Payments table
export const payments = pgTable("payments", {
  payment_id: serial("payment_id").primaryKey(),
  payment_date: text("payment_date").notNull(),
  payment_type: text("payment_type").notNull(),
  payment_status: text("payment_status"),
  payment_cost_id: integer("payment_cost_id").notNull(),
  payment_buyer_id: integer("payment_buyer_id").notNull(),
});

// Shippings table
export const shippings = pgTable("shippings", {
  shipping_id: serial("shipping_id").primaryKey(),
  shipping_carrier_name: text("shipping_carrier_name").notNull(),
  shipping_expected_delivery_date: text("shipping_expected_delivery_date"),
  shipping_buyer_id: integer("shipping_buyer_id").notNull(),
  shipping_warehouse_id: integer("shipping_warehouse_id").notNull(),
  shipping_supplier_id: integer("shipping_supplier_id").notNull(),
});

// Total_costs table
export const total_costs = pgTable("total_costs", {
  cost_id: serial("cost_id").primaryKey(),
  discount: text("discount"), // Use numeric for money if needed
  total_amount: text("total_amount"), // Use numeric for money if needed
  tc_shipping_id: integer("tc_shipping_id").notNull(),
  tc_order_no: integer("tc_order_no").notNull(),
});

// Stocks table
export const stocks = pgTable("stocks", {
  stock_warehouse_id: integer("stock_warehouse_id").notNull(),
  stock_commodity_id: integer("stock_commodity_id").notNull(),
  available_qty: integer("available_qty"),
});

// Airports table
export const airports = pgTable("airports", {
  airport_id: serial("airport_id").primaryKey(),
  airport_name: text("airport_name").notNull(),
  airport_address: text("airport_address").notNull(),
  airport_zipcode: text("airport_zipcode").notNull(),
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

export const updateUserSchema = createInsertSchema(users)
  .omit({
    id: true,
    password: true,
    createdAt: true,
  })
  .partial();

export const updateUserPasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export const updateTaskSchema = createInsertSchema(tasks)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    createdById: true,
  })
  .partial();

export const insertSupplierSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  zipcode: z.string().min(1, "Zipcode is required"),
});

export const updateSupplierSchema = insertSupplierSchema.partial();

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type UpdateSupplier = z.infer<typeof updateSupplierSchema>;
