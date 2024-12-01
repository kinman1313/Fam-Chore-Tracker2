// Environment and configuration constants - MUST BE AT TOP
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Required modules
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Database configuration
const dbPath = NODE_ENV === 'production' 
    ? '/var/data/familychores.db'
    : path.join(__dirname, 'familychores.db');

// Initialize express app
const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session configuration
app.use(session({
    store: new SQLiteStore({
        db: 'sessions.db',
        dir: NODE_ENV === 'production' ? '/var/data' : '.'
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24
    }
}));

// Database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
    console.log('Connected to database at:', dbPath);
});

// Email configuration
const transporter = NODE_ENV === 'production' ? nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_APP_PASSWORD || ''
    }
}) : {
    sendMail: (options) => {
        console.log('Development mode - Email would have been sent:', options);
        return Promise.resolve({ success: true });
    }
};

// After your requires, before setting up routes
async function initializeDatabase() {
    const initSQL = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS sessions (
            sid TEXT PRIMARY KEY,
            sess TEXT NOT NULL,
            expired DATETIME NOT NULL
        );

        CREATE TABLE IF NOT EXISTS password_resets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT NOT NULL,
            expires_at DATETIME NOT NULL,
            used BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS chores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            assigned_to INTEGER,
            created_by INTEGER,
            due_date DATETIME,
            completed BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (assigned_to) REFERENCES users(id),
            FOREIGN KEY (created_by) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS activity (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            type TEXT NOT NULL,
            description TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            read BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    `;

    return new Promise((resolve, reject) => {
        db.exec(initSQL, (err) => {
            if (err) {
                console.error('Database initialization error:', err);
                reject(err);
            } else {
                console.log('Database tables created successfully');
                resolve();
            }
        });
    });
}

// Server startup function
async function startServer() {
    try {
        await initializeDatabase();
        
        // Create default admin user if none exists
        const admin = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE role = ?', ['parent'], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (!admin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await new Promise((resolve, reject) => {
                db.run(
                    'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
                    ['admin', hashedPassword, 'parent'],
                    (err) => {
                        if (err) reject(err);
                        resolve();
                    }
                );
            });
            console.log('Default admin user created');
        }

        return new Promise((resolve, reject) => {
            const server = app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
                console.log(`Environment: ${NODE_ENV}`);
                console.log(`Database path: ${dbPath}`);
                resolve(server);
            }).on('error', reject);
        });
    } catch (error) {
        console.error('Server startup error:', error);
        process.exit(1);
    }
}

// Start the server with proper error handling
startServer().catch(error => {
    console.error('Fatal error during startup:', error);
    process.exit(1);
});

// Home route
app.get('/', (req, res) => {
    if (req.session.userId) {
        res.redirect('/admin'); // Redirect logged-in users to dashboard
    } else {
        res.redirect('/login'); // Redirect others to login
    }
});

// Login route
app.get('/login', (req, res) => {
    if (req.session.userId) {
        res.redirect('/admin');
        return;
    }
    res.render('login');
});

// Admin/Dashboard route
app.get('/admin', (req, res) => {
    if (!req.session.userId) {
        res.redirect('/login');
        return;
    }
    res.render('admin', {
        username: req.session.username,
        role: req.session.userRole
    });
});

// Login POST handler
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        req.session.userId = user.id;
        req.session.userRole = user.role;
        req.session.username = user.username;

        res.json({ success: true });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/login');
    });
});

// Register route
app.get('/register', (req, res) => {
    if (req.session.userId) {
        res.redirect('/admin');
        return;
    }
    res.render('register');
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        message: 'Something broke!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', { 
        message: 'Page not found',
        error: { status: 404 }
    });
});

// Registration API endpoint
app.post('/api/register', async (req, res) => {
    const { username, password, role } = req.body;
    
    // Input validation
    if (!username || !password || !role) {
        return res.status(400).json({ 
            success: false, 
            error: 'All fields are required' 
        });
    }

    // Role validation
    if (!['parent', 'child'].includes(role)) {
        return res.status(400).json({ 
            success: false, 
            error: 'Invalid role specified' 
        });
    }

    try {
        // Check if username already exists
        const existingUser = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM users WHERE username = ?', [username], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                error: 'Username already exists' 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user
        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
                [username, hashedPassword, role],
                function(err) {
                    if (err) reject(err);
                    resolve(this.lastID);
                }
            );
        });

        // Log success
        console.log('New user registered:', username, role);

        // Return success response
        res.json({ 
            success: true, 
            message: 'Registration successful' 
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Registration failed' 
        });
    }
});

// Add this middleware before your routes to log requests
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        console.log('API Request:', {
            method: req.method,
            path: req.path,
            body: req.body,
            timestamp: new Date().toISOString()
        });
    }
    next();
});

// API Routes

// Get Chores
app.get('/api/chores', async (req, res) => {
    try {
        const chores = await new Promise((resolve, reject) => {
            db.all('SELECT * FROM chores ORDER BY created_at DESC', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows || []);
            });
        });
        res.json(chores);
    } catch (error) {
        console.error('Error fetching chores:', error);
        res.status(500).json({ error: 'Failed to fetch chores' });
    }
});

// Get Family Members
app.get('/api/family-members', async (req, res) => {
    try {
        const members = await new Promise((resolve, reject) => {
            db.all('SELECT id, username, role FROM users ORDER BY username', [], (err, rows) => {
                if (err) reject(err);
                resolve(rows || []);
            });
        });
        res.json(members);
    } catch (error) {
        console.error('Error fetching family members:', error);
        res.status(500).json({ error: 'Failed to fetch family members' });
    }
});

// Get Activity
app.get('/api/activity', async (req, res) => {
    try {
        const activity = await new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    a.id,
                    a.type,
                    a.description,
                    a.created_at,
                    u.username
                FROM activity a
                LEFT JOIN users u ON a.user_id = u.id
                ORDER BY a.created_at DESC
                LIMIT 10
            `, [], (err, rows) => {
                if (err) reject(err);
                resolve(rows || []);
            });
        });
        res.json(activity);
    } catch (error) {
        console.error('Error fetching activity:', error);
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
});

// Get Notifications
app.get('/api/notifications', async (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const notifications = await new Promise((resolve, reject) => {
            db.all(`
                SELECT * FROM notifications 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT 10
            `, [req.session.userId], (err, rows) => {
                if (err) reject(err);
                resolve(rows || []);
            });
        });
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Export for testing
module.exports = { app, db };