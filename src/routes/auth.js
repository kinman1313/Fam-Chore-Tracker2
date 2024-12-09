const express = require('express');
const router = express.Router();

// Basic routes for testing
router.get('/login', (req, res) => {
    res.render('auth/login', { title: 'Login' });
});

router.get('/signup', (req, res) => {
    res.render('auth/signup', { title: 'Sign Up' });
});

module.exports = router;
