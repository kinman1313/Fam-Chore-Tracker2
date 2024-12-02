const db = require('../config/database');

class Chore {
    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM chores WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    static async getByFamily(familyId) {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM chores WHERE family_id = ?', [familyId], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    static async getPendingByUser(userId) {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT c.*, ca.due_date, ca.status
                FROM chores c
                JOIN chore_assignments ca ON c.id = ca.chore_id
                WHERE ca.assigned_to = ? AND ca.status = 'pending'
                ORDER BY ca.due_date ASC
            `, [userId], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    static async create({ familyId, name, description, points, frequency, createdBy }) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO chores (family_id, name, description, points, frequency, created_by) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [familyId, name, description, points, frequency, createdBy],
                function(err) {
                    if (err) reject(err);
                    resolve(this.lastID);
                }
            );
        });
    }
}

module.exports = Chore;
