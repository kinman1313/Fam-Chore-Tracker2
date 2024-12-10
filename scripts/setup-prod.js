const fs = require('fs');
const path = require('path');

const setupProduction = () => {
  try {
    // Ensure /data directory exists
    const dataDir = '/data';
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('Created /data directory');
    }

    // Add any other production setup steps here
    console.log('Production setup completed successfully');
  } catch (error) {
    console.error('Error during production setup:', error);
    process.exit(1);
  }
};

setupProduction(); 