import { users, tasks, type User, type InsertUser, type Task, type InsertTask, type UpdateTask, type UpdateUser } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

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
        role: "admin"
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
        role: "manager"
      });
    }
    
    // Check if employee user exists
    const employeeUser = await this.getUserByUsername("sandeep");
    if (!employeeUser) {
      console.log("Creating employee user: sandeep");
      await this.createUser({
        username: "sandeep",
        password: "AL2023",
        name: "Sandeep Kumar",
        employeeId: "AL003",
        email: "sandeep@aviation.com",
        role: "employee"
      });
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // For testing purposes, check if we're using the test password AL2023
      console.log("Creating user with data:", { ...insertUser, password: "*******" });
      
      const [user] = await db
        .insert(users)
        .values(insertUser)
        .returning();
      
      console.log("User created successfully:", user);
      return user;
    } catch (err) {
      console.error("Error creating user:", err);
      throw err;
    }
  }

  async updateUserPassword(id: number, password: string): Promise<void> {
    await db.update(users)
      .set({ password })
      .where(eq(users.id, id));
  }

  async updateUserLastActive(id: number): Promise<void> {
    await db.update(users)
      .set({ lastActive: new Date() })
      .where(eq(users.id, id));
  }

  async updateUser(id: number, data: UpdateUser): Promise<User> {
    // If name is being updated, set the nameLastChanged field
    let updateData: any = { ...data };
    if (data.name) {
      updateData.nameLastChanged = new Date();
    }

    const [updatedUser] = await db.update(users)
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
    const [updatedTask] = await db.update(tasks)
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
    return await db.select()
      .from(tasks)
      .where(eq(tasks.assignedToId, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async getRecentTasks(limit: number = 10): Promise<Task[]> {
    return await db.select()
      .from(tasks)
      .orderBy(desc(tasks.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
