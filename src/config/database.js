const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
    constructor() {
        this.db = null;
        this.initialized = false;
    }

    initialize() {
        if (this.initialized) return;

        // Determine database path based on environment
        const dbPath = process.env.NODE_ENV === 'production'
            ? path.join(process.env.RENDER_VOLUME_PATH || '/data', 'famchore.db')
            : path.join(__dirname, '../../data/famchore.db');

        // Ensure directory exists
        const dbDir = path.dirname(dbPath);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }

        // Create database connection with extended configuration
        this.db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
            if (err) {
                console.error('Database connection error:', err);
                throw err;
            }
            console.log('Connected to database at:', dbPath);
        });

        // Configure database settings
        this.db.serialize(() => {
            // Enable foreign keys
            this.db.run('PRAGMA foreign_keys = ON');
            // Enable WAL mode for better concurrent access
            this.db.run('PRAGMA journal_mode = WAL');
            // Set busy timeout to handle concurrent access
            this.db.run('PRAGMA busy_timeout = 5000');
            // Enable strict mode
            this.db.run('PRAGMA strict = ON');
        });

        // Handle connection errors
        this.db.on('error', (err) => {
            console.error('Database error:', err);
        });

        // Handle process termination
        process.on('SIGINT', () => this.cleanup());
        process.on('SIGTERM', () => this.cleanup());

        this.initialized = true;
    }

    // Wrapper for run to handle promises
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    }

    // Wrapper for get to handle promises
    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    // Wrapper for all to handle promises
    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // Cleanup database connections
    cleanup() {
        if (this.db) {
            console.log('Closing database connection...');
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err);
                    process.exit(1);
                }
                console.log('Database connection closed.');
                process.exit(0);
            });
        }
    }

    // Get database instance
    getInstance() {
        if (!this.initialized) {
            this.initialize();
        }
        return this.db;
    }
}

// Create singleton instance
const database = new Database();
database.initialize();

module.exports = database;
