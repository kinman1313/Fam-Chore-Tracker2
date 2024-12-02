const bcrypt = require('bcryptjs');
const db = require('../../config/database');

const up = async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Create parent users
            db.run(`
                INSERT INTO users (username, email, password, role)
                VALUES 
                ('parent1', 'parent1@example.com', ?, 'parent'),
                ('parent2', 'parent2@example.com', ?, 'parent')
            `, [hashedPassword, hashedPassword]);

            // Create child users
            db.run(`
                INSERT INTO users (username, email, password, role)
                VALUES 
                ('child1', 'child1@example.com', ?, 'child'),
                ('child2', 'child2@example.com', ?, 'child'),
                ('child3', 'child3@example.com', ?, 'child')
            `, [hashedPassword, hashedPassword, hashedPassword], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
};

module.exports = { up };
