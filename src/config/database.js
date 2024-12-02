const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database configuration
const config = {
    development: {
        path: path.join(__dirname, '..', 'data', 'dev.sqlite3'),
        options: { verbose: console.log }
    },
    test: {
        path: path.join(__dirname, '..', 'data', 'test.sqlite3'),
        options: { verbose: false }
    },
    production: {
        path: process.env.DB_PATH || '/var/data/familychores.db',
        options: { verbose: false }
    }
};

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Database connection helper
function createConnection() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbConfig.path, (err) => {
            if (err) {
                console.error('Database connection error:', err);
                reject(err);
            } else {
                console.log(`Connected to database at: ${dbConfig.path}`);
                resolve(db);
            }
        });
    });
}

module.exports = { createConnection, config: dbConfig };
