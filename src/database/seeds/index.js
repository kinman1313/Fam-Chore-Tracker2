const fs = require('fs');
const path = require('path');

const runSeeds = async () => {
    const seedFiles = fs.readdirSync(__dirname)
        .filter(file => file.endsWith('.js') && file !== 'index.js')
        .sort();

    for (const file of seedFiles) {
        const seed = require(path.join(__dirname, file));
        console.log(`Running seed: ${file}`);
        
        try {
            await seed.up();
            console.log(`Completed seed: ${file}`);
        } catch (error) {
            console.error(`Seed failed for ${file}:`, error);
            throw error;
        }
    }
};

if (require.main === module) {
    runSeeds()
        .then(() => {
            console.log('All seeds completed successfully');
            process.exit(0);
        })
        .catch(error => {
            console.error('Seeding failed:', error);
            process.exit(1);
        });
}

module.exports = { runSeeds };
