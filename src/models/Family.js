const mongoose = require('mongoose');

const familySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Family name is required'],
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    inviteCode: {
        type: String,
        unique: true
    },
    settings: {
        allowChildChoreCreation: {
            type: Boolean,
            default: false
        },
        requireParentApproval: {
            type: Boolean,
            default: true
        },
        pointsSystem: {
            enabled: {
                type: Boolean,
                default: true
            },
            rewardThreshold: {
                type: Number,
                default: 100
            }
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Generate unique invite code before saving
familySchema.pre('save', function(next) {
    if (!this.inviteCode) {
        this.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    next();
});

const Family = mongoose.model('Family', familySchema);
module.exports = Family;
