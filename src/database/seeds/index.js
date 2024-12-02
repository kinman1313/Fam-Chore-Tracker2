const bcrypt = require('bcryptjs');
const { createConnection } = require('../../config/database');

async function seedDatabase() {
    const db = await createConnection();

    try {
        // Create default admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.run(`
            INSERT OR IGNORE INTO users (username, password, role, email)
            VALUES (?, ?, ?, ?)
        `, ['admin', hashedPassword, 'parent', 'admin@example.com']);

        // Create default settings if not exists
        const defaultSettings = [
            ['points_multiplier', '1.0', 'Points multiplier for chores'],
            ['auto_verify_points', '5', 'Points threshold for automatic verification'],
            ['require_photo_proof', 'false', 'Require photo proof for completion'],
            ['allow_child_scheduling', 'true', 'Allow children to schedule chores']
        ];

        for (const [key, value, description] of defaultSettings) {
            await db.run(`
                INSERT OR IGNORE INTO settings (key, value, description)
                VALUES (?, ?, ?)
            `, [key, value, description]);
        }

        console.log('Database seeded successfully');
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    } finally {
        await db.close();
    }
}

// Export for CLI and testing
module.exports = { seedDatabase };

// Run seeder if called directly
if (require.main === module) {
    seedDatabase().catch(console.error);
}
