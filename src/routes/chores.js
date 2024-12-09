const express = require('express');
const router = express.Router();

// Basic routes for testing
router.get('/', (req, res) => {
    res.render('chores/index', { 
        title: 'Chores List',
        chores: [] 
    });
});

router.get('/create', (req, res) => {
    res.render('chores/create', { title: 'Create Chore' });
});

module.exports = router;
