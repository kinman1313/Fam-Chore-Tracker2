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
    if (users.find(user => user.username === username)) {
        return res.send('User already exists');
    }
    users.push({ username, password, role });
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.send('Invalid credentials');
    }
    req.session.user = user;
    res.redirect('/dashboard');
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.send('Error logging out');
        }
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

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});