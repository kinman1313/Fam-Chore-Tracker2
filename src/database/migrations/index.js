const fs = require('fs');
const path = require('path');

const runMigrations = async (direction = 'up') => {
    const migrationFiles = fs.readdirSync(__dirname)
        .filter(file => file.endsWith('.js') && file !== 'index.js')
        .sort();

    for (const file of migrationFiles) {
        const migration = require(path.join(__dirname, file));
        console.log(`Running migration ${direction}: ${file}`);
        
        try {
            await migration[direction]();
            console.log(`Completed migration ${direction}: ${file}`);
        } catch (error) {
            console.error(`Migration ${direction} failed for ${file}:`, error);
            throw error;
        }
    }
};

if (require.main === module) {
    const direction = process.argv[2] || 'up';
    runMigrations(direction)
        .then(() => {
            console.log('All migrations completed successfully');
            process.exit(0);
        })
        .catch(error => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { runMigrations };
