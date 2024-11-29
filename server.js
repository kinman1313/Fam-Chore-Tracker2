require('dotenv').config();
console.log('Port:', process.env.PORT);

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));
app.use(express.static('public'));
app.use(express.json());

// Authentication Middleware
const authenticateUser = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Please log in to continue' });
    }
    next();
};

const authenticateParent = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'parent') {
        return res.status(403).json({ error: 'Only parents can perform this action' });
    }
    next();
};

// In-memory storage for simplicity
let users = [];
let chores = [];

// Add default users for testing
users.push({
    username: 'parent',
    password: 'parent123',
    role: 'parent'
});

users.push({
    username: 'child',
    password: 'child123',
    role: 'child'
});

users.push({
    username: 'bodhi',
    password: 'bodhi123',
    role: 'child'
});

users.push({
    username: 'holden',
    password: 'holden123',
    role: 'child'
});

users.push({
    username: 'Kelli',
    password: 'kelli123',
    role: 'parent'
});

users.push({
    username: 'Kevin',
    password: 'kevin123',
    role: 'parent'
});

// EJS setup
app.set('view engine', 'ejs');

// Routes
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', (req, res) => {
    const { username, password, role } = req.body;
    
    // Validate input
    if (!username || !password || !role) {
        return res.render('signup', { 
            error: 'All fields are required',
            username
        });
    }
    
    // Username validation
    if (username.length < 3) {
        return res.render('signup', {
            error: 'Username must be at least 3 characters long',
            username
        });
    }
    
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
        return res.render('signup', {
            error: 'Username can only contain letters and numbers',
            username
        });
    }
    
    // Password validation
    if (password.length < 6) {
        return res.render('signup', {
            error: 'Password must be at least 6 characters long',
            username
        });
    }
    
    // Check for existing username (case-insensitive)
    if (users.some(user => user.username.toLowerCase() === username.toLowerCase())) {
        return res.render('signup', {
            error: 'Username already exists',
            username
        });
    }
    
    // Create new user
    const newUser = {
        username,
        password,
        role,
        createdAt: new Date()
    };
    
    users.push(newUser);
    console.log('New user created:', {
        username: newUser.username,
        role: newUser.role,
        createdAt: newUser.createdAt
    });
    
    // Redirect to login with success message
    res.render('login', { 
        success: 'Account created successfully! Please log in.',
        username
    });
});

app.get('/login', (req, res) => {
    // If user is already logged in, redirect to dashboard
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username }); // Don't log passwords
    
    // Convert username to lowercase for case-insensitive comparison
    const user = users.find(u => 
        u.username.toLowerCase() === username.toLowerCase() && 
        u.password === password
    );
    
    if (!user) {
        console.log('Login failed for:', username);
        return res.render('login', { 
            error: 'Invalid username or password',
            username // Preserve the username in the form
        });
    }
    
    // Set session
    req.session.user = {
        id: Date.now(), // Temporary ID
        username: user.username,
        role: user.role
    };
    
    console.log('Login successful for:', username);
    res.redirect('/dashboard');
});

app.get('/logout', (req, res) => {
    const username = req.session.user?.username;
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send('Error logging out');
        }
        console.log('Logout successful for:', username);
        res.redirect('/login');
    });
});

app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    if (req.session.user.role === 'parent') {
        res.render('admin', { chores });
    } else if (req.session.user.role === 'child') {
        const userChores = chores.filter(chore => chore.assignedTo.toLowerCase() === req.session.user.username.toLowerCase());
        res.render('child', { chores: userChores });
    }
});

app.post('/add-chore', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'parent') {
        return res.redirect('/login');
    }
    const { choreName, assignedTo } = req.body;
    if (choreName && assignedTo) {
        chores.push({ 
            id: Date.now(),
            name: choreName, 
            assignedTo: assignedTo,
            completed: false,
            createdAt: new Date()
        });
    }
    res.redirect('/dashboard');
});

app.post('/send-message', (req, res) => {
    const { message } = req.body;
    if (message) {
        // Simulate bot response
        setTimeout(() => {
            res.json({ sender: 'Bot', message: `Reminder: Don't forget about your chores!` });
        }, 1000);
    } else {
        res.json({ sender: 'Bot', message: 'Please type a message' });
    }
});

// Delete chore (admin only)
app.delete('/delete-chore/:id', authenticateParent, (req, res) => {
    try {
        const choreId = parseInt(req.params.id);
        const choreIndex = chores.findIndex(chore => chore.id === choreId);
        
        if (choreIndex === -1) {
            return res.status(404).json({ error: 'Chore not found' });
        }
        
        chores.splice(choreIndex, 1);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting chore' });
    }
});

// Toggle chore completion (child)
app.post('/toggle-chore/:id', authenticateUser, (req, res) => {
    try {
        const choreId = parseInt(req.params.id);
        const chore = chores.find(c => c.id === choreId);
        
        if (!chore) {
            return res.status(404).json({ error: 'Chore not found' });
        }
        
        // Only allow if the chore is assigned to the logged-in user or if user is parent
        if (req.session.user.role !== 'parent' && 
            chore.assignedTo.toLowerCase() !== req.session.user.username.toLowerCase()) {
            return res.status(403).json({ error: 'Not authorized to modify this chore' });
        }
        
        chore.completed = !chore.completed;
        chore.completedAt = chore.completed ? new Date() : null;
        
        res.json({ success: true, completed: chore.completed });
    } catch (error) {
        res.status(500).json({ error: 'Error updating chore' });
    }
});

// Add a route to check session status
app.get('/check-session', (req, res) => {
    if (req.session.user) {
        res.json({
            loggedIn: true,
            user: {
                username: req.session.user.username,
                role: req.session.user.role
            }
        });
    } else {
        res.json({ loggedIn: false });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});