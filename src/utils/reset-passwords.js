const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '..', 'chore_tracker.db'));

async function resetPasswords() {
    console.log('Starting password reset...');
    
    const defaultPasswords = {
        'Kelli': 'kelli123',
        'Kevin': 'kevin123',
        'Bodhi': 'bodhi123',
        'Holden': 'holden123'
    };

    // First, verify the database connection
    await new Promise((resolve, reject) => {
        db.get('SELECT 1', [], (err) => {
            if (err) {
                console.error('Database connection error:', err);
                reject(err);
            } else {
                console.log('Database connected successfully');
                resolve();
            }
        });
    });

    // Then reset passwords
    for (const [username, password] of Object.entries(defaultPasswords)) {
        try {
            console.log(`Processing user: ${username}`);
            const hashedPassword = await bcrypt.hash(password, 10);
            
            await new Promise((resolve, reject) => {
                db.run(
                    'UPDATE users SET password = ? WHERE username = ?',
                    [hashedPassword, username],
                    function(err) {
                        if (err) {
                            console.error(`Error updating ${username}:`, err);
                            reject(err);
                        } else {
                            console.log(`Password updated for ${username} (${this.changes} rows affected)`);
                            resolve();
                        }
                    }
                );
            });
        } catch (err) {
            console.error(`Failed to update password for ${username}:`, err);
        }
    }
}

// Run the reset
console.log('Password reset utility starting...');
resetPasswords()
    .then(() => {
        console.log('Password reset completed successfully');
        db.close(() => {
            console.log('Database connection closed');
            process.exit(0);
        });
    })
    .catch(err => {
        console.error('Password reset failed:', err);
        db.close(() => {
            console.log('Database connection closed');
            process.exit(1);
        });
    });
