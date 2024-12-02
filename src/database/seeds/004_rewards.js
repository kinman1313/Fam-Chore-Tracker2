const db = require('../../config/database');

const up = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Create rewards for Smith Family
            db.run(`
                INSERT INTO rewards (family_id, name, description, points_required, created_by)
                VALUES 
                (1, 'Extra Screen Time', '1 hour of extra screen time', 50, 1),
                (1, 'Choose Dinner', 'Pick what''s for dinner', 75, 1),
                (1, 'Movie Night', 'Pick a movie for family movie night', 100, 1),
                (1, 'New Video Game', 'Get a new video game of choice', 500, 1)
            `);

            // Create rewards for Johnson Family
            db.run(`
                INSERT INTO rewards (family_id, name, description, points_required, created_by)
                VALUES 
                (2, 'Stay Up Late', '1 hour past bedtime', 50, 2),
                (2, 'Pizza Party', 'Order pizza for dinner', 100, 2),
                (2, 'Shopping Trip', '$20 shopping trip', 200, 2),
                (2, 'Theme Park Visit', 'Family trip to theme park', 1000, 2)
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
};

module.exports = { up };
