const db = require('../../config/database');

const up = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Create families
            db.run(`
                INSERT INTO families (name, created_by)
                VALUES 
                ('Smith Family', 1),
                ('Johnson Family', 2)
            `);

            // Add family members
            db.run(`
                INSERT INTO family_members (family_id, user_id, points)
                VALUES 
                (1, 1, 0),   -- parent1 in Smith Family
                (1, 3, 100), -- child1 in Smith Family
                (1, 4, 75),  -- child2 in Smith Family
                (2, 2, 0),   -- parent2 in Johnson Family
                (2, 5, 50)   -- child3 in Johnson Family
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
};

module.exports = { up };
