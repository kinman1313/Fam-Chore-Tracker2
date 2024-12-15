import mongoose from 'mongoose';
import User from '../models/User';
import Chore from '../models/Chore';
import Family from '../models/Family';
import bcrypt from 'bcryptjs';

const seedDatabase = async () => {
    try {
        // Check if we're in production
        if (process.env.NODE_ENV === 'production') {
            console.log('Seeding is disabled in production');
            return;
        }

        // Check database size
        const stats = await mongoose.connection.db.stats();
        const dbSizeInGB = stats.dataSize / (1024 * 1024 * 1024);
        
        if (dbSizeInGB > 4.5) {
            throw new Error('Database size approaching limit. Cannot seed more data.');
        }

        // Only seed if database is empty
        const userCount = await User.countDocuments();
        const choreCount = await Chore.countDocuments();

        if (userCount > 0 || choreCount > 0) {
            console.log('Database already contains data. Skipping seed.');
            return;
        }

        // Create demo family
        const demoFamily = await Family.create({
            name: 'Demo Family',
            settings: {
                allowChildChoreCreation: false,
                requireParentApproval: true,
                pointsSystem: {
                    enabled: true,
                    rewardThreshold: 100
                }
            }
        });

        // Create parent user
        const parentUser = await User.create({
            username: 'demoparent',
            email: 'parent@demo.com',
            password: await bcrypt.hash('demo123', 10),
            role: 'parent',
            familyId: demoFamily._id,
            points: 0
        });

        // Create child users
        const childUser1 = await User.create({
            username: 'demochild1',
            email: 'child1@demo.com',
            password: await bcrypt.hash('demo123', 10),
            role: 'child',
            familyId: demoFamily._id,
            points: 50
        });

        const childUser2 = await User.create({
            username: 'demochild2',
            email: 'child2@demo.com',
            password: await bcrypt.hash('demo123', 10),
            role: 'child',
            familyId: demoFamily._id,
            points: 75
        });

        // Update family with members
        demoFamily.members = [parentUser._id, childUser1._id, childUser2._id];
        demoFamily.createdBy = parentUser._id;
        await demoFamily.save();

        // Create demo chores
        const demoChores = [
            {
                title: 'Clean Bedroom',
                description: 'Make bed, vacuum floor, organize desk',
                familyId: demoFamily._id,
                assignedTo: childUser1._id,
                createdBy: parentUser._id,
                points: 10,
                status: 'pending',
                priority: 'medium',
                dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
            },
            {
                title: 'Do Dishes',
                description: 'Load/unload dishwasher, hand wash pots and pans',
                familyId: demoFamily._id,
                assignedTo: childUser2._id,
                createdBy: parentUser._id,
                points: 5,
                status: 'pending',
                priority: 'high',
                dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours from now
            },
            {
                title: 'Take Out Trash',
                description: 'Empty all trash bins and replace bags',
                familyId: demoFamily._id,
                assignedTo: childUser1._id,
                createdBy: parentUser._id,
                points: 3,
                status: 'completed',
                priority: 'low',
                dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Yesterday
            }
        ];

        await Chore.insertMany(demoChores);

        console.log('Database seeded successfully with demo data');
        console.log('Demo Parent Login: parent@demo.com / demo123');
        console.log('Demo Child1 Login: child1@demo.com / demo123');
        console.log('Demo Child2 Login: child2@demo.com / demo123');

    } catch (error) {
        console.error('Seeding failed:', error);
        throw error;
    }
};

module.exports = seedDatabase;
