const express = require('express');
const router = express.Router();

// Dashboard home - simplified version for testing
router.get('/', async (req, res) => {
    try {
        const stats = {
            pending_chores: 0,
            completed_today: 0,
            total_points_earned: 0,
            completion_rate: 0
        };

        res.render('dashboard/index', {
            user: { name: 'Test User' }, // Temporary user object
            stats: stats,
            weeklyProgress: [],
            leaderboard: [],
            recentActivity: []
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).render('error', { 
            message: 'Failed to load dashboard' 
        });
    }
});

module.exports = router;
