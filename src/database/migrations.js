const mongoose = require('mongoose');
const User = require('../models/User');
const Chore = require('../models/Chore');

const runMigrations = async () => {
  try {
    // Check database size before running migrations
    const stats = await mongoose.connection.db.stats();
    const dbSizeInGB = stats.dataSize / (1024 * 1024 * 1024);
    
    if (dbSizeInGB > 4.5) { // Leave some buffer from your 5GB limit
      throw new Error('Database size approaching limit. Please clean up data before migrations.');
    }

    // Run migrations in batches to prevent memory issues
    const batchSize = 100;

    // Update users in batches
    const userCount = await User.countDocuments();
    for (let i = 0; i < userCount; i += batchSize) {
      await User.updateMany(
        { createdAt: { $exists: false } },
        { $set: { createdAt: new Date(), updatedAt: new Date() } }
      ).skip(i).limit(batchSize);
    }

    // Update chores in batches
    const choreCount = await Chore.countDocuments();
    for (let i = 0; i < choreCount; i += batchSize) {
      await Chore.updateMany(
        { createdAt: { $exists: false } },
        { $set: { createdAt: new Date(), updatedAt: new Date() } }
      ).skip(i).limit(batchSize);
    }

    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

module.exports = runMigrations;
