const fs = require('fs').promises;
const path = require('path');
const { createConnection } = require('../../config/database');

// Migration table creation
const createMigrationTable = `
    CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        batch INTEGER NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`;

// Core migrations
const migrations = [
    {
        name: '001_create_users_table',
        up: `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                email TEXT UNIQUE,
                role TEXT NOT NULL CHECK(role IN ('parent', 'child')),
                points INTEGER DEFAULT 0,
                avatar TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
            AFTER UPDATE ON users
            BEGIN
                UPDATE users SET updated_at = CURRENT_TIMESTAMP
                WHERE id = NEW.id;
            END;
        `
    },
    {
        name: '002_create_chores_table',
        up: `
            CREATE TABLE IF NOT EXISTS chores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                points INTEGER NOT NULL DEFAULT 0,
                frequency TEXT CHECK(frequency IN ('daily', 'weekly', 'monthly', 'once')),
                created_by INTEGER NOT NULL,
                assigned_to INTEGER,
                due_date DATETIME,
                completed_at DATETIME,
                verified_at DATETIME,
                verified_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id),
                FOREIGN KEY (assigned_to) REFERENCES users(id),
                FOREIGN KEY (verified_by) REFERENCES users(id)
            );

            CREATE TRIGGER IF NOT EXISTS update_chores_timestamp 
            AFTER UPDATE ON chores
            BEGIN
                UPDATE chores SET updated_at = CURRENT_TIMESTAMP
                WHERE id = NEW.id;
            END;
        `
    },
    {
        name: '003_create_notifications_table',
        up: `
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                type TEXT CHECK(type IN ('info', 'success', 'warning', 'error')),
                read_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
        `
    },
    {
        name: '004_create_settings_table',
        up: `
            CREATE TABLE IF NOT EXISTS settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE NOT NULL,
                value TEXT NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TRIGGER IF NOT EXISTS update_settings_timestamp 
            AFTER UPDATE ON settings
            BEGIN
                UPDATE settings SET updated_at = CURRENT_TIMESTAMP
                WHERE id = NEW.id;
            END;

            -- Insert default settings
            INSERT OR IGNORE INTO settings (key, value, description) VALUES
                ('points_multiplier', '1.0', 'Multiplier for points earned'),
                ('auto_verify_points', '5', 'Points threshold for automatic verification'),
                ('require_photo_proof', 'false', 'Require photo proof for chore completion'),
                ('allow_child_scheduling', 'true', 'Allow children to schedule their own chores');
        `
    },
    {
        name: '005_create_activity_logs_table',
        up: `
            CREATE TABLE IF NOT EXISTS activity_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                action TEXT NOT NULL,
                details TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );
        `
    }
];

// Migration runner
async function runMigrations() {
    const db = await createConnection();

    try {
        // Create migrations table
        await db.run(createMigrationTable);

        // Get executed migrations
        const executed = await new Promise((resolve, reject) => {
            db.all('SELECT name FROM migrations', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows.map(row => row.name));
            });
        });

        // Run pending migrations
        for (const migration of migrations) {
            if (!executed.includes(migration.name)) {
                console.log(`Running migration: ${migration.name}`);
                
                await db.run(migration.up);
                await db.run(
                    'INSERT INTO migrations (name, batch) VALUES (?, ?)',
                    [migration.name, 1]
                );
                
                console.log(`Completed migration: ${migration.name}`);
            }
        }

        console.log('All migrations completed successfully');
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    } finally {
        await db.close();
    }
}

// Export for CLI and testing
module.exports = { runMigrations };

// Run migrations if called directly
if (require.main === module) {
    runMigrations().catch(console.error);
}
