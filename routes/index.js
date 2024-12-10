const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const choreController = require('../controllers/choreController');
const auth = require('../middleware/auth');

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Chore routes (protected)
router.post('/chores', auth, choreController.createChore);
router.get('/chores', auth, choreController.getChores);
router.patch('/chores/:choreId/status', auth, choreController.updateChoreStatus);

module.exports = router; 