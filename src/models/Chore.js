import mongoose from 'mongoose';

const choreSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Chore title is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    familyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Family',
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    points: {
        type: Number,
        default: 0
    },
    dueDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'verified', 'overdue'],
        default: 'pending'
    },
    recurring: {
        isRecurring: {
            type: Boolean,
            default: false
        },
        frequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', null],
            default: null
        },
        endDate: {
            type: Date
        }
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    requiresPhoto: {
        type: Boolean,
        default: false
    },
    completionPhoto: {
        type: String
    }
}, {
    timestamps: true
});

// Index for faster queries
choreSchema.index({ familyId: 1, status: 1 });
choreSchema.index({ assignedTo: 1, status: 1 });

const Chore = mongoose.model('Chore', choreSchema);

export default Chore;
