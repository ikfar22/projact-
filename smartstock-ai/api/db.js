const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Initialize SQLite database file in api/data/
const DB_PATH = path.join(__dirname, 'data', 'smartstock.db');

let db;

function initDatabase() {
  db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error('❌ Failed to connect to database:', err.message);
      process.exit(1);
    }
    console.log('✅ SQLite connected:', DB_PATH);
  });

  // Enable WAL mode for better performance
  db.run('PRAGMA journal_mode = WAL;');
  db.run('PRAGMA foreign_keys = ON;');

  return db;
}

function getDb() {
  if (!db) {
    initDatabase();
  }
  return db;
}

// Create tables if they don't exist — returns a Promise
function createTables() {
  const database = getDb();

  return new Promise((resolve, reject) => {
    // Users table - stores authenticated users with bcrypt-hashed passwords
    database.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        shop_name TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) return reject(err);

      // Inventory table - product stock with predictive fields
      database.run(`
        CREATE TABLE IF NOT EXISTS inventory (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER REFERENCES users(id),
          name TEXT NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 0,
          daily_sales REAL NOT NULL DEFAULT 0,
          reorder_point INTEGER NOT NULL DEFAULT 0,
          price_per_unit REAL NOT NULL DEFAULT 0,
          location TEXT DEFAULT 'โซน A',
          cost_per_unit REAL DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) return reject(err);

        // Sales logs table - tracks every stock deduction for burn rate calculation
        database.run(`
          CREATE TABLE IF NOT EXISTS sales_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER REFERENCES users(id),
            inventory_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE CASCADE
          )
        `, (err) => {
          if (err) return reject(err);

          // Inventory logs table — tracks every add/edit/delete/sale for audit trail
          database.run(`
            CREATE TABLE IF NOT EXISTS inventory_logs (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              user_id INTEGER,
              action TEXT NOT NULL,
              inventory_id INTEGER,
              inventory_name TEXT,
              quantity_change INTEGER,
              old_quantity INTEGER,
              new_quantity INTEGER,
              note TEXT,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE SET NULL
            )
          `, (err) => {
            if (err) return reject(err);
            console.log('✅ Database tables ensured');
            resolve();
          });
        });
      });
    });
  });
}

// Helper: run a query with parameters
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

// Helper: get a single row
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

// Helper: get all rows
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    getDb().all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

module.exports = { initDatabase, createTables, migrateColumns, getDb, run, get, all };

// Add new columns to existing tables if they don't already exist (SQLite migration)
function migrateColumns() {
  const database = getDb();

  return new Promise((resolve) => {
    // Add location column if missing
    database.run('ALTER TABLE inventory ADD COLUMN location TEXT DEFAULT "โซน A"', (err) => {
      if (err && !err.message.includes('duplicate')) {
        console.log('  ↳ location column already exists');
      } else if (!err) {
        console.log('  ↳ added location column');
      }

      // Add cost_per_unit column if missing
      database.run('ALTER TABLE inventory ADD COLUMN cost_per_unit REAL DEFAULT 0', (err) => {
        if (err && !err.message.includes('duplicate')) {
          console.log('  ↳ cost_per_unit column already exists');
        } else if (!err) {
          console.log('  ↳ added cost_per_unit column');
        }

        // Add user_id to inventory for per-user data isolation
        database.run('ALTER TABLE inventory ADD COLUMN user_id INTEGER REFERENCES users(id)', (err) => {
          if (err && !err.message.includes('duplicate')) {
            console.log('  ↳ inventory.user_id column already exists');
          } else if (!err) {
            console.log('  ↳ added inventory.user_id column');
          }

          // Add user_id to sales_logs for per-user data isolation
          database.run('ALTER TABLE sales_logs ADD COLUMN user_id INTEGER REFERENCES users(id)', (err) => {
            if (err && !err.message.includes('duplicate')) {
              console.log('  ↳ sales_logs.user_id column already exists');
            } else if (!err) {
              console.log('  ↳ added sales_logs.user_id column');
            }
            resolve();
          });
        });
      });
    });
  });
}
