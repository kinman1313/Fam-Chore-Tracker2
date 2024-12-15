import { verify } from 'jsonwebtoken';

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    try {
        // Check for token in various places
        const token = req.cookies?.token || 
                     req.headers.authorization?.split(' ')[1] || 
                     req.session?.token;

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Access denied. No token provided.' 
            });
        }

        // Verify token
        const decoded = verify(token, process.env.SESSION_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: 'Invalid token.' 
        });
    }
};

// Middleware to check if user is an admin
const isAdmin = (req, res, next) => {
    if (!req.user?.isAdmin) {
        return res.status(403).json({ 
            success: false, 
            message: 'Access denied. Admin privileges required.' 
        });
    }
    next();
};

// Middleware to check if user is accessing their own data
const isOwner = (req, res, next) => {
    const userId = req.params.userId || req.body.userId;
    if (req.user.id !== userId && !req.user.isAdmin) {
        return res.status(403).json({ 
            success: false, 
            message: 'Access denied. You can only access your own data.' 
        });
    }
    next();
};

// Middleware to check if user belongs to the same family
const isFamilyMember = async (req, res, next) => {
    try {
        const familyId = req.params.familyId || req.body.familyId;
        if (!req.user.familyId || req.user.familyId !== familyId) {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. You can only access your family data.' 
            });
        }
        next();
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error checking family membership.' 
        });
    }
};

// Middleware to handle API rate limiting
const apiLimiter = (req, res, next) => {
    if (!req.session.apiCalls) {
        req.session.apiCalls = 0;
    }

    req.session.apiCalls++;

    if (req.session.apiCalls > 100) { // 100 calls per session
        return res.status(429).json({ 
            success: false, 
            message: 'Too many requests. Please try again later.' 
        });
    }

    next();
};

// Middleware to check if user session is active
const isSessionActive = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.status(440).json({ 
            success: false, 
            message: 'Session has expired. Please login again.' 
        });
    }
    next();
};

// Export all middleware functions
export default {
    isAuthenticated,
    isAdmin,
    isOwner,
    isFamilyMember,
    apiLimiter,
    isSessionActive
};
