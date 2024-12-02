const db = require('../../config/database');

const up = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Create chore assignments for Smith Family
            db.run(`
                INSERT INTO chore_assignments (
                    chore_id, assigned_to, assigned_by, status, due_date, points_awarded
                )
                VALUES 
                (1, 3, 1, 'pending', ?, 10),    -- Make Bed for child1
                (2, 4, 1, 'pending', ?, 15),    -- Empty Dishwasher for child2
                (3, 3, 1, 'completed', ?, 20),  -- Vacuum Living Room for child1
                (4, 4, 1, 'verified', ?, 30)    -- Clean Bathroom for child2
            `, [tomorrow, tomorrow, tomorrow, tomorrow]);

            // Create chore assignments for Johnson Family
            db.run(`
                INSERT INTO chore_assignments (
                    chore_id, assigned_to, assigned_by, status, due_date, points_awarded
                )
                VALUES 
                (7, 5, 2, 'pending', ?, 10),    -- Feed Pets for child3
                (8, 5, 2, 'completed', ?, 25)   -- Do Laundry for child3
            `, [tomorrow, tomorrow], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
};

module.exports = { up };
