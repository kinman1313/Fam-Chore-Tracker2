const db = require('../config/database');

class Analytics {
    static async getFamilyStats(familyId) {
        return new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    COUNT(DISTINCT ca.id) as total_chores,
                    SUM(CASE WHEN ca.status = 'completed' THEN 1 ELSE 0 END) as completed_chores,
                    SUM(CASE WHEN ca.status = 'verified' THEN 1 ELSE 0 END) as verified_chores,
                    SUM(CASE WHEN ca.status = 'pending' THEN 1 ELSE 0 END) as pending_chores,
                    SUM(ca.points_awarded) as total_points_awarded,
                    COUNT(DISTINCT fm.user_id) as total_members
                FROM chore_assignments ca
                JOIN family_members fm ON ca.assigned_to = fm.user_id
                WHERE fm.family_id = ?
            `, [familyId], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    static async getMemberStats(userId) {
        return new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    COUNT(DISTINCT ca.id) as total_assigned,
                    SUM(CASE WHEN ca.status = 'completed' THEN 1 ELSE 0 END) as completed_chores,
                    SUM(CASE WHEN ca.status = 'verified' THEN 1 ELSE 0 END) as verified_chores,
                    SUM(ca.points_awarded) as total_points_earned,
                    COUNT(DISTINCT rr.id) as rewards_redeemed,
                    SUM(rr.points_spent) as total_points_spent
                FROM chore_assignments ca
                LEFT JOIN reward_redemptions rr ON rr.user_id = ca.assigned_to
                WHERE ca.assigned_to = ?
            `, [userId], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    static async getWeeklyProgress(familyId) {
        const days = 7;
        return new Promise((resolve, reject) => {
            db.all(`
                WITH RECURSIVE dates(date) AS (
                    SELECT date('now', '-${days-1} days')
                    UNION ALL
                    SELECT date(date, '+1 day')
                    FROM dates
                    WHERE date < date('now')
                )
                SELECT 
                    dates.date,
                    COUNT(DISTINCT ca.id) as total_chores,
                    SUM(CASE WHEN ca.status IN ('completed', 'verified') THEN 1 ELSE 0 END) as completed_chores,
                    SUM(ca.points_awarded) as points_earned
                FROM dates
                LEFT JOIN chore_assignments ca ON date(ca.created_at) = dates.date
                LEFT JOIN family_members fm ON ca.assigned_to = fm.user_id
                WHERE fm.family_id = ? OR fm.family_id IS NULL
                GROUP BY dates.date
                ORDER BY dates.date
            `, [familyId], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    static async getLeaderboard(familyId, period = 'week') {
        const periodClause = {
            'week': "AND ca.created_at >= date('now', '-7 days')",
            'month': "AND ca.created_at >= date('now', '-1 month')",
            'year': "AND ca.created_at >= date('now', '-1 year')",
            'all': ""
        }[period];

        return new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    u.id,
                    u.username,
                    COUNT(DISTINCT ca.id) as chores_completed,
                    SUM(ca.points_awarded) as points_earned,
                    fm.points as current_points
                FROM users u
                JOIN family_members fm ON u.id = fm.user_id
                LEFT JOIN chore_assignments ca ON u.id = ca.assigned_to 
                    AND ca.status = 'verified'
                    ${periodClause}
                WHERE fm.family_id = ?
                GROUP BY u.id, u.username
                ORDER BY points_earned DESC
            `, [familyId], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    static async getChoreCompletion(familyId) {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    c.name as chore_name,
                    COUNT(DISTINCT ca.id) as total_assignments,
                    SUM(CASE WHEN ca.status IN ('completed', 'verified') THEN 1 ELSE 0 END) as completed,
                    AVG(CASE WHEN ca.status IN ('completed', 'verified') 
                        THEN ROUND((julianday(ca.completed_at) - julianday(ca.created_at)) * 24, 1)
                        ELSE NULL END) as avg_completion_hours
                FROM chores c
                LEFT JOIN chore_assignments ca ON c.id = ca.chore_id
                WHERE c.family_id = ?
                GROUP BY c.id, c.name
                ORDER BY total_assignments DESC
            `, [familyId], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    static async getRewardMetrics(familyId) {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    r.name as reward_name,
                    COUNT(DISTINCT rr.id) as times_redeemed,
                    SUM(rr.points_spent) as total_points_spent,
                    COUNT(DISTINCT rr.user_id) as unique_redeemers
                FROM rewards r
                LEFT JOIN reward_redemptions rr ON r.id = rr.reward_id
                WHERE r.family_id = ?
                GROUP BY r.id, r.name
                ORDER BY times_redeemed DESC
            `, [familyId], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }
}

module.exports = Analytics;
