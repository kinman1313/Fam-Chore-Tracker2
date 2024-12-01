const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database path
const dbPath = process.env.NODE_ENV === 'production' 
    ? '/var/data/familychores.db'
    : path.join(__dirname, '..', 'familychores.db');

// SQL statements for table creation
const initSQL = `
    -- Users table (existing)
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT,
        avatar TEXT DEFAULT NULL
    );

    -- Posts table (enhanced)
    CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        content TEXT,
        media_url TEXT,
        media_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        likes INTEGER DEFAULT 0,
        is_pinned BOOLEAN DEFAULT 0,
        is_archived BOOLEAN DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Comments table (enhanced)
    CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER,
        user_id INTEGER,
        content TEXT,
        media_url TEXT,
        media_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        parent_comment_id INTEGER DEFAULT NULL,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
    );

    -- Reactions table (enhanced)
    CREATE TABLE IF NOT EXISTS reactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        post_id INTEGER,
        comment_id INTEGER,
        reaction_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
        UNIQUE(user_id, post_id, comment_id, reaction_type)
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
    CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
    CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
    CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
    CREATE INDEX IF NOT EXISTS idx_reactions_post_id ON reactions(post_id);
    CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);
`;

function initializeDatabase() {
    console.log('Initializing database...');
    
    // Ensure the data directory exists in production
    if (process.env.NODE_ENV === 'production') {
        const dataDir = '/var/data';
        if (!fs.existsSync(dataDir)) {
            try {
                fs.mkdirSync(dataDir, { recursive: true, mode: 0o755 });
                console.log('Created data directory:', dataDir);
            } catch (error) {
                console.error('Error creating data directory:', error);
                // Continue execution - the error might be due to permissions
                // and the directory might already exist in the container
            }
        }
        
        // Ensure we have write permissions
        try {
            fs.accessSync(dataDir, fs.constants.W_OK);
            console.log('Data directory is writable');
        } catch (error) {
            console.error('Data directory is not writable:', error);
        }
    }

    // Create/connect to database
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Database connection error:', err);
            console.error('Database path:', dbPath);
            console.error('Current working directory:', process.cwd());
            console.error('Node environment:', process.env.NODE_ENV);
            throw err; // This will help identify issues in the Render logs
        }
        console.log('Connected to database at:', dbPath);
        
        // Run initialization SQL
        db.exec(initSQL, (err) => {
            if (err) {
                console.error('Error initializing database:', err);
                return;
            }
            console.log('Database tables created successfully');

            // Check if admin user exists
            db.get('SELECT * FROM users WHERE role = ?', ['parent'], (err, row) => {
                if (err) {
                    console.error('Error checking admin user:', err);
                    return;
                }

                if (!row) {
                    // Create default admin user if none exists
                    const bcrypt = require('bcryptjs');
                    bcrypt.hash('admin123', 10, (err, hash) => {
                        if (err) {
                            console.error('Error hashing password:', err);
                            return;
                        }

                        db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
                            ['admin', hash, 'parent'],
                            (err) => {
                                if (err) {
                                    console.error('Error creating admin user:', err);
                                    return;
                                }
                                console.log('Default admin user created');
                            }
                        );
                    });
                }
            });

            // Verify tables were created
            db.all(`SELECT name FROM sqlite_master WHERE type='table'`, [], (err, tables) => {
                if (err) {
                    console.error('Error checking tables:', err);
                    return;
                }
                console.log('Current database tables:', tables.map(t => t.name));
                
                // Optional: Check table structures
                tables.forEach(table => {
                    db.all(`PRAGMA table_info(${table.name})`, [], (err, columns) => {
                        if (err) {
                            console.error(`Error checking columns for ${table.name}:`, err);
                            return;
                        }
                        console.log(`\nTable: ${table.name}`);
                        columns.forEach(col => {
                            console.log(`  ${col.name}: ${col.type}`);
                        });
                    });
                });
            });
        });
    });
    return db;
}

module.exports = initializeDatabase;

