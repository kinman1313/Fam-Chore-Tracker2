require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bcrypt = require('bcryptjs');
const { initializeDatabase, userOperations, choreOperations, rewardOperations } = require('./database');
const multer = require('multer');
const path = require('path');
const moment = require('moment');
const { createNotification, getNotifications, markNotificationRead } = require('./notifications');
const { calculateStats, updateRewardPoints } = require('./statistics');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
initializeDatabase();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
    store: new SQLiteStore({
        db: 'sessions.db',
        dir: './'
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(express.static('public'));
app.set('view engine', 'ejs');

// Authentication Middleware
const authenticateUser = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

const authenticateParent = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'parent') {
        return res.status(403).json({ error: 'Only parents can perform this action' });
    }
    next();
};

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, `${req.session.user.username}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Images only!'));
    }
});

// Routes
app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    res.render('login', { error: null, success: null });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const user = await userOperations.findByUsername(username);
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.render('login', {
                error: 'Invalid username or password',
                username
            });
        }
        
        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role
        };
        
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', {
            error: 'An error occurred during login',
            username
        });
    }
});

app.get('/signup', async (req, res) => {
    try {
        const children = await userOperations.getAllChildren();
        res.render('signup', { error: null, children });
    } catch (error) {
        console.error('Error loading signup page:', error);
        res.render('signup', { error: 'Error loading page', children: [] });
    }
});

app.post('/signup', async (req, res) => {
    const { username, password, role } = req.body;
    
    try {
        const existingUser = await userOperations.findByUsername(username);
        
        if (existingUser) {
            return res.render('signup', {
                error: 'Username already exists',
                username
            });
        }
        
        await userOperations.createUser(username, password, role);
        
        res.render('login', {
            success: 'Account created successfully! Please log in.',
            username
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.render('signup', {
            error: 'Error creating account',
            username
        });
    }
});

app.get('/reset-password', (req, res) => {
    res.render('reset-password', { error: null, success: null });
});

app.post('/reset-password', async (req, res) => {
    try {
        const { username, currentPassword, newPassword, confirmPassword } = req.body;

        // Server-side validation
        if (!username || !currentPassword || !newPassword || !confirmPassword) {
            return res.render('reset-password', {
                error: 'All fields are required',
                username
            });
        }

        if (newPassword.length < 6) {
            return res.render('reset-password', {
                error: 'New password must be at least 6 characters long',
                username
            });
        }

        if (newPassword !== confirmPassword) {
            return res.render('reset-password', {
                error: 'New passwords do not match',
                username
            });
        }

        // Find user and verify current password
        const user = await userOperations.findByUsername(username);
        if (!user) {
            return res.render('reset-password', {
                error: 'Invalid username or current password',
                username
            });
        }

        // Verify current password
        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res.render('reset-password', {
                error: 'Invalid username or current password',
                username
            });
        }

        // Ensure new password is different
        if (currentPassword === newPassword) {
            return res.render('reset-password', {
                error: 'New password must be different from current password',
                username
            });
        }

        // Update password
        await userOperations.updatePassword(username, newPassword);

        // Redirect to login with success message
        req.session.flashMessage = {
            type: 'success',
            text: 'Password successfully updated. Please login with your new password.'
        };
        res.redirect('/login');

    } catch (error) {
        console.error('Password reset error:', error);
        res.render('reset-password', {
            error: 'An error occurred while resetting your password',
            username: req.body.username
        });
    }
});

app.get('/dashboard', authenticateUser, async (req, res) => {
    try {
        const chores = await choreOperations.getChoresForUser(
            req.session.user.id,
            req.session.user.role
        );
        
        const children = req.session.user.role === 'parent' 
            ? await userOperations.getAllChildren()
            : [];
        
        res.render(req.session.user.role === 'parent' ? 'admin' : 'child', {
            chores,
            children,
            username: req.session.user.username
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).send('Error loading dashboard');
    }
});

app.post('/add-chore', authenticateParent, async (req, res) => {
    const { choreName, assignedTo } = req.body;
    
    try {
        await choreOperations.create(
            choreName,
            assignedTo,
            req.session.user.id
        );
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error adding chore:', error);
        res.status(500).json({ error: 'Error adding chore' });
    }
});

app.post('/toggle-chore/:id', authenticateUser, async (req, res) => {
    const choreId = parseInt(req.params.id);
    
    try {
        const result = await choreOperations.toggleCompletion(
            choreId,
            req.session.user.id,
            req.session.user.role
        );
        res.json(result);
    } catch (error) {
        console.error('Error toggling chore:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/delete-chore/:id', authenticateParent, async (req, res) => {
    const choreId = parseInt(req.params.id);
    
    try {
        await choreOperations.delete(choreId);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting chore:', error);
        res.status(500).json({ error: 'Error deleting chore' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send('Error logging out');
        }
        res.redirect('/login');
    });
});

// Profile Routes
app.get('/profile', authenticateUser, async (req, res) => {
    try {
        const user = await userOperations.getFullProfile(req.session.user.id);
        const stats = await calculateStats(req.session.user.id);
        const rewards = await userOperations.getUserRewards(req.session.user.id);
        
        res.render('profile', {
            user,
            stats,
            rewards,
            moment
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).send('Error loading profile');
    }
});

app.post('/profile/update', authenticateUser, upload.single('avatar'), async (req, res) => {
    try {
        const updates = {
            displayName: req.body.displayName,
            bio: req.body.bio,
            avatar: req.file ? `/uploads/${req.file.filename}` : undefined
        };
        
        await userOperations.updateProfile(req.session.user.id, updates);
        res.redirect('/profile');
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).send('Error updating profile');
    }
});

// Rewards System
app.post('/rewards/redeem/:rewardId', authenticateUser, async (req, res) => {
    try {
        const reward = await userOperations.getReward(req.params.rewardId);
        const userPoints = await userOperations.getUserPoints(req.session.user.id);
        
        if (userPoints < reward.pointsCost) {
            return res.status(400).json({ error: 'Insufficient points' });
        }
        
        await userOperations.redeemReward(req.session.user.id, reward.id);
        await createNotification({
            userId: req.session.user.id,
            type: 'reward_redeemed',
            message: `You redeemed ${reward.name} for ${reward.pointsCost} points!`
        });
        
        res.json({ success: true, remainingPoints: userPoints - reward.pointsCost });
    } catch (error) {
        console.error('Reward redemption error:', error);
        res.status(500).json({ error: 'Error redeeming reward' });
    }
});

// Parent Reward Management
app.post('/rewards/create', authenticateParent, async (req, res) => {
    try {
        const { name, description, pointsCost } = req.body;
        await userOperations.createReward({ name, description, pointsCost });
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Reward creation error:', error);
        res.status(500).send('Error creating reward');
    }
});

// Notifications
app.get('/notifications', authenticateUser, async (req, res) => {
    try {
        const notifications = await getNotifications(req.session.user.id);
        res.json(notifications);
    } catch (error) {
        console.error('Notifications error:', error);
        res.status(500).json({ error: 'Error loading notifications' });
    }
});

app.post('/notifications/read/:id', authenticateUser, async (req, res) => {
    try {
        await markNotificationRead(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Notification update error:', error);
        res.status(500).json({ error: 'Error updating notification' });
    }
});

// Statistics and Reports
app.get('/statistics', authenticateUser, async (req, res) => {
    try {
        const timeframe = req.query.timeframe || 'week';
        const stats = await calculateStats(req.session.user.id, timeframe);
        res.json(stats);
    } catch (error) {
        console.error('Statistics error:', error);
        res.status(500).json({ error: 'Error loading statistics' });
    }
});

// Enhanced Chore Routes
app.post('/chore/complete/:id', authenticateUser, async (req, res) => {
    try {
        const { proof } = req.body; // Optional completion proof
        const result = await choreOperations.completeChore(
            req.params.id,
            req.session.user.id,
            proof
        );
        
        // Update points and create notification
        await updateRewardPoints(req.session.user.id, result.pointsEarned);
        await createNotification({
            userId: result.parentId,
            type: 'chore_completed',
            message: `${req.session.user.username} completed ${result.choreName}`
        });
        
        res.json({ 
            success: true, 
            pointsEarned: result.pointsEarned 
        });
    } catch (error) {
        console.error('Chore completion error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/chore/verify/:id', authenticateParent, async (req, res) => {
    try {
        const { verified } = req.body;
        const result = await choreOperations.verifyChore(
            req.params.id,
            verified
        );
        
        // Create notification for child
        await createNotification({
            userId: result.childId,
            type: verified ? 'chore_verified' : 'chore_rejected',
            message: verified 
                ? `Your chore "${result.choreName}" was verified!`
                : `Your chore "${result.choreName}" needs attention`
        });
        
        res.json({ success: true });
    } catch (error) {
        console.error('Chore verification error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Recurring Chores
app.post('/chore/recurring', authenticateParent, async (req, res) => {
    try {
        const { 
            choreName, 
            assignedTo, 
            frequency, 
            startDate,
            endDate 
        } = req.body;
        
        await choreOperations.createRecurringChore({
            name: choreName,
            assignedTo,
            frequency,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
            createdBy: req.session.user.id
        });
        
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Recurring chore creation error:', error);
        res.status(500).send('Error creating recurring chore');
    }
});

// Family Calendar
app.get('/calendar', authenticateUser, async (req, res) => {
    try {
        const month = parseInt(req.query.month) || new Date().getMonth();
        const year = parseInt(req.query.year) || new Date().getFullYear();
        
        const events = await choreOperations.getCalendarEvents(
            req.session.user.id,
            req.session.user.role,
            month,
            year
        );
        
        res.json(events);
    } catch (error) {
        console.error('Calendar error:', error);
        res.status(500).json({ error: 'Error loading calendar' });
    }
});

// Request password reset
app.post('/request-reset', async (req, res) => {
    try {
        const { username } = req.body;
        const user = await userOperations.findByUsername(username);
        
        if (user) {
            const resetToken = await userOperations.createPasswordReset(user.id);
            
            // In a real application, you would send this via email
            // For now, we'll just send it in the response
            res.json({ 
                message: 'Password reset link generated',
                resetLink: `/reset-password/${resetToken}`
            });
        } else {
            // Don't reveal if user exists or not
            res.json({ 
                message: 'If an account exists with this username, a password reset link will be sent.'
            });
        }
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ error: 'Error processing reset request' });
    }
});

// Reset password form
app.get('/reset-password/:token', async (req, res) => {
    try {
        const resetInfo = await userOperations.verifyResetToken(req.params.token);
        if (resetInfo) {
            res.render('reset-password', { 
                token: req.params.token,
                username: resetInfo.username
            });
        } else {
            res.status(400).render('error', { 
                message: 'Invalid or expired reset token'
            });
        }
    } catch (error) {
        console.error('Reset form error:', error);
        res.status(500).render('error', { 
            message: 'Error loading reset form'
        });
    }
});

// Process password reset
app.post('/reset-password/:token', async (req, res) => {
    try {
        const { password, confirmPassword } = req.body;
        const { token } = req.params;

        if (password !== confirmPassword) {
            return res.status(400).json({ 
                error: 'Passwords do not match'
            });
        }

        const success = await userOperations.resetPassword(token, password);
        if (success) {
            res.json({ 
                message: 'Password reset successful'
            });
        } else {
            res.status(400).json({ 
                error: 'Unable to reset password'
            });
        }
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ 
            error: 'Error resetting password'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Add these routes if not present
app.post('/chores/:id/toggle', async (req, res) => {
    try {
        const result = await choreOperations.toggleCompletion(
            req.params.id,
            req.user.id,
            req.user.role
        );
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.post('/rewards/:id/redeem', async (req, res) => {
    try {
        const result = await rewardOperations.redeem(
            req.params.id,
            req.user.id
        );
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});