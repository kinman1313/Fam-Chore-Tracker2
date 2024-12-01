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

// ... rest of your routes and configurations ...

// 8. Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Export for testing
module.exports = app;