import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
const router = express.Router();
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, username } = req.body;
        // Debug log
        console.log('Registration attempt:', { name, email, username });
        // Input validation
        if (!name || !email || !password || !username) {
            console.log('Missing required fields');
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (password.length < 6) {
            console.log('Password too short');
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('Invalid email format');
            return res.status(400).json({ message: 'Invalid email format' });
        }
        // Username validation
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
            console.log('Invalid username format');
            return res.status(400).json({
                message: 'Username must be 3-20 characters long and can only contain letters, numbers, and underscores'
            });
        }
        // Check if user exists (email or username)
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });
        if (existingUser) {
            console.log('User already exists:', existingUser.email === email ? 'email taken' : 'username taken');
            return res.status(400).json({
                message: existingUser.email === email ? 'Email already registered' : 'Username already taken'
            });
        }
        // Hash password
        console.log('Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create user
        console.log('Creating new user...');
        const newUser = new User({
            name,
            email,
            username,
            password: hashedPassword
        });
        // Save user
        console.log('Saving user to database...');
        await newUser.save();
        // Generate token
        console.log('Generating JWT token...');
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        console.log('Registration successful');
        return res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                username: newUser.username
            }
        });
    }
    catch (err) {
        console.error('Registration error:', err);
        if (err instanceof Error) {
            console.error('Error details:', err.message);
            console.error('Error stack:', err.stack);
        }
        return res.status(500).json({
            message: 'Registration failed',
            error: err instanceof Error ? err.message : 'Unknown error'
        });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Debug log
        console.log('Login attempt:', { email });
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        // Create a new object without the password
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            username: user.username,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        res.json({ token, user: userResponse });
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Login failed' });
    }
});
router.get('/test', (req, res) => {
    console.log('Test endpoint hit');
    res.status(200).json({
        message: 'Auth routes are working',
        timestamp: new Date().toISOString()
    });
});
export default router;
//# sourceMappingURL=auth.js.map