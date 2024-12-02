const db = require('../../config/database');

module.exports = {
    up: () => {
        return new Promise((resolve, reject) => {
            const queries = [
                `CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT NOT NULL UNIQUE,
                    email TEXT NOT NULL UNIQUE,
                    password TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`,
                
                `CREATE TABLE IF NOT EXISTS families (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )`,
                
                `CREATE TABLE IF NOT EXISTS family_members (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    family_id INTEGER,
                    user_id INTEGER,
                    role TEXT CHECK(role IN ('parent', 'child')) NOT NULL,
                    FOREIGN KEY (family_id) REFERENCES families (id),
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )`,
                
                `CREATE TABLE IF NOT EXISTS chores (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    family_id INTEGER,
                    name TEXT NOT NULL,
                    description TEXT,
                    points INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (family_id) REFERENCES families (id)
                )`,
                
                `CREATE TABLE IF NOT EXISTS chore_assignments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    chore_id INTEGER,
                    assigned_to INTEGER,
                    assigned_by INTEGER,
                    status TEXT CHECK(status IN ('pending', 'completed', 'verified')) DEFAULT 'pending',
                    points_awarded INTEGER DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    completed_at DATETIME,
                    verified_at DATETIME,
                    FOREIGN KEY (chore_id) REFERENCES chores (id),
                    FOREIGN KEY (assigned_to) REFERENCES users (id),
                    FOREIGN KEY (assigned_by) REFERENCES users (id)
                )`,
                
                `CREATE TABLE IF NOT EXISTS rewards (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    family_id INTEGER,
                    name TEXT NOT NULL,
                    description TEXT,
                    points_required INTEGER NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (family_id) REFERENCES families (id)
                )`
            ];

            const runQuery = (index) => {
                if (index >= queries.length) {
                    resolve();
                    return;
                }

                db.run(queries[index], (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    runQuery(index + 1);
                });
            };

            runQuery(0);
        });
    },

    down: () => {
        return new Promise((resolve, reject) => {
            const tables = [
                'rewards',
                'chore_assignments',
                'chores',
                'family_members',
                'families',
                'users'
            ];

            const dropTable = (index) => {
                if (index >= tables.length) {
                    resolve();
                    return;
                }

                db.run(`DROP TABLE IF EXISTS ${tables[index]}`, (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    dropTable(index + 1);
                });
            };

            dropTable(0);
        });
    }
};
