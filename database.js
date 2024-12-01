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

// Add this near your database connection
db.on('error', (err) => {
    console.error('Database error:', err);
});

// Test database connection
db.get('SELECT 1', [], (err, row) => {
    if (err) {
        console.error('Database connection test failed:', err);
    } else {
        console.log('Database connection test successful');
    }
});

// Initialize database tables
const initializeDatabase = () => {
    return new Promise((resolve, reject) => {
        console.log('Starting database initialization...');
        
        // Create tables
        db.serialize(() => {
            // Users table
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    role TEXT NOT NULL,
                    points INTEGER DEFAULT 0,
                    avatar TEXT DEFAULT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `, (err) => {
                if (err) {
                    console.error('Error creating users table:', err);
                    reject(err);
                    return;
                }
                console.log('Users table created or already exists');
            });

            // Create default admin user if none exists
            db.get("SELECT COUNT(*) as count FROM users WHERE role = 'parent'", [], async (err, row) => {
                if (err) {
                    console.error('Error checking for admin user:', err);
                    return;
                }

                if (row.count === 0) {
                    const hashedPassword = await bcrypt.hash('admin123', 10);
                    db.run(
                        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
                        ['admin', hashedPassword, 'parent'],
                        (err) => {
                            if (err) {
                                console.error('Error creating admin user:', err);
                                return;
                            }
                            console.log('Default admin user created');
                        }
                    );
                }
            });

            resolve();
        });
    });
};

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
    findByUsername(username) {
        return new Promise((resolve, reject) => {
            console.log('Looking for user:', username);
            db.get(
                'SELECT * FROM users WHERE username = ?',
                [username],
                (err, row) => {
                    if (err) {
                        console.error('Database error:', err);
                        reject(err);
                        return;
                    }
                    console.log('User found:', row ? 'Yes' : 'No');
                    resolve(row);
                }
            );
        });
    },

    createUser(username, password, role) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('Creating user:', { username, role });
                const hashedPassword = await bcrypt.hash(password, 10);
                
                db.run(
                    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
                    [username, hashedPassword, role],
                    function(err) {
                        if (err) {
                            console.error('Database error:', err);
                            reject(err);
                            return;
                        }
                        console.log('User created with ID:', this.lastID);
                        resolve(this.lastID);
                    }
                );
            } catch (err) {
                console.error('Error in createUser:', err);
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

// Add this function to check user roles
const verifyUserRole = async (username) => {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT role FROM users WHERE username = ?',
            [username],
            (err, row) => {
                if (err) {
                    console.error('Error verifying user role:', err);
                    reject(err);
                }
                console.log('User role verification:', { username, role: row?.role });
                resolve(row?.role);
            }
        );
    });
};

// Add this to your database initialization
const verifyDatabase = () => {
    db.get("SELECT * FROM users WHERE role = 'parent' LIMIT 1", [], (err, row) => {
        if (err) {
            console.error('Database verification error:', err);
        } else {
            console.log('Found parent user:', row ? 'Yes' : 'No');
            if (row) {
                console.log('Parent user details:', {
                    id: row.id,
                    username: row.username,
                    role: row.role
                });
            }
        }
    });
};

// Call this after database initialization
verifyDatabase();

// Add this function to reset a user's password
const resetUserPassword = async (username, newPassword) => {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return new Promise((resolve, reject) => {
        db.run(
            'UPDATE users SET password = ? WHERE username = ?',
            [hashedPassword, username],
            function(err) {
                if (err) {
                    console.error('Password reset error:', err);
                    reject(err);
                    resolve(this.changes > 0);
                }
            }
        );
    });
};

module.exports = {
    db,
    initializeDatabase,
    userOperations,
    choreOperations,
    verifyUserRole,
    resetUserPassword
};
