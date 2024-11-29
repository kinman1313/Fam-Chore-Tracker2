const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

// Create a database connection
const db = new sqlite3.Database(path.join(__dirname, 'chore_tracker.db'), (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to SQLite database');
});

// Initialize database tables
function initializeDatabase() {
    db.serialize(() => {
        // Users table
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Chores table
        db.run(`
            CREATE TABLE IF NOT EXISTS chores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                assigned_to INTEGER NOT NULL,
                created_by INTEGER NOT NULL,
                completed BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                completed_at DATETIME,
                FOREIGN KEY (assigned_to) REFERENCES users(id),
                FOREIGN KEY (created_by) REFERENCES users(id)
            )
        `);

        // Check if we need to create default users
        db.get("SELECT COUNT(*) as count FROM users", [], (err, row) => {
            if (err) {
                console.error('Error checking users:', err);
                return;
            }

            if (row.count === 0) {
                createDefaultUsers();
            }
        });
    });
}

// Create default users
async function createDefaultUsers() {
    const defaultUsers = [
        { username: 'parent', password: 'parent123', role: 'parent' },
        { username: 'child', password: 'child123', role: 'child' },
        { username: 'bodhi', password: 'bodhi123', role: 'child' },
        { username: 'holden', password: 'holden123', role: 'child' },
        { username: 'Kelli', password: 'kelli123', role: 'parent' },
        { username: 'Kevin', password: 'kevin123', role: 'parent' }
    ];

    for (const user of defaultUsers) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        db.run(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [user.username, hashedPassword, user.role],
            (err) => {
                if (err) console.error('Error creating default user:', err);
            }
        );
    }
}

// User operations
const userOperations = {
    findByUsername(username) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM users WHERE LOWER(username) = LOWER(?)',
                [username],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                }
            );
        });
    },

    createUser(username, password, role) {
        return new Promise(async (resolve, reject) => {
            try {
                const hashedPassword = await bcrypt.hash(password, 10);
                db.run(
                    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
                    [username, hashedPassword, role],
                    function(err) {
                        if (err) reject(err);
                        resolve(this.lastID);
                    }
                );
            } catch (err) {
                reject(err);
            }
        });
    },

    updatePassword(username, newPassword) {
        return new Promise(async (resolve, reject) => {
            try {
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                db.run(
                    'UPDATE users SET password = ? WHERE LOWER(username) = LOWER(?)',
                    [hashedPassword, username],
                    function(err) {
                        if (err) reject(err);
                        resolve(this.changes > 0);
                    }
                );
            } catch (err) {
                reject(err);
            }
        });
    },

    getAllChildren() {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT id, username FROM users WHERE role = ?',
                ['child'],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                }
            );
        });
    }
};

// Chore operations
const choreOperations = {
    create(name, assignedToId, createdById) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO chores (name, assigned_to, created_by) 
                 VALUES (?, ?, ?)`,
                [name, assignedToId, createdById],
                function(err) {
                    if (err) reject(err);
                    resolve(this.lastID);
                }
            );
        });
    },

    getChoresForUser(userId, role) {
        return new Promise((resolve, reject) => {
            const query = role === 'parent' 
                ? 'SELECT c.*, u.username as assigned_to_name FROM chores c JOIN users u ON c.assigned_to = u.id'
                : `SELECT c.*, u.username as assigned_to_name 
                   FROM chores c 
                   JOIN users u ON c.assigned_to = u.id 
                   WHERE c.assigned_to = ?`;
            
            const params = role === 'parent' ? [] : [userId];
            
            db.all(query, params, (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    toggleCompletion(choreId, userId, role) {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.get(
                    `SELECT c.*, u.role 
                     FROM chores c 
                     JOIN users u ON c.assigned_to = u.id 
                     WHERE c.id = ?`,
                    [choreId],
                    (err, chore) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        if (!chore) {
                            reject(new Error('Chore not found'));
                            return;
                        }

                        if (role !== 'parent' && chore.assigned_to !== userId) {
                            reject(new Error('Not authorized'));
                            return;
                        }

                        const completedAt = !chore.completed ? new Date().toISOString() : null;
                        
                        db.run(
                            `UPDATE chores 
                             SET completed = NOT completed, 
                                 completed_at = ? 
                             WHERE id = ?`,
                            [completedAt, choreId],
                            function(err) {
                                if (err) reject(err);
                                resolve({ 
                                    success: true, 
                                    completed: !chore.completed 
                                });
                            }
                        );
                    }
                );
            });
        });
    },

    delete(choreId) {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM chores WHERE id = ?', [choreId], function(err) {
                if (err) reject(err);
                resolve(this.changes > 0);
            });
        });
    }
};

module.exports = {
    db,
    initializeDatabase,
    userOperations,
    choreOperations
};
