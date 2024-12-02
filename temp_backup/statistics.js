const { db } = require('./database');
const moment = require('moment');

// Initialize statistics table
function initializeStatisticsTables() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Points history
            db.run(`
                CREATE TABLE IF NOT EXISTS points_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    points INTEGER NOT NULL,
                    reason TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    metadata TEXT,
                    FOREIGN KEY (user_id) REFERENCES users(id)
                )
            `);

            // Achievements
            db.run(`
                CREATE TABLE IF NOT EXISTS achievements (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT NOT NULL,
                    criteria TEXT NOT NULL,
                    points INTEGER DEFAULT 0,
                    badge_icon TEXT
                )
            `);

            // User achievements
            db.run(`
                CREATE TABLE IF NOT EXISTS user_achievements (
                    user_id INTEGER NOT NULL,
                    achievement_id INTEGER NOT NULL,
                    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (user_id, achievement_id),
                    FOREIGN KEY (user_id) REFERENCES users(id),
                    FOREIGN KEY (achievement_id) REFERENCES achievements(id)
                )
            `, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    });
}

// Calculate user statistics
async function calculateStats(userId, timeframe = 'week') {
    const timeframes = {
        day: 'datetime("now", "-1 day")',
        week: 'datetime("now", "-7 days")',
        month: 'datetime("now", "-30 days")',
        year: 'datetime("now", "-365 days")'
    };

    const timeQuery = timeframes[timeframe] || timeframes.week;

    return new Promise((resolve, reject) => {
        db.serialize(() => {
            const stats = {};

            // Get completed chores count
            db.get(
                `SELECT COUNT(*) as count 
                 FROM chores 
                 WHERE assigned_to = ? 
                 AND completed = 1 
                 AND completed_at > ${timeQuery}`,
                [userId],
                (err, row) => {
                    if (err) reject(err);
                    stats.completedChores = row.count;
                }
            );

            // Get total points earned
            db.get(
                `SELECT SUM(points) as total 
                 FROM points_history 
                 WHERE user_id = ? 
                 AND created_at > ${timeQuery}`,
                [userId],
                (err, row) => {
                    if (err) reject(err);
                    stats.pointsEarned = row.total || 0;
                }
            );

            // Get completion streak
            db.all(
                `SELECT completed_at 
                 FROM chores 
                 WHERE assigned_to = ? 
                 AND completed = 1 
                 ORDER BY completed_at DESC`,
                [userId],
                (err, rows) => {
                    if (err) reject(err);
                    stats.streak = calculateStreak(rows);
                }
            );

            // Get achievement count
            db.get(
                `SELECT COUNT(*) as count 
                 FROM user_achievements 
                 WHERE user_id = ?`,
                [userId],
                (err, row) => {
                    if (err) reject(err);
                    stats.achievements = row.count;
                    resolve(stats);
                }
            );
        });
    });
}

// Update user reward points
async function updateRewardPoints(userId, points, reason = 'chore_completion') {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO points_history (user_id, points, reason)
             VALUES (?, ?, ?)`,
            [userId, points, reason],
            async function(err) {
                if (err) reject(err);
                
                // Check for achievements
                try {
                    await checkPointsAchievements(userId);
                    resolve(this.lastID);
                } catch (error) {
                    reject(error);
                }
            }
        );
    });
}

// Calculate streak
function calculateStreak(completedChores) {
    let streak = 0;
    let currentDate = moment();
    let lastDate = null;

    for (const chore of completedChores) {
        const choreDate = moment(chore.completed_at).startOf('day');
        
        if (!lastDate) {
            lastDate = choreDate;
            streak = 1;
            continue;
        }

        const daysDiff = lastDate.diff(choreDate, 'days');
        
        if (daysDiff === 1) {
            streak++;
            lastDate = choreDate;
        } else {
            break;
        }
    }

    return streak;
}

// Check for achievements
async function checkPointsAchievements(userId) {
    const achievements = {
        POINTS_100: { id: 1, points: 100, name: "Point Collector" },
        POINTS_500: { id: 2, points: 500, name: "Point Master" },
        POINTS_1000: { id: 3, points: 1000, name: "Point Champion" }
    };

    return new Promise((resolve, reject) => {
        db.get(
            `SELECT SUM(points) as total 
             FROM points_history 
             WHERE user_id = ?`,
            [userId],
            async (err, row) => {
                if (err) reject(err);
                
                const totalPoints = row.total || 0;
                const earnedAchievements = [];

                for (const achievement of Object.values(achievements)) {
                    if (totalPoints >= achievement.points) {
                        try {
                            await grantAchievement(userId, achievement.id);
                            earnedAchievements.push(achievement.name);
                        } catch (error) {
                            console.error('Error granting achievement:', error);
                        }
                    }
                }

                resolve(earnedAchievements);
            }
        );
    });
}

// Grant achievement to user
async function grantAchievement(userId, achievementId) {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT OR IGNORE INTO user_achievements (user_id, achievement_id)
             VALUES (?, ?)`,
            [userId, achievementId],
            function(err) {
                if (err) reject(err);
                resolve(this.changes > 0);
            }
        );
    });
}

module.exports = {
    initializeStatisticsTables,
    calculateStats,
    updateRewardPoints,
    calculateStreak,
    checkPointsAchievements,
    grantAchievement
};
