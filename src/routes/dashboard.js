const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/auth');

// Dashboard home
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const stats = {
            pending_chores: 0,
            completed_today: 0,
            total_points_earned: 0,
            completion_rate: 0
        };

        res.render('dashboard/index', {
            user: req.user,
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
router.get('/chores', isAuthenticated, async (req, res) => {
    try {
        res.render('dashboard/chores', {
            user: req.user,
            chores: []
        });
    } catch (error) {
        res.status(500).render('error', { 
            message: 'Failed to load chores' 
        });
    }
});

// Rewards management
router.get('/rewards', isAuthenticated, async (req, res) => {
    try {
        res.render('dashboard/rewards', {
            user: req.user,
            rewards: []
        });
    } catch (error) {
        res.status(500).render('error', { 
            message: 'Failed to load rewards' 
        });
    }
});

// Family management
router.get('/family', isAuthenticated, async (req, res) => {
    try {
        res.render('dashboard/family', {
            user: req.user,
            family: {}
        });
    } catch (error) {
        res.status(500).render('error', { 
            message: 'Failed to load family settings' 
        });
    }
});

module.exports = router;
