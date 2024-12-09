require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const sessionMiddleware = require('./src/config/session');
const passport = require('passport');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./src/config/database');

// Import routes
const authRoutes = require('./src/routes/auth');
const choreRoutes = require('./src/routes/chores');

const app = express();

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "https:"],
            "script-src": ["'self'", "'unsafe-inline'"],
            "style-src": ["'self'", "'unsafe-inline'"]
        }
    }
}));
app.use(cors());

// Basic Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Static Files
app.use(express.static('public'));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
    res.render('layout', { 
        title: 'Family Chore Tracker',
        content: 'Welcome to Family Chore Tracker'
    });
});

// Use route modules
app.use('/auth', authRoutes);
app.use('/chores', choreRoutes);

// Connect to Database
connectDB();

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        title: 'Error',
        error: 'Something went wrong!' 
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
