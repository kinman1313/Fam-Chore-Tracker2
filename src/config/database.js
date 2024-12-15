import mongoose from 'mongoose';

const connectDB = async () => {
    if (!process.env.MONGODB_URI) {
        console.error('MongoDB URI is not defined in environment variables');
        process.exit(1);
    }

    const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
        retryWrites: true,
        writeConcern: {
            w: 'majority'
        }
    };

    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, options);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }

    mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        setTimeout(connectDB, 5000);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected. Attempting to reconnect...');
        setTimeout(connectDB, 5000);
    });

    setInterval(async () => {
        try {
            const stats = await mongoose.connection.db.stats();
            const dbSizeInGB = stats.dataSize / (1024 * 1024 * 1024);
            if (dbSizeInGB > 4.5) {
                console.warn(`Database size warning: ${dbSizeInGB.toFixed(2)}GB used of 5GB limit`);
            }
        } catch (error) {
            console.error('Failed to check database size:', error);
        }
    }, 24 * 60 * 60 * 1000);

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
};

module.exports = connectDB;