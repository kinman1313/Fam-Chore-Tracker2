import User from '../models/User';
import { APIError } from '../middleware/error';
import { validateUser } from '../utils/validation';

export default {
  register,
  login,
  logout,
  getProfile
};

const register = async (req, res) => {
    const { username, email, password } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ 
        $or: [{ email }, { username }] 
    });
    
    if (userExists) {
        throw new APIError('User already exists', 400);
    }

    // Create user
    const user = await User.create({
        username,
        email,
        password
    });

    // Create session
    req.session.user = {
        id: user._id,
        username: user.username,
        role: user.role
    };

    res.status(201).json({
        success: true,
        data: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    });
};

const login = async (req, res) => {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new APIError('Invalid credentials', 401);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new APIError('Invalid credentials', 401);
    }

    // Create session
    req.session.user = {
        id: user._id,
        username: user.username,
        role: user.role
    };

    res.json({
        success: true,
        data: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    });
};

const logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            throw new APIError('Could not log out', 500);
        }
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    });
};

const getProfile = async (req, res) => {
    const user = await User.findById(req.user.id)
        .select('-password')
        .populate('familyId');

    res.json({
        success: true,
        data: user
    });
};
