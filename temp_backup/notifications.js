const { db } = require('./database');

// Notification types
const NOTIFICATION_TYPES = {
    CHORE_COMPLETED: 'chore_completed',
    CHORE_VERIFIED: 'chore_verified',
    CHORE_REJECTED: 'chore_rejected',
    REWARD_REDEEMED: 'reward_redeemed',
    POINTS_EARNED: 'points_earned',
    CHORE_ASSIGNED: 'chore_assigned',
    CHORE_REMINDER: 'chore_reminder',
    ACHIEVEMENT_UNLOCKED: 'achievement_unlocked'
};

// Initialize notifications table
function initializeNotificationsTable() {
    return new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                type TEXT NOT NULL,
                message TEXT NOT NULL,
                read BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                read_at DATETIME,
                metadata TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        `, (err) => {
            if (err) reject(err);
            resolve();
        });
    });
}

// Create a new notification
async function createNotification({ userId, type, message, metadata = {} }) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO notifications (user_id, type, message, metadata)
             VALUES (?, ?, ?, ?)`,
            [userId, type, message, JSON.stringify(metadata)],
            function(err) {
                if (err) reject(err);
                resolve(this.lastID);
            }
        );
    });
}

// Get notifications for a user
async function getNotifications(userId, options = {}) {
    const {
        limit = 20,
        offset = 0,
        unreadOnly = false,
        type = null
    } = options;

    return new Promise((resolve, reject) => {
        let query = `
            SELECT * FROM notifications 
            WHERE user_id = ?
            ${unreadOnly ? 'AND read = 0' : ''}
            ${type ? 'AND type = ?' : ''}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;

        const params = [userId];
        if (type) params.push(type);
        params.push(limit, offset);

        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            resolve(rows.map(row => ({
                ...row,
                metadata: JSON.parse(row.metadata || '{}')
            })));
        });
    });
}

// Mark notification as read
async function markNotificationRead(notificationId) {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE notifications 
             SET read = 1, read_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [notificationId],
            function(err) {
                if (err) reject(err);
                resolve(this.changes > 0);
            }
        );
    });
}

// Mark all notifications as read for a user
async function markAllNotificationsRead(userId) {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE notifications 
             SET read = 1, read_at = CURRENT_TIMESTAMP 
             WHERE user_id = ? AND read = 0`,
            [userId],
            function(err) {
                if (err) reject(err);
                resolve(this.changes);
            }
        );
    });
}

// Delete old notifications
async function cleanupOldNotifications(daysOld = 30) {
    return new Promise((resolve, reject) => {
        db.run(
            `DELETE FROM notifications 
             WHERE created_at < datetime('now', '-' || ? || ' days')`,
            [daysOld],
            function(err) {
                if (err) reject(err);
                resolve(this.changes);
            }
        );
    });
}

// Get unread notification count
async function getUnreadCount(userId) {
    return new Promise((resolve, reject) => {
        db.get(
            'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0',
            [userId],
            (err, row) => {
                if (err) reject(err);
                resolve(row.count);
            }
        );
    });
}

module.exports = {
    NOTIFICATION_TYPES,
    initializeNotificationsTable,
    createNotification,
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    cleanupOldNotifications,
    getUnreadCount
};
