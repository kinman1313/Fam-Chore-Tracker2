const db = require('../config/database');

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
}

module.exports = Family;
