const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.NODE_ENV === 'production' 
    ? '/data/familychores.db'
    : path.join(__dirname, '..', 'familychores.db');

const db = new sqlite3.Database(dbPath);

// List all tables
db.all(`
    SELECT name FROM sqlite_master 
    WHERE type='table'
    ORDER BY name;
`, [], (err, tables) => {
    if (err) {
        console.error('Error checking tables:', err);
        return;
    }

    console.log('Database tables:');
    tables.forEach(table => {
        console.log('-', table.name);
        
        // Show table structure
        db.all(`PRAGMA table_info(${table.name})`, [], (err, columns) => {
            if (err) {
                console.error(`Error checking columns for ${table.name}:`, err);
                return;
            }
            
            columns.forEach(column => {
                console.log('  |-', column.name, ':', column.type);
            });
            console.log();
        });
    });
});
