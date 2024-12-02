const authenticateUser = (req, res, next) => {
    if (req.session && req.session.userId) {
        res.locals.userId = req.session.userId;
        res.locals.username = req.session.username;
        res.locals.userRole = req.session.userRole;
        res.locals.isAuthenticated = true;
        next();
    } else {
        res.redirect('/auth/login');
    }
};

const requireParent = (req, res, next) => {
    if (req.session.userRole === 'parent') {
        next();
    } else {
        res.status(403).json({ error: 'Parent access required' });
    }
};

module.exports = { authenticateUser, requireParent };