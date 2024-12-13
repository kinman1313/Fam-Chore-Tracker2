import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
const port = Number(process.env.PORT) || 3001;
// Security middleware with updated CSP
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'",
                "'unsafe-eval'",
                "chrome-extension:",
                "https:",
            ],
            styleSrc: [
                "'self'",
                "'unsafe-inline'",
                "chrome-extension:",
                "https:",
            ],
            imgSrc: [
                "'self'",
                "data:",
                "https:",
                "chrome-extension:",
            ],
            connectSrc: [
                "'self'",
                "http://localhost:*",
                "https://localhost:*",
                "https://s3.amazonaws.com",
                "ws://localhost:*",
            ],
            fontSrc: [
                "'self'",
                "https:",
                "data:",
                "chrome-extension:",
            ],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'self'", "chrome-extension:"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    xContentTypeOptions: true,
}));
app.use(cors());
app.use(express.json());
// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));
// Handle favicon.ico requests as fallback
app.get('/favicon.ico', (req, res) => {
    res.status(204).end(); // No content response
});
// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});
// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Chore Tracker API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            test: '/test'
        }
    });
});
// Routes
app.use('/api/auth', authRoutes);
// Add a test route to verify Express is working
app.get('/test', (req, res) => {
    res.json({ message: 'Express server is working' });
});
// List all registered routes
app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
        console.log(`Route: ${Object.keys(r.route.methods)} ${r.route.path}`);
    }
    else if (r.name === 'router') {
        console.log('Router middleware:', r.regexp);
    }
});
// Error handling should be last
app.use(errorHandler);
// Database connection
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
    console.log('Connected to MongoDB');
    try {
        // First, try to drop the problematic index
        await mongoose.connection.collection('users').dropIndex('username_1');
        console.log('Dropped username index');
    }
    catch (err) {
        console.log('No username index to drop or error dropping index:', err);
    }
    try {
        // Then drop the entire collection
        await mongoose.connection.collection('users').drop();
        console.log('Dropped users collection');
    }
    catch (err) {
        console.log('No users collection to drop or error dropping collection:', err);
    }
    // Force create the collection with proper indexes
    await mongoose.connection.createCollection('users');
    await mongoose.connection.collection('users').createIndex({ username: 1 }, { unique: true });
    await mongoose.connection.collection('users').createIndex({ email: 1 }, { unique: true });
    console.log('Recreated users collection with proper indexes');
})
    .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Trying port ${Number(port) + 1}`);
        app.listen(Number(port) + 1);
    }
    else {
        console.error('Server error:', err);
    }
});
export default app;
//# sourceMappingURL=index.js.map