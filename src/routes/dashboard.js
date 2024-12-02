const express = require('express');
const router = express.Router();

// Dashboard home
router.get('/', async (req, res) => {
    try {
        const stats = {
            pending_chores: 0,
            completed_today: 0,
            total_points_earned: 0,
            completion_rate: 0
        };

        res.render('dashboard/index', {
            user: { name: 'Test User' },
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

// Chores management
router.get('/chores', async (req, res) => {
    try {
        res.render('dashboard/chores', {
            user: { name: 'Test User' },
            chores: []
        });
    } catch (error) {
        res.status(500).render('error', { 
            message: 'Failed to load chores' 
        });
    }
});

// Rewards management
router.get('/rewards', async (req, res) => {
    try {
        res.render('dashboard/rewards', {
            user: { name: 'Test User' },
            rewards: []
        });
    } catch (error) {
        res.status(500).render('error', { 
            message: 'Failed to load rewards' 
        });
    }
});

// Family management
router.get('/family', async (req, res) => {
    try {
        res.render('dashboard/family', {
            user: { name: 'Test User' },
            family: {}
        });
    } catch (error) {
        res.status(500).render('error', { 
            message: 'Failed to load family settings' 
        });
    }
});

module.exports = router;