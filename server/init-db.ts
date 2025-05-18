import { db } from "./db";
import { users } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { log } from "./vite";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedUsers() {
  try {
    // Check if users table is empty
    const existingUsers = await db.select().from(users).limit(1);
    
    if (existingUsers.length === 0) {
      log("No users found. Creating initial users...");
      
      // Insert Admin user
      await db.insert(users).values({
        username: "rafan",
        password: await hashPassword("AL2023"),
        name: "Rafan Ahamad Sheik",
        employeeId: "AL001",
        email: "rafan@aviation.com",
        role: "admin"
      });
      
      // Insert Manager user
      await db.insert(users).values({
        username: "jazeel",
        password: await hashPassword("AL2023"),
        name: "T Mohammed Jazeel",
        employeeId: "AL002",
        email: "jazeel@aviation.com",
        role: "manager"
      });
      
      // Insert Employee user
      await db.insert(users).values({
        username: "sandeep",
        password: await hashPassword("AL2023"),
        name: "Sandeep Kumar",
        employeeId: "AL003",
        email: "sandeep@aviation.com",
        role: "employee"
      });
      
      log("Initial users created successfully");
    } else {
      log("Users already exist. Skipping initialization.");
    }
  } catch (error) {
    log("Error seeding users:", error);
  }
}

// Execute the seeding function
seedUsers();