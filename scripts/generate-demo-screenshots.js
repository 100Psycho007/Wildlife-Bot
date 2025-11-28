const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:5173';
const ADMIN_EMAIL = 'admin@wildlife-demo.local';
const ADMIN_PASSWORD = 'demo123';
const SCREENSHOT_DIR = path.join(__dirname, '../static/demo-screenshots');

async function generateScreenshots() {
  console.log('Starting screenshot generation...');
  
  // Ensure screenshot directory exists
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('Navigating to dashboard...');
    await page.goto(DASHBOARD_URL, { waitUntil: 'networkidle2' });

    // Login
    console.log('Logging in...');
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', ADMIN_EMAIL);
    await page.type('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for dashboard to load
    await page.waitForSelector('table', { timeout: 10000 });
    await page.waitForTimeout(2000); // Let data load

    // Screenshot 1: Dashboard overview
    console.log('Capturing dashboard overview...');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'dashboard_overview.png'),
      fullPage: false
    });

    // Click on Hindi voice case
    console.log('Opening Hindi voice case...');
    const rows = await page.$$('tbody tr');
    
    for (const row of rows) {
      const text = await row.evaluate(el => el.textContent);
      if (text.includes('VOICE-HI')) {
        await row.click();
        break;
      }
    }

    // Wait for detail panel
    await page.waitForTimeout(1000);

    // Screenshot 2: Voice case detail
    console.log('Capturing voice case detail...');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'voice_case_detail.png'),
      fullPage: false
    });

    console.log('Screenshots generated successfully!');
    console.log(`Saved to: ${SCREENSHOT_DIR}`);

  } catch (error) {
    console.error('Error generating screenshots:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run if called directly
if (require.main === module) {
  generateScreenshots()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Failed:', error);
      process.exit(1);
    });
}

module.exports = { generateScreenshots };
