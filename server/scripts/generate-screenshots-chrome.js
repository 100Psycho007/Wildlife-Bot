/**
 * Alternative screenshot generator using Chrome DevTools Protocol
 * This script provides instructions for generating screenshots using Chrome DevTools MCP
 * which is more reliable than Puppeteer for this use case.
 */

const path = require('path');
const fs = require('fs');

const SCREENSHOT_DIR = path.join(__dirname, '../static/demo-screenshots');

function checkScreenshots() {
  console.log('=== Screenshot Status Check ===\n');
  
  // Ensure directory exists
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    console.log('✓ Created screenshot directory');
  }

  const requiredScreenshots = [
    'dashboard_overview.png',
    'voice_case_detail_hi.png'
  ];

  const existingScreenshots = [];
  const missingScreenshots = [];

  requiredScreenshots.forEach(filename => {
    const filepath = path.join(SCREENSHOT_DIR, filename);
    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);
      existingScreenshots.push({ filename, size: stats.size });
    } else {
      missingScreenshots.push(filename);
    }
  });

  if (existingScreenshots.length > 0) {
    console.log('✓ Existing screenshots:');
    existingScreenshots.forEach(({ filename, size }) => {
      console.log(`  - ${filename} (${(size / 1024).toFixed(2)} KB)`);
    });
  }

  if (missingScreenshots.length > 0) {
    console.log('\n⚠ Missing screenshots:');
    missingScreenshots.forEach(filename => {
      console.log(`  - ${filename}`);
    });
    console.log('\nTo generate missing screenshots:');
    console.log('1. Ensure frontend is running: cd client && npm run dev');
    console.log('2. Ensure backend is running: npm run dev');
    console.log('3. Use Chrome DevTools MCP or manually capture screenshots');
    console.log('4. Save to: static/demo-screenshots/');
  } else {
    console.log('\n✓ All required screenshots are present!');
  }

  console.log(`\nScreenshot directory: ${SCREENSHOT_DIR}`);
}

if (require.main === module) {
  checkScreenshots();
}

module.exports = { checkScreenshots };
