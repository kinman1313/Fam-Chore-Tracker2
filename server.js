const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bcrypt = require('bcryptjs');
const path = require('path');
const app = express();

// Basic middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Simple session setup
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({
        db: 'sessions.db',
        dir: '/var/data'
    })
}));

// Database setup
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('/var/data/chore_tracker.db');

// Create tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT,
        points INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Routes
app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', (req, res) => {
    res.render('login', { error: null, success: null });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', username);

    try {
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });

        if (!user) {
            return res.render('login', { error: 'Invalid credentials', success: null });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.render('login', { error: 'Invalid credentials', success: null });
        }

        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.userRole = user.role;

        res.redirect('/parent-dashboard');

    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { error: 'Server error', success: null });
    }
});

app.get('/parent-dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    res.render('admin', {
        username: req.session.username,
        role: req.session.userRole
    });
});

app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// Create test user
app.get('/setup', async (req, res) => {
    try {
        const password = await bcrypt.hash('123123', 10);
        db.run('INSERT OR REPLACE INTO users (username, password, role) VALUES (?, ?, ?)',
            ['parent', password, 'parent'],
            (err) => {
                if (err) {
                    console.error('Setup error:', err);
                    return res.status(500).send('Error creating test user');
                }
                res.send('Test user created: parent/123123');
            });
    } catch (error) {
        console.error('Setup error:', error);
        res.status(500).send('Error creating test user');
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});