const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, async (req, res) => {
    try {
        const [
            memberStats,
            weeklyProgress,
            leaderboard,
            notifications
        ] = await Promise.all([
            Analytics.getMemberStats(req.user.id),
            Analytics.getWeeklyProgress(req.user.familyId),
            Analytics.getLeaderboard(req.user.familyId, 'week'),
            User.getNotifications(req.user.id)
        ]);

        // Calculate completion rate
        const completionRate = memberStats.total_assigned > 0
            ? Math.round((memberStats.completed_chores / memberStats.total_assigned) * 100)
            : 0;

        // Format stats for display
        const stats = {
            pending_chores: memberStats.total_assigned - memberStats.completed_chores,
            completed_today: weeklyProgress[weeklyProgress.length - 1].completed_chores,
            total_points_earned: memberStats.total_points_earned,
            completion_rate: completionRate
        };

        // Format recent activity from notifications
        const recentActivity = notifications.map(notification => {
            let icon, description;
            switch (notification.type) {
                case 'chore_assigned':
                    icon = 'fa-tasks';
                    description = `New chore assigned: ${notification.chore_name}`;
                    break;
                case 'chore_verified':
                    icon = 'fa-check';
                    description = `${notification.chore_name} verified by ${notification.verified_by}`;
                    break;
                case 'reward_approved':
                    icon = 'fa-gift';
                    description = `${notification.reward_name} redemption approved`;
                    break;
            }

            return {
                icon,
                description,
                timeAgo: timeAgo(new Date(notification.created_at))
            };
        });

        res.render('dashboard/index', {
            stats,
            weeklyProgress,
            leaderboard,
            recentActivity
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).render('error', { 
            message: 'Failed to load dashboard' 
        });
    }
});

// Helper function to format time ago
function timeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
        }
    }
    return 'Just now';
}

module.exports = router;
