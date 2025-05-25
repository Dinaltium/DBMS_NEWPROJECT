import {
  users,
  tasks,
  type User,
  type InsertUser,
  type Task,
  type InsertTask,
  type UpdateTask,
  type UpdateUser,
  suppliers,
  orders,
} from "@shared/schema";
import { db, sql as neonSql } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import pg from "pg";

// Create a Pool from the DATABASE_URL for session store compatibility
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPassword(id: number, password: string): Promise<void>;
  updateUserLastActive(id: number): Promise<void>;
  updateUser(id: number, data: UpdateUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<void>;

  createTask(task: InsertTask): Promise<Task>;
  getTask(id: number): Promise<Task | undefined>;
  updateTask(id: number, data: UpdateTask): Promise<Task>;
  deleteTask(id: number): Promise<void>;
  getAllTasks(): Promise<Task[]>;
  getTasksByAssignee(userId: number): Promise<Task[]>;
  getRecentTasks(limit?: number): Promise<Task[]>;

  sessionStore: any; // Will use the session store type from connect-pg-simple

  getAllSuppliers(): Promise<any[]>;
  createSupplier(data: any): Promise<any>;
  updateSupplier(id: number, data: any): Promise<any>;
  deleteSupplier(id: number): Promise<void>;

  getAllOrders(): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any; // Session store from connect-pg-simple

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });

    // Initialize sample users if they don't exist
    this.seedInitialUsers().catch(console.error);
    // Initialize sample suppliers if they don't exist
    this.seedInitialSuppliers().catch(console.error);
    // Initialize sample orders if they don't exist
    this.seedInitialOrders().catch(console.error);
  }

  // Add method to seed initial users
  async seedInitialUsers(): Promise<void> {
    console.log("Checking if sample users need to be created...");

    // Check if admin user exists
    const adminUser = await this.getUserByUsername("rafan");
    if (!adminUser) {
      console.log("Creating admin user: rafan");
      await this.createUser({
        username: "rafan",
        password: "AL2023",
        name: "Rafan Ahamad Sheik",
        employeeId: "AL001",
        email: "rafan@aviation.com",
        role: "admin",
      });
    }

    // Check if manager user exists
    const managerUser = await this.getUserByUsername("jazeel");
    if (!managerUser) {
      console.log("Creating manager user: jazeel");
      await this.createUser({
        username: "jazeel",
        password: "AL2023",
        name: "T Mohammed Jazeel",
        employeeId: "AL002",
        email: "jazeel@aviation.com",
        role: "manager",
      });
    }
  }

  // Add method to seed initial suppliers
  async seedInitialSuppliers(): Promise<void> {
    console.log("Checking if sample suppliers need to be created...");
    // Check if Sandeep supplier exists
    const suppliersList = await this.getAllSuppliers();
    const sandeepExists = suppliersList.some(
      (s) => s.email === "sandeep@aviation.com"
    );
    if (!sandeepExists) {
      console.log("Creating supplier: Sandeep Kumar");
      await this.createSupplier({
        first_name: "Sandeep",
        last_name: "Kumar",
        email: "sandeep@aviation.com",
        phone: "1234567890",
        city: "YourCity",
        state: "YourState",
        country: "YourCountry",
        zipcode: "123456",
      });
    }
  }

  // Add method to seed initial orders
  async seedInitialOrders(): Promise<void> {
    console.log("Checking if sample orders need to be created...");
    const existingOrders = await this.getAllOrders();
    if (existingOrders.length === 0) {
      console.log("Creating sample orders...");
      await db.insert(orders).values([
        {
          order_status: "Inprogress",
          order_cost: "500",
          order_date: "2009-01-01T00:08:00.000",
          order_buyer_id: 1,
          order_supplier_id: 1,
        },
        {
          order_status: "Inprogress",
          order_cost: "1000",
          order_date: "2009-01-01T00:08:00.000",
          order_buyer_id: 2,
          order_supplier_id: 2,
        },
        {
          order_status: "Inprogress",
          order_cost: "2000",
          order_date: "2009-01-01T00:09:00.000",
          order_buyer_id: 3,
          order_supplier_id: 3,
        },
        {
          order_status: "Complete",
          order_cost: "500",
          order_date: "2009-01-01T00:15:10.000",
          order_buyer_id: 4,
          order_supplier_id: 4,
        },
        {
          order_status: "Shipping",
          order_cost: "5010",
          order_date: "2009-01-01T00:18:11.000",
          order_buyer_id: 5,
          order_supplier_id: 5,
        },
      ]);
      console.log("Sample orders created.");
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // For testing purposes, check if we're using the test password AL2023
      console.log("Creating user with data:", {
        ...insertUser,
        password: "*******",
      });

      const [user] = await db.insert(users).values(insertUser).returning();

      console.log("User created successfully:", user);
      return user;
    } catch (err) {
      console.error("Error creating user:", err);
      throw err;
    }
  }

  async updateUserPassword(id: number, password: string): Promise<void> {
    await db.update(users).set({ password }).where(eq(users.id, id));
  }

  async updateUserLastActive(id: number): Promise<void> {
    await db
      .update(users)
      .set({ lastActive: new Date() })
      .where(eq(users.id, id));
  }

  async updateUser(id: number, data: UpdateUser): Promise<User> {
    // If name is being updated, set the nameLastChanged field
    let updateData: any = { ...data };
    if (data.name) {
      updateData.nameLastChanged = new Date();
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Task methods
  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async updateTask(id: number, data: UpdateTask): Promise<Task> {
    const [updatedTask] = await db
      .update(tasks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();

    return updatedTask;
  }

  async deleteTask(id: number): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async getTasksByAssignee(userId: number): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.assignedToId, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async getRecentTasks(limit: number = 10): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .orderBy(desc(tasks.createdAt))
      .limit(limit);
  }

  async getAllSuppliers(): Promise<any[]> {
    return await db.select().from(suppliers);
  }

  async createSupplier(data: any): Promise<any> {
    const [supplier] = await db.insert(suppliers).values(data).returning();
    return supplier;
  }

  async updateSupplier(id: number, data: any): Promise<any> {
    const [supplier] = await db
      .update(suppliers)
      .set(data)
      .where(eq(suppliers.supplier_id, id))
      .returning();
    return supplier;
  }

  async deleteSupplier(id: number): Promise<void> {
    await db.delete(suppliers).where(eq(suppliers.supplier_id, id));
  }

  async getAllOrders(): Promise<any[]> {
    return await db.select().from(orders);
  }
}

export const storage = new DatabaseStorage();
