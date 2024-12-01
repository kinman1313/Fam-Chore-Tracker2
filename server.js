const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const bcrypt = require('bcryptjs');
const path = require('path');
const app = express();
const nodemailer = require('nodemailer');
const webpush = require('web-push');
const schedule = require('node-schedule');

// Basic middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Add Bootstrap and modern UI dependencies
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));

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

// Notifications table
db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)`);

// Rewards table
db.run(`CREATE TABLE IF NOT EXISTS rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    points_required INTEGER NOT NULL,
    image_url TEXT,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Reward claims table
db.run(`CREATE TABLE IF NOT EXISTS reward_claims (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reward_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reward_id) REFERENCES rewards(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
)`);

// Scheduled chores table
db.run(`CREATE TABLE IF NOT EXISTS scheduled_chores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chore_id INTEGER NOT NULL,
    user_id INTEGER,
    frequency TEXT NOT NULL,
    day_of_week TEXT,
    time_of_day TEXT,
    start_date DATE,
    end_date DATE,
    last_generated DATETIME,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chore_id) REFERENCES chores(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
)`);

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

// Notification routes
app.get('/api/notifications', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });

    db.all(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
        [req.session.userId],
        (err, rows) => {
            if (err) {
                console.error('Error fetching notifications:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json(rows);
        }
    );
});

app.post('/api/notifications/mark-read', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: 'Unauthorized' });

    const { notificationId } = req.body;
    db.run(
        'UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?',
        [notificationId, req.session.userId],
        (err) => {
            if (err) {
                console.error('Error marking notification as read:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ success: true });
        }
    );
});

// Reward routes
app.get('/api/rewards', (req, res) => {
    db.all('SELECT * FROM rewards WHERE active = 1', [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

app.post('/api/rewards', (req, res) => {
    if (req.session.userRole !== 'parent') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, description, points_required, image_url } = req.body;
    db.run(
        'INSERT INTO rewards (title, description, points_required, image_url) VALUES (?, ?, ?, ?)',
        [title, description, points_required, image_url],
        function(err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ id: this.lastID, title, description, points_required, image_url });
        }
    );
});

app.post('/api/rewards/claim', async (req, res) => {
    const { reward_id } = req.body;
    const user_id = req.session.userId;

    try {
        // Check if user has enough points
        const user = await db.get('SELECT points FROM users WHERE id = ?', [user_id]);
        const reward = await db.get('SELECT points_required FROM rewards WHERE id = ?', [reward_id]);

        if (user.points < reward.points_required) {
            return res.status(400).json({ error: 'Not enough points' });
        }

        // Create claim and deduct points
        await db.run('BEGIN TRANSACTION');
        await db.run(
            'INSERT INTO reward_claims (reward_id, user_id) VALUES (?, ?)',
            [reward_id, user_id]
        );
        await db.run(
            'UPDATE users SET points = points - ? WHERE id = ?',
            [reward.points_required, user_id]
        );
        await db.run('COMMIT');

        // Create notification for parent
        await createNotification(
            parentUserId, 
            'reward_claim',
            `${req.session.username} has claimed a reward: ${reward.title}`
        );

        res.json({ success: true });
    } catch (error) {
        await db.run('ROLLBACK');
        res.status(500).json({ error: 'Database error' });
    }
});

// Scheduling routes
app.post('/api/chores/schedule', (req, res) => {
    if (req.session.userRole !== 'parent') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
        chore_id,
        user_id,
        frequency,
        day_of_week,
        time_of_day,
        start_date,
        end_date
    } = req.body;

    db.run(
        `INSERT INTO scheduled_chores (
            chore_id, user_id, frequency, day_of_week, 
            time_of_day, start_date, end_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [chore_id, user_id, frequency, day_of_week, time_of_day, start_date, end_date],
        function(err) {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ id: this.lastID, ...req.body });
        }
    );
});

// Chore generation function (run this periodically)
async function generateScheduledChores() {
    const now = new Date();
    
    try {
        const scheduledChores = await db.all(`
            SELECT * FROM scheduled_chores 
            WHERE active = 1 
            AND (last_generated IS NULL OR 
                 datetime(last_generated) <= datetime('now', '-1 day'))
            AND (end_date IS NULL OR date(end_date) >= date('now'))
        `);

        for (const schedule of scheduledChores) {
            if (shouldGenerateChore(schedule, now)) {
                await generateChoreInstance(schedule);
                await updateLastGenerated(schedule.id);
            }
        }
    } catch (error) {
        console.error('Error generating chores:', error);
    }
}

function shouldGenerateChore(schedule, now) {
    const dayOfWeek = now.getDay();
    switch (schedule.frequency) {
        case 'daily':
            return true;
        case 'weekly':
            return schedule.day_of_week === dayOfWeek.toString();
        case 'monthly':
            return now.getDate() === parseInt(schedule.day_of_week);
        default:
            return false;
    }
}

// Add this to your existing chores table
db.run(`ALTER TABLE chores ADD COLUMN schedule_id INTEGER REFERENCES scheduled_chores(id)`);

// Utility function to create notifications
function createNotification(userId, type, message) {
    return new Promise((resolve, reject) => {
        db.run(
            'INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)',
            [userId, type, message],
            function(err) {
                if (err) reject(err);
                else resolve(this.lastID);
            }
        );
    });
}

// Email configuration (add to your env variables)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Reward redemption endpoints
app.post('/api/rewards/redeem', async (req, res) => {
    const { rewardId } = req.body;
    const userId = req.session.userId;

    try {
        // Start transaction
        await db.run('BEGIN TRANSACTION');

        // Get user points and reward details
        const user = await db.get('SELECT points FROM users WHERE id = ?', [userId]);
        const reward = await db.get('SELECT * FROM rewards WHERE id = ?', [rewardId]);

        if (!user || !reward) {
            await db.run('ROLLBACK');
            return res.status(404).json({ error: 'User or reward not found' });
        }

        if (user.points < reward.points_required) {
            await db.run('ROLLBACK');
            return res.status(400).json({ error: 'Insufficient points' });
        }

        // Create redemption record
        await db.run(
            'INSERT INTO reward_redemptions (user_id, reward_id, points_spent) VALUES (?, ?, ?)',
            [userId, rewardId, reward.points_required]
        );

        // Update user points
        await db.run(
            'UPDATE users SET points = points - ? WHERE id = ?',
            [reward.points_required, userId]
        );

        // Notify parent
        await createNotification(
            parentUserId,
            'reward_redemption',
            `${req.session.username} has redeemed ${reward.title}`
        );

        await db.run('COMMIT');
        res.json({ success: true });

    } catch (error) {
        await db.run('ROLLBACK');
        console.error('Redemption error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Calendar view endpoints
app.get('/api/calendar/chores', async (req, res) => {
    const { start, end } = req.query;
    
    try {
        const chores = await db.all(`
            SELECT 
                c.id,
                c.description,
                c.points,
                sc.frequency,
                sc.day_of_week,
                sc.time_of_day,
                sc.start_date,
                sc.end_date,
                u.username as assigned_to
            FROM scheduled_chores sc
            JOIN chores c ON sc.chore_id = c.id
            LEFT JOIN users u ON sc.user_id = u.id
            WHERE sc.active = 1
            AND (sc.start_date BETWEEN ? AND ? 
                OR sc.end_date BETWEEN ? AND ?
                OR (sc.start_date <= ? AND (sc.end_date >= ? OR sc.end_date IS NULL)))
        `, [start, end, start, end, start, end]);

        // Generate calendar events
        const events = generateCalendarEvents(chores, start, end);
        res.json(events);

    } catch (error) {
        console.error('Calendar error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Configure web push
webpush.setVapidDetails(
    'mailto:your@email.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

// Add subscription table
db.run(`CREATE TABLE IF NOT EXISTS push_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subscription TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)`);

// Add completion tracking table
db.run(`CREATE TABLE IF NOT EXISTS chore_completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chore_id INTEGER NOT NULL,
    scheduled_chore_id INTEGER,
    user_id INTEGER NOT NULL,
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    points_earned INTEGER NOT NULL,
    verified BOOLEAN DEFAULT 0,
    recurring_instance_date DATE,
    FOREIGN KEY (chore_id) REFERENCES chores(id),
    FOREIGN KEY (scheduled_chore_id) REFERENCES scheduled_chores(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
)`);

// Notification Routes
app.post('/api/notifications/subscribe', async (req, res) => {
    const subscription = req.body;
    const userId = req.session.userId;

    try {
        await db.run(
            'INSERT INTO push_subscriptions (user_id, subscription) VALUES (?, ?)',
            [userId, JSON.stringify(subscription)]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Subscription failed' });
    }
});

// Chore completion routes
app.post('/api/chores/complete', async (req, res) => {
    const { choreId, scheduledChoreId } = req.body;
    const userId = req.session.userId;

    try {
        await db.run('BEGIN TRANSACTION');

        // Get chore details
        const chore = await db.get('SELECT * FROM chores WHERE id = ?', [choreId]);
        
        // Create completion record
        const result = await db.run(
            `INSERT INTO chore_completions (
                chore_id, scheduled_chore_id, user_id, 
                points_earned, recurring_instance_date
            ) VALUES (?, ?, ?, ?, date('now'))`,
            [choreId, scheduledChoreId, userId, chore.points]
        );

        // Update user points (if auto-approval is enabled)
        if (!chore.requires_verification) {
            await db.run(
                'UPDATE users SET points = points + ? WHERE id = ?',
                [chore.points, userId]
            );
        }

        // Notify parent if verification is required
        if (chore.requires_verification) {
            await notifyParentOfCompletion(choreId, userId);
        }

        await db.run('COMMIT');
        res.json({ success: true });

    } catch (error) {
        await db.run('ROLLBACK');
        res.status(500).json({ error: 'Failed to complete chore' });
    }
});

// Verification route
app.post('/api/chores/verify', async (req, res) => {
    if (req.session.userRole !== 'parent') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { completionId, approved, feedback } = req.body;

    try {
        await db.run('BEGIN TRANSACTION');

        const completion = await db.get(`
            SELECT cc.*, c.points, c.description, u.username
            FROM chore_completions cc
            JOIN chores c ON cc.chore_id = c.id
            JOIN users u ON cc.user_id = u.id
            WHERE cc.id = ?
        `, [completionId]);

        const settings = await db.get(
            'SELECT * FROM verification_settings WHERE parent_id = ?',
            [req.session.userId]
        );

        if (approved) {
            const pointsToAward = Math.round(completion.points * settings.point_multiplier);
            
            await db.run(
                'UPDATE users SET points = points + ? WHERE id = ?',
                [pointsToAward, completion.user_id]
            );
            
            await db.run(
                'UPDATE chore_completions SET verified = 1, feedback = ? WHERE id = ?',
                [feedback, completionId]
            );

            // Create positive notification
            await createNotification(
                completion.user_id,
                'chore_approved',
                `Your chore "${completion.description}" was approved! You earned ${pointsToAward} points.`
            );
        } else {
            await db.run(
                'UPDATE chore_completions SET verified = 0, feedback = ? WHERE id = ?',
                [feedback, completionId]
            );

            // Create feedback notification
            await createNotification(
                completion.user_id,
                'chore_rejected',
                `Your chore "${completion.description}" needs attention: ${feedback}`
            );
        }

        await db.run('COMMIT');
        res.json({ success: true });

    } catch (error) {
        await db.run('ROLLBACK');
        res.status(500).json({ error: 'Verification failed' });
    }
});

// Notification helper functions
async function notifyParentOfCompletion(choreId, userId) {
    const user = await db.get('SELECT username FROM users WHERE id = ?', [userId]);
    const chore = await db.get('SELECT description FROM chores WHERE id = ?', [choreId]);
    
    // Email notification
    const mailOptions = {
        to: parentEmail,
        subject: 'Chore Completion Needs Verification',
        html: `${user.username} has completed "${chore.description}" and needs verification.`
    };
    
    transporter.sendMail(mailOptions);

    // Push notification
    const subscriptions = await db.all(
        'SELECT subscription FROM push_subscriptions WHERE user_id = ?',
        [parentUserId]
    );

    for (const sub of subscriptions) {
        try {
            await webpush.sendNotification(
                JSON.parse(sub.subscription),
                JSON.stringify({
                    title: 'Chore Completion',
                    body: `${user.username} has completed "${chore.description}"`
                })
            );
        } catch (error) {
            console.error('Push notification failed:', error);
        }
    }
}

// Recurring chore scheduler
schedule.scheduleJob('0 0 * * *', async () => {
    try {
        // Get all active recurring chores
        const recurringChores = await db.all(`
            SELECT * FROM scheduled_chores 
            WHERE active = 1 
            AND frequency IS NOT NULL
        `);

        const today = new Date();
        
        for (const chore of recurringChores) {
            if (shouldGenerateChore(chore, today)) {
                // Create new instance
                await db.run(
                    'INSERT INTO chores (description, points, scheduled_chore_id) VALUES (?, ?, ?)',
                    [chore.description, chore.points, chore.id]
                );

                // Notify assigned user
                if (chore.user_id) {
                    await notifyUserOfChore(chore);
                }
            }
        }
    } catch (error) {
        console.error('Error processing recurring chores:', error);
    }
});

// Add to your existing tables
db.run(`CREATE TABLE IF NOT EXISTS verification_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id INTEGER NOT NULL,
    auto_verify_below_points INTEGER DEFAULT 0,
    require_photo_proof BOOLEAN DEFAULT 0,
    allow_child_scheduling BOOLEAN DEFAULT 0,
    point_multiplier FLOAT DEFAULT 1.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES users(id)
)`);

// Parent verification routes
app.get('/api/parent/settings', async (req, res) => {
    if (req.session.userRole !== 'parent') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const settings = await db.get(
            'SELECT * FROM verification_settings WHERE parent_id = ?',
            [req.session.userId]
        );
        res.json(settings || {
            auto_verify_below_points: 0,
            require_photo_proof: false,
            allow_child_scheduling: false,
            point_multiplier: 1.0
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

app.post('/api/parent/settings', async (req, res) => {
    if (req.session.userRole !== 'parent') {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
        auto_verify_below_points,
        require_photo_proof,
        allow_child_scheduling,
        point_multiplier
    } = req.body;

    try {
        await db.run(`
            INSERT OR REPLACE INTO verification_settings 
            (parent_id, auto_verify_below_points, require_photo_proof, 
             allow_child_scheduling, point_multiplier)
            VALUES (?, ?, ?, ?, ?)
        `, [
            req.session.userId,
            auto_verify_below_points,
            require_photo_proof ? 1 : 0,
            allow_child_scheduling ? 1 : 0,
            point_multiplier
        ]);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});