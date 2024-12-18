const db = require('../config/database');

class Reward {
    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM rewards WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    static async getByFamily(familyId) {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM rewards WHERE family_id = ?', [familyId], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    static async getAvailableForUser(userId) {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT r.*, fm.points as user_points
                FROM rewards r
                JOIN family_members fm ON r.family_id = fm.family_id
                WHERE fm.user_id = ?
                ORDER BY r.points_required ASC
            `, [userId], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    static async create({ familyId, name, description, pointsRequired, createdBy }) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO rewards (family_id, name, description, points_required, created_by) 
                 VALUES (?, ?, ?, ?, ?)`,
                [familyId, name, description, pointsRequired, createdBy],
                function(err) {
                    if (err) reject(err);
                    resolve(this.lastID);
                }
            );
        });
    }

    static async redeem(rewardId, userId) {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                db.get(
                    `SELECT r.points_required, fm.points as user_points, r.family_id
                     FROM rewards r
                     JOIN family_members fm ON r.family_id = fm.family_id
                     WHERE r.id = ? AND fm.user_id = ?`,
                    [rewardId, userId],
                    (err, row) => {
                        if (err) {
                            db.run('ROLLBACK');
                            return reject(err);
                        }

                        if (!row || row.user_points < row.points_required) {
                            db.run('ROLLBACK');
                            return reject(new Error('Insufficient points'));
                        }

                        db.run(
                            `UPDATE family_members 
                             SET points = points - ? 
                             WHERE user_id = ? AND family_id = ?`,
                            [row.points_required, userId, row.family_id],
                            (err) => {
                                if (err) {
                                    db.run('ROLLBACK');
                                    return reject(err);
                                }

                                db.run(
                                    `INSERT INTO reward_redemptions (
                                        reward_id, user_id, points_spent, status
                                    ) VALUES (?, ?, ?, 'pending')`,
                                    [rewardId, userId, row.points_required],
                                    (err) => {
                                        if (err) {
                                            db.run('ROLLBACK');
                                            return reject(err);
                                        }

                                        db.run('COMMIT');
                                        resolve(true);
                                    }
                                );
                            }
                        );
                    }
                );
            });
        });
    }
}

module.exports = Reward;
