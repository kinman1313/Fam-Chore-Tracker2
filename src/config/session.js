import session from 'express-session';
import MongoStore from 'connect-mongo';

const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions',
        ttl: 24 * 60 * 60, // 1 day in seconds
        autoRemove: 'native', // Enable automatic removal of expired sessions
        crypto: {
            secret: process.env.SESSION_SECRET // Use the same secret for consistency
        }
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        domain: process.env.NODE_ENV === 'production' ? process.env.DOMAIN : undefined
    },
    name: 'famChores.sid', // Custom session cookie name
    rolling: true, // Refresh session with each request
    unset: 'destroy'
};

// Add trust proxy settings for production (needed for secure cookies over HTTPS)
if (process.env.NODE_ENV === 'production') {
    sessionConfig.proxy = true;
}

// Export the configured session middleware
module.exports = session(sessionConfig);
