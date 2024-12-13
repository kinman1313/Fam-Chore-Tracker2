const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    familyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Family',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    choreId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chore',
        required: true
    },
    type: {
        type: String,
        enum: ['chore_created', 'chore_completed', 'chore_updated', 'chore_deleted'],
        required: true
    },
    points: {
        type: Number,
        default: 0
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
});

// Add indexes
activitySchema.index({ familyId: 1, timestamp: -1 });
activitySchema.index({ userId: 1, timestamp: -1 });
activitySchema.index({ choreId: 1, timestamp: -1 });

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
