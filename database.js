const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');
const fs = require('fs');

// Update database path for Render's persistent storage
const dbPath = process.env.NODE_ENV === 'production'
    ? '/var/data/chore_tracker.db'
    : path.join(__dirname, 'chore_tracker.db');

// Ensure the data directory exists in production
if (process.env.NODE_ENV === 'production') {
    if (!fs.existsSync('/var/data')) {
        try {
            fs.mkdirSync('/var/data', { recursive: true });
            console.log('Created /var/data directory');
        } catch (error) {
            console.error('Error creating data directory:', error);
        }
    }
}

// Create a database connection with the new path
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to SQLite database at:', dbPath);
});

// Initialize database tables
function initializeDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            try {
                // Users table
                db.run(`
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT UNIQUE NOT NULL,
                        password TEXT NOT NULL,
                        role TEXT NOT NULL,
                        points INTEGER DEFAULT 0,
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
                        points INTEGER DEFAULT 0,
                        completed BOOLEAN DEFAULT 0,
                        verified BOOLEAN DEFAULT 0,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        completed_at DATETIME,
                        FOREIGN KEY (assigned_to) REFERENCES users(id),
                        FOREIGN KEY (created_by) REFERENCES users(id)
                    )
                `);

                // Password reset table
                db.run(`
                    CREATE TABLE IF NOT EXISTS password_resets (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        reset_token TEXT NOT NULL,
                        expires_at DATETIME NOT NULL,
                        used BOOLEAN DEFAULT 0,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id)
                    )
                `);

                // Rewards table
                db.run(`
                    CREATE TABLE IF NOT EXISTS rewards (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL,
                        description TEXT,
                        pointsCost INTEGER NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `);

                // Achievements table
                db.run(`
                    CREATE TABLE IF NOT EXISTS achievements (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL,
                        description TEXT,
                        icon TEXT NOT NULL,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `);

                // User achievements table
                db.run(`
                    CREATE TABLE IF NOT EXISTS user_achievements (
                        user_id INTEGER NOT NULL,
                        achievement_id INTEGER NOT NULL,
                        earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        PRIMARY KEY (user_id, achievement_id),
                        FOREIGN KEY (user_id) REFERENCES users(id),
                        FOREIGN KEY (achievement_id) REFERENCES achievements(id)
                    )
                `);

                // Check for default users
                db.get("SELECT COUNT(*) as count FROM users", [], async (err, row) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (row.count === 0) {
                        try {
                            await createDefaultUsers();
                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    } else {
                        resolve();
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    });
}

// Create default users
async function createDefaultUsers() {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const defaultUsers = [
        { username: 'Kelli', password: process.env.KELLI_PASSWORD || 'kelli123', role: 'parent' },
        { username: 'Kevin', password: process.env.KEVIN_PASSWORD || 'kevin123', role: 'parent' },
        { username: 'Bodhi', password: process.env.BODHI_PASSWORD || 'bodhi123', role: 'child' },
        { username: 'Holden', password: process.env.HOLDEN_PASSWORD || 'holden123', role: 'child' }
    ];

    for (const user of defaultUsers) {
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);
        await new Promise((resolve, reject) => {
            db.run(
                'INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)',
                [user.username, hashedPassword, user.role],
                (err) => {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });
    }
}

// User operations
const userOperations = {
    findByUsername: (username) => {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT * FROM users WHERE username = ?',
                [username],
                (err, row) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(err);
                    } else {
                        console.log('Found user:', row ? 'Yes' : 'No');
                        resolve(row);
                    }
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

    updatePassword(username, hashedPassword) {
        return new Promise((resolve, reject) => {
            db.run(
                'UPDATE users SET password = ? WHERE username = ?',
                [hashedPassword, username],
                function(err) {
                    if (err) reject(err);
                    else resolve(this.changes > 0);
                }
            );
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
    },

    createPasswordReset(userId) {
        return new Promise(async (resolve, reject) => {
            try {
                // Generate a secure random token
                const resetToken = require('crypto').randomBytes(32).toString('hex');
                // Token expires in 1 hour
                const expiresAt = new Date(Date.now() + 3600000).toISOString();

                db.run(
                    `INSERT INTO password_resets (user_id, reset_token, expires_at)
                     VALUES (?, ?, ?)`,
                    [userId, resetToken, expiresAt],
                    function(err) {
                        if (err) reject(err);
                        else resolve(resetToken);
                    }
                );
            } catch (err) {
                reject(err);
            }
        });
    },

    verifyResetToken(token) {
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT pr.*, u.username 
                 FROM password_resets pr
                 JOIN users u ON pr.user_id = u.id
                 WHERE pr.reset_token = ? 
                 AND pr.expires_at > datetime('now')
                 AND pr.used = 0`,
                [token],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });
    },

    resetPassword(token, newPassword) {
        return new Promise(async (resolve, reject) => {
            try {
                const resetInfo = await this.verifyResetToken(token);
                if (!resetInfo) {
                    reject(new Error('Invalid or expired reset token'));
                    return;
                }

                const hashedPassword = await bcrypt.hash(newPassword, 10);

                db.serialize(() => {
                    // Start transaction
                    db.run('BEGIN TRANSACTION');

                    // Update password
                    db.run(
                        'UPDATE users SET password = ? WHERE id = ?',
                        [hashedPassword, resetInfo.user_id]
                    );

                    // Mark reset token as used
                    db.run(
                        'UPDATE password_resets SET used = 1 WHERE reset_token = ?',
                        [token]
                    );

                    // Commit transaction
                    db.run('COMMIT', (err) => {
                        if (err) {
                            db.run('ROLLBACK');
                            reject(err);
                        } else {
                            resolve(true);
                        }
                    });
                });
            } catch (err) {
                reject(err);
            }
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

// Add migration flag check
if (process.argv.includes('--migrate')) {
    initializeDatabase()
        .then(() => {
            console.log('Database migrations completed');
            process.exit(0);
        })
        .catch(err => {
            console.error('Migration failed:', err);
            process.exit(1);
        });
}

// Add seed flag check
if (process.argv.includes('--seed')) {
    createDefaultUsers()
        .then(() => {
            console.log('Database seeding completed');
            process.exit(0);
        })
        .catch(err => {
            console.error('Seeding failed:', err);
            process.exit(1);
        });
}

module.exports = {
    db,
    initializeDatabase,
    userOperations,
    choreOperations
};
