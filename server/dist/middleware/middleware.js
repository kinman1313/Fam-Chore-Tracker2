import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';
import { User } from '../models/User.js';
export const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return next(new AppError('Not authorized to access this route', 401));
        }
        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            // Get user from token
            const user = await User.findById(decoded.id);
            if (!user) {
                return next(new AppError('No user found with this id', 404));
            }
            // Add user to request object
            req.user = user;
            next();
        }
        catch (error) {
            return next(new AppError('Not authorized to access this route', 401));
        }
    }
    catch (error) {
        next(error);
    }
};
export const getUserProfile = async (req, res) => {
    try {
        const user = req.user;
        res.json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};
//# sourceMappingURL=middleware.js.map