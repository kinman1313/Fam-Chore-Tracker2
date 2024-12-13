import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }

        // MongoDB connection options optimized for Atlas
        const options = {
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            family: 4, // Use IPv4, skip trying IPv6
            retryWrites: true,
            writeConcern: {
                w: 'majority'
            }
        };

        const conn = await mongoose.connect(process.env.MONGODB_URI, options);

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Monitor connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
            // Attempt to reconnect
            setTimeout(connectDB, 5000);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected. Attempting to reconnect...');
            setTimeout(connectDB, 5000);
        });

        // Monitor database size periodically
        setInterval(async () => {
            try {
                const stats = await mongoose.connection.db.stats();
                const dbSizeInGB = stats.dataSize / (1024 * 1024 * 1024);
                if (dbSizeInGB > 4.5) { // 90% of 5GB limit
                    console.warn(`Database size warning: ${dbSizeInGB.toFixed(2)}GB used of 5GB limit`);
                }
            } catch (error) {
                console.error('Failed to check database size:', error);
            }
        }, 24 * 60 * 60 * 1000); // Check once per day

        // Graceful shutdown
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                console.log('MongoDB connection closed through app termination');
                process.exit(0);
            } catch (err) {
                console.error('Error during shutdown:', err);
                process.exit(1);
            }
        });

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
