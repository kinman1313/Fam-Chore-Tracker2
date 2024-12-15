const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth').default;
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const Family = require('../models/Family');
const { catchAsync } = require('../middleware/error');

// @route   GET api/users/profile
// @desc    Get current user's profile
// @access  Private
router.get('/profile', isAuthenticated, catchAsync(async (req, res) => {
    const user = await User.findById(req.user.id).select('-password').populate('familyId');
    res.json({
        success: true,
        data: user
    });
}));

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
    isAuthenticated,
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail()
], catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, avatar } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = name;
    user.email = email;
    if (avatar) user.avatar = avatar;

    await user.save();
    res.json({
        success: true,
        data: user
    });
}));

// @route   GET api/users/family
// @desc    Get family members
// @access  Private
router.get('/family', isAuthenticated, catchAsync(async (req, res) => {
    const user = await User.findById(req.user.id);
    const family = await User.find({ familyId: user.familyId }).select('-password');
    res.json({
        success: true,
        data: family
    });
}));

// @route   POST api/users/family/invite
// @desc    Invite user to family
// @access  Private
router.post('/family/invite', [
    isAuthenticated,
    check('email', 'Please include a valid email').isEmail()
], catchAsync(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    // Add your invite logic here
    res.json({
        success: true,
        message: 'Invitation sent successfully'
    });
}));

module.exports = router;
