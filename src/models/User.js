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
}

module.exports = User;
