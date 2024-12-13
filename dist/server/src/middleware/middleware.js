"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("./errorHandler");
const User_1 = __importDefault(require("../models/User"));
const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return next(new errorHandler_1.AppError('Not authorized to access this route', 401));
        }
        try {
            // Verify token
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            // Get user from token
            const user = await User_1.default.findById(decoded.id);
            if (!user) {
                return next(new errorHandler_1.AppError('No user found with this id', 404));
            }
            // Add user to request object
            req.user = user;
            next();
        }
        catch (error) {
            return next(new errorHandler_1.AppError('Not authorized to access this route', 401));
        }
    }
    catch (error) {
        next(error);
    }
};
exports.protect = protect;
const getUserProfile = async (req, res) => {
    try {
        const user = req.user;
        res.json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt
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
exports.getUserProfile = getUserProfile;
//# sourceMappingURL=middleware.js.map