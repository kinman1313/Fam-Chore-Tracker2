require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./src/config/database');
const MongoStore = require('connect-mongo');

// Connect to MongoDB
connectDB()
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

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

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions'
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        title: 'Error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!' 
    });
});


const PORT = process.env.PORT || 3000;  // This will use Render's PORT or fallback to 3000 locally

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});