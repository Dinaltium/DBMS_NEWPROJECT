// Create database tables directly
require("dotenv").config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const { Pool } = require("pg");
const { neon } = require("@neondatabase/serverless");
const { drizzle } = require("drizzle-orm/neon-serverless");
const ws = require("ws");

// Initialize the database connection
const { neonConfig } = require("@neondatabase/serverless");
neonConfig.webSocketConstructor = ws;

// Create SQL client
const sql = neon(process.env.DATABASE_URL);
const connectionString = process.env.DATABASE_URL;

// Log that we're starting
console.log("Starting database initialization...");
console.log("Database URL:", connectionString);

async function createTables() {
  try {
    // Create the enum types first
    await sql`
      DO $$ 
      BEGIN
        -- Create the enums if they don't exist
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
          CREATE TYPE user_role AS ENUM ('employee', 'admin', 'manager');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
          CREATE TYPE user_status AS ENUM ('available', 'busy', 'away');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
          CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'overdue');
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_priority') THEN
          CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
        END IF;
      END $$;
    `;

    console.log("Created enum types");

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        employee_id TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        dob TEXT,
        role user_role NOT NULL DEFAULT 'employee',
        status user_status DEFAULT 'available',
        name_last_changed TIMESTAMPTZ,
        theme TEXT DEFAULT 'system',
        created_at TIMESTAMPTZ DEFAULT now(),
        last_active TIMESTAMPTZ DEFAULT now()
      );
    `;

    console.log("Created users table");

    // Create tasks table
    await sql`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status task_status NOT NULL DEFAULT 'pending',
        priority task_priority NOT NULL DEFAULT 'medium',
        assigned_to_id INTEGER REFERENCES users(id),
        created_by_id INTEGER NOT NULL REFERENCES users(id),
        due_date TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `;

    console.log("Created tasks table");

    // Create suppliers table
    await sql`
      CREATE TABLE IF NOT EXISTS suppliers (
        supplier_id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        country TEXT NOT NULL,
        zipcode TEXT NOT NULL
      );
    `;

    console.log("Created suppliers table");

    // Remove description and company_name columns if they exist
    await sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='suppliers' AND column_name='description'
        ) THEN
          ALTER TABLE suppliers DROP COLUMN description;
        END IF;
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='suppliers' AND column_name='company_name'
        ) THEN
          ALTER TABLE suppliers DROP COLUMN company_name;
        END IF;
      END $$;
    `;
    console.log(
      "Removed description and company_name columns from suppliers table"
    );

    // Add theme column if it doesn't exist
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='users' AND column_name='theme'
        ) THEN
          ALTER TABLE users ADD COLUMN theme TEXT DEFAULT 'system' NOT NULL;
        END IF;
      END $$;
    `;

    // Add a check constraint for allowed values
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.constraint_column_usage 
          WHERE table_name='users' AND constraint_name='users_theme_check')
        THEN
          ALTER TABLE users ADD CONSTRAINT users_theme_check CHECK (theme IN ('light', 'dark', 'system'));
        END IF;
      END $$;
    `;

    // Create orders table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        order_id SERIAL PRIMARY KEY,
        order_number TEXT NOT NULL UNIQUE,
        order_date DATE NOT NULL,
        status TEXT NOT NULL
      );
    `;
    console.log("Created orders table");

    // Add 'item' column to orders table if it doesn't exist
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name='orders' AND column_name='item'
        ) THEN
          ALTER TABLE orders ADD COLUMN item TEXT NOT NULL DEFAULT 'Unknown';
        END IF;
      END $$;
    `;
    console.log("Ensured 'item' column exists in orders table");

    // Insert 5 example hardware orders if table is empty
    let orderCountRows = await sql`SELECT COUNT(*)::int AS count FROM orders;`;
    if (orderCountRows.rows) orderCountRows = orderCountRows.rows;
    if (orderCountRows[0] && orderCountRows[0].count === 0) {
      await sql`
        INSERT INTO orders (order_number, order_date, status, item) VALUES
          ('ORD-2001', '2024-06-01', 'In Stock', 'Nuts'),
          ('ORD-2002', '2024-06-02', 'Out of Stock', 'Screws'),
          ('ORD-2003', '2024-06-03', 'In Stock', 'Bolts'),
          ('ORD-2004', '2024-06-04', 'In Stock', 'Washers'),
          ('ORD-2005', '2024-06-05', 'Out of Stock', 'Rivets');
      `;
      console.log("Inserted example hardware orders");
    }

    console.log("All tables created successfully");
    return true;
  } catch (error) {
    console.error("Error creating tables:", error);
    return false;
  }
}

// Run the initialization
createTables()
  .then((success) => {
    if (success) {
      console.log("Database initialization completed successfully");
      process.exit(0);
    } else {
      console.error("Database initialization failed");
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error("Unexpected error during database initialization:", err);
    process.exit(1);
  });
