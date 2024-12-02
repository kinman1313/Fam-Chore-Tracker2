const db = require('../../config/database');

const up = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Users table
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    role TEXT CHECK(role IN ('parent', 'child')) NOT NULL,
                    reset_token TEXT,
                    reset_expires INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Families table
            db.run(`
                CREATE TABLE IF NOT EXISTS families (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    created_by INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(created_by) REFERENCES users(id)
                )
            `);

            // Family members table (connects users to families)
            db.run(`
                CREATE TABLE IF NOT EXISTS family_members (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    family_id INTEGER,
                    user_id INTEGER,
                    points INTEGER DEFAULT 0,
                    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(family_id) REFERENCES families(id),
                    FOREIGN KEY(user_id) REFERENCES users(id),
                    UNIQUE(family_id, user_id)
                )
            `);

            // Chores table
            db.run(`
                CREATE TABLE IF NOT EXISTS chores (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    family_id INTEGER,
                    name TEXT NOT NULL,
                    description TEXT,
                    points INTEGER DEFAULT 0,
                    frequency TEXT CHECK(frequency IN ('daily', 'weekly', 'monthly', 'once')) NOT NULL,
                    created_by INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(family_id) REFERENCES families(id),
                    FOREIGN KEY(created_by) REFERENCES users(id)
                )
            `);

            // Chore assignments table
            db.run(`
                CREATE TABLE IF NOT EXISTS chore_assignments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    chore_id INTEGER,
                    assigned_to INTEGER,
                    assigned_by INTEGER,
                    status TEXT CHECK(status IN ('pending', 'completed', 'verified', 'expired')) NOT NULL,
                    due_date DATETIME,
                    completed_at DATETIME,
                    verified_at DATETIME,
                    points_awarded INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(chore_id) REFERENCES chores(id),
                    FOREIGN KEY(assigned_to) REFERENCES users(id),
                    FOREIGN KEY(assigned_by) REFERENCES users(id)
                )
            `);

            // Rewards table
            db.run(`
                CREATE TABLE IF NOT EXISTS rewards (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    family_id INTEGER,
                    name TEXT NOT NULL,
                    description TEXT,
                    points_required INTEGER NOT NULL,
                    created_by INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(family_id) REFERENCES families(id),
                    FOREIGN KEY(created_by) REFERENCES users(id)
                )
            `);

            // Reward redemptions table
            db.run(`
                CREATE TABLE IF NOT EXISTS reward_redemptions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    reward_id INTEGER,
                    user_id INTEGER,
                    points_spent INTEGER NOT NULL,
                    status TEXT CHECK(status IN ('pending', 'approved', 'denied')) NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    approved_at DATETIME,
                    approved_by INTEGER,
                    FOREIGN KEY(reward_id) REFERENCES rewards(id),
                    FOREIGN KEY(user_id) REFERENCES users(id),
                    FOREIGN KEY(approved_by) REFERENCES users(id)
                )
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
};

const down = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('DROP TABLE IF EXISTS reward_redemptions');
            db.run('DROP TABLE IF EXISTS rewards');
            db.run('DROP TABLE IF EXISTS chore_assignments');
            db.run('DROP TABLE IF EXISTS chores');
            db.run('DROP TABLE IF EXISTS family_members');
            db.run('DROP TABLE IF EXISTS families');
            db.run('DROP TABLE IF EXISTS users', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
};

module.exports = { up, down };
