const db = require('../../config/database');

const up = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Create chores for Smith Family
            db.run(`
                INSERT INTO chores (family_id, name, description, points, frequency, created_by)
                VALUES 
                (1, 'Make Bed', 'Make your bed neatly every morning', 10, 'daily', 1),
                (1, 'Empty Dishwasher', 'Empty and organize clean dishes', 15, 'daily', 1),
                (1, 'Vacuum Living Room', 'Vacuum the entire living room including under furniture', 20, 'weekly', 1),
                (1, 'Clean Bathroom', 'Clean toilet, sink, and shower', 30, 'weekly', 1),
                (1, 'Take Out Trash', 'Take all trash bins to the curb', 10, 'weekly', 1),
                (1, 'Mow Lawn', 'Mow the front and back yard', 50, 'weekly', 1)
            `);

            // Create chores for Johnson Family
            db.run(`
                INSERT INTO chores (family_id, name, description, points, frequency, created_by)
                VALUES 
                (2, 'Feed Pets', 'Feed the dog and cat', 10, 'daily', 2),
                (2, 'Do Laundry', 'Wash, dry, and fold one load of laundry', 25, 'weekly', 2),
                (2, 'Clean Room', 'Organize and clean your bedroom', 20, 'weekly', 2),
                (2, 'Help with Dinner', 'Help prepare or clean up after dinner', 15, 'daily', 2)
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
};

module.exports = { up };
