const db = require('../config/database');
const crypto = require('crypto');

class Family {
    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM families WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    static async getMembers(familyId) {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT u.*, fm.points
                FROM users u
                JOIN family_members fm ON u.id = fm.user_id
                WHERE fm.family_id = ?
            `, [familyId], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    static async create({ name, createdBy }) {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO families (name, created_by) VALUES (?, ?)',
                [name, createdBy],
                function(err) {
                    if (err) reject(err);
                    resolve(this.lastID);
                }
            );
        });
    }

    static async getInvites(familyId) {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT i.*, u.username, u.email 
                FROM invites i
                JOIN users u ON i.user_id = u.id
                WHERE i.family_id = ? AND i.status = 'pending'
                ORDER BY i.created_at DESC
            `, [familyId], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    static async inviteMember(familyId, email) {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.get('SELECT id FROM users WHERE email = ?', [email], (err, user) => {
                    if (err) return reject(err);
                    if (!user) return reject(new Error('User not found'));

                    const inviteCode = crypto.randomBytes(16).toString('hex');
                    db.run(
                        `INSERT INTO invites (family_id, user_id, invite_code, status)
                         VALUES (?, ?, ?, 'pending')`,
                        [familyId, user.id, inviteCode],
                        (err) => {
                            if (err) reject(err);
                            resolve(inviteCode);
                        }
                    );
                });
            });
        });
    }

    static async updateMemberRole(familyId, userId, role) {
        return new Promise((resolve, reject) => {
            db.run(
                `UPDATE family_members 
                 SET role = ? 
                 WHERE family_id = ? AND user_id = ?`,
                [role, familyId, userId],
                (err) => {
                    if (err) reject(err);
                    resolve(true);
                }
            );
        });
    }

    static async removeMember(familyId, userId) {
        return new Promise((resolve, reject) => {
            db.run(
                `DELETE FROM family_members 
                 WHERE family_id = ? AND user_id = ?`,
                [familyId, userId],
                (err) => {
                    if (err) reject(err);
                    resolve(true);
                }
            );
        });
    }
}

module.exports = Family;
