const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    static async findByUsername(username) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    static async create({ username, email, password, role }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                [username, email, hashedPassword, role],
                function(err) {
                    if (err) reject(err);
                    resolve(this.lastID);
                }
            );
        });
    }

    static async getPoints(userId) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT points FROM family_members WHERE user_id = ?',
                [userId],
                (err, row) => {
                    if (err) reject(err);
                    resolve(row ? row.points : 0);
                }
            );
        });
    }

    static async getChoreHistory(userId, status = null) {
        const statusClause = status ? 'AND ca.status = ?' : '';
        const params = status ? [userId, status] : [userId];

        return new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    c.name as chore_name,
                    c.description,
                    c.points,
                    ca.status,
                    ca.created_at,
                    ca.completed_at,
                    ca.verified_at,
                    ca.points_awarded,
                    u.username as verified_by
                FROM chore_assignments ca
                JOIN chores c ON ca.chore_id = c.id
                LEFT JOIN users u ON ca.verified_by = u.id
                WHERE ca.assigned_to = ? ${statusClause}
                ORDER BY ca.created_at DESC
            `, params, (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    static async getRewardHistory(userId) {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    r.name as reward_name,
                    r.description,
                    rr.points_spent,
                    rr.status,
                    rr.created_at,
                    rr.approved_at,
                    u.username as approved_by
                FROM reward_redemptions rr
                JOIN rewards r ON rr.reward_id = r.id
                LEFT JOIN users u ON rr.approved_by = u.id
                WHERE rr.user_id = ?
                ORDER BY rr.created_at DESC
            `, [userId], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    static async updateProfile(userId, updates) {
        const allowedFields = ['username', 'email', 'avatar'];
        const validUpdates = Object.keys(updates)
            .filter(key => allowedFields.includes(key))
            .reduce((obj, key) => {
                obj[key] = updates[key];
                return obj;
            }, {});

        if (Object.keys(validUpdates).length === 0) {
            return false;
        }

        const setClause = Object.keys(validUpdates)
            .map(key => `${key} = ?`)
            .join(', ');
        const values = [...Object.values(validUpdates), userId];

        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE users SET ${setClause} WHERE id = ?`,
                values,
                (err) => {
                    if (err) reject(err);
                    resolve(true);
                }
            );
        });
    }

    static async getNotifications(userId) {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT 
                    'chore_assigned' as type,
                    c.name as chore_name,
                    ca.created_at,
                    u.username as assigned_by,
                    0 as read
                FROM chore_assignments ca
                JOIN chores c ON ca.chore_id = c.id
                JOIN users u ON ca.assigned_by = u.id
                WHERE ca.assigned_to = ? AND ca.status = 'pending'
                
                UNION ALL
                
                SELECT 
                    'chore_verified' as type,
                    c.name as chore_name,
                    ca.verified_at as created_at,
                    u.username as verified_by,
                    0 as read
                FROM chore_assignments ca
                JOIN chores c ON ca.chore_id = c.id
                JOIN users u ON ca.verified_by = u.id
                WHERE ca.assigned_to = ? AND ca.status = 'verified'
                
                UNION ALL
                
                SELECT 
                    'reward_approved' as type,
                    r.name as reward_name,
                    rr.approved_at as created_at,
                    u.username as approved_by,
                    0 as read
                FROM reward_redemptions rr
                JOIN rewards r ON rr.reward_id = r.id
                JOIN users u ON rr.approved_by = u.id
                WHERE rr.user_id = ? AND rr.status = 'approved'
                
                ORDER BY created_at DESC
                LIMIT 50
            `, [userId, userId, userId], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }
}
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false // Don't send password in queries by default
    },
    familyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Family'
    },
    role: {
        type: String,
        enum: ['parent', 'child', 'admin'],
        default: 'child'
    },
    avatar: {
        type: String,
        default: 'default-avatar.png'
    },
    points: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Get user's full name
userSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

const User = mongoose.model('User', userSchema);
export default User;
