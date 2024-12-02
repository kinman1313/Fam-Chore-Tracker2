const express = require('express');
const router = express.Router();

// Login page
router.get('/login', (req, res) => {
    res.render('auth/login', {
        title: 'Login',
        error: null
    });
});

// Register page
router.get('/register', (req, res) => {
    res.render('auth/register', {
        title: 'Register',
        error: null
    });
});

module.exports = router;