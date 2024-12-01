// 1. Required modules
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// 2. Initialize express app
const app = express();

// 3. Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 4. View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 5. Session configuration
app.use(session({
    store: new SQLiteStore({
        db: 'sessions.db',
        dir: process.env.NODE_ENV === 'production' ? '/var/data' : '.'
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

// 6. Database setup
const dbPath = process.env.NODE_ENV === 'production' 
    ? '/var/data/familychores.db'
    : path.join(__dirname, 'familychores.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        process.exit(1);
    }
    console.log('Connected to database at:', dbPath);
});

// 7. Email configuration
const transporter = process.env.NODE_ENV === 'production' ? nodemailer.createTransport({
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
        const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
        
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

// 8. Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Export for testing
module.exports = app;