const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Fixing the casing issue

// Register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Please provide all required fields' 
            });
        }

        // Check if user exists
        let user = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (user) {
            return res.status(400).json({ 
                success: false,
                message: 'User already exists with that email or username' 
            });
        }

        // Create new user
        user = new User({
            username,
            email,
            password
        });

        // Password is hashed in the User model pre-save middleware
        await user.save();

        // Create token
        const token = jwt.sign(
            { id: user._id },
            process.env.SESSION_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email
                }
            }
        });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Error registering user' 
        });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Please provide email and password' 
            });
        }

        // Check if user exists and get password
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        // Create token
        const token = jwt.sign(
            { id: user._id },
            process.env.SESSION_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Logged in successfully',
            data: {
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    familyId: user.familyId
                }
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Error logging in' 
        });
    }
});

module.exports = router;
