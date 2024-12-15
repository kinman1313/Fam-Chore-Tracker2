const fs = require('fs');
const path = require('path');

const setupProduction = async () => {
  try {
    console.log('Starting production setup...');

    // Ensure required directories exist
    const requiredDirs = [
      '/data',
      '/data/logs',
      '/data/uploads',
      '/data/temp'
    ];

    for (const dir of requiredDirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
    }

    // Ensure required environment variables
    // Remove PORT from required vars since Render handles it
    const requiredEnvVars = [
      'NODE_ENV',
      'MONGODB_URI',
      'SESSION_SECRET'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    if (missingVars.length > 0) {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    // Create production log file
    const logFile = path.join('/data/logs', 'production.log');
    if (!fs.existsSync(logFile)) {
      fs.writeFileSync(logFile, '');
      console.log('Created production log file');
    }

    // Set proper permissions for sensitive directories
    const secureDirectories = ['/data', '/data/logs'];
    secureDirectories.forEach(dir => {
      try {
        fs.chmodSync(dir, '0750');
        console.log(`Set secure permissions for ${dir}`);
      } catch (err) {
        console.warn(`Warning: Could not set permissions for ${dir}`, err);
      }
    });

    console.log('Production setup completed successfully');
  } catch (error) {
    console.error('Error during production setup:', error);
    process.exit(1);
  }
};

// Run setup
setupProduction().catch(error => {
  console.error('Fatal error during production setup:', error);
  process.exit(1);
}); 