const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const SCREENSHOT_DIR = path.join(__dirname, '../static/demo-screenshots');

async function generateScreenshots() {
  console.log('Launching browser...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Ensure screenshot directory exists
    if (!fs.existsSync(SCREENSHOT_DIR)) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }

    console.log('Navigating to frontend...');
    await page.goto(FRONTEND_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for React to hydrate

    // Check if already logged in or need to login
    const isLoginPage = await page.$('input[type="email"]').catch(() => null);
    
    if (isLoginPage) {
      console.log('Logging in...');
      await page.type('input[type="email"]', 'admin@wildlife-demo.local');
      await page.type('input[type="password"]', 'demo123');
      await page.click('button[type="submit"]');
      
      // Wait for dashboard to load
      await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 60000 });
      await new Promise(resolve => setTimeout(resolve, 3000)); // Extra time for data to load
    } else {
      console.log('Already logged in, proceeding to dashboard...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Screenshot 1: Dashboard overview
    console.log('Capturing dashboard overview...');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'dashboard_overview.png'),
      fullPage: false
    });

    // Click on a voice case (Hindi)
    console.log('Opening voice case detail...');
    await page.waitForSelector('.case-card', { timeout: 10000 });
    const caseCards = await page.$$('.case-card');
    
    if (caseCards.length > 0) {
      // Find the Hindi voice case
      let found = false;
      for (const card of caseCards) {
        const text = await card.evaluate(el => el.textContent);
        if (text.includes('WR-DEMO-VOICE-HI-001') || text.includes('Aaj subah')) {
          await card.click();
          await new Promise(resolve => setTimeout(resolve, 2000));
          found = true;
          break;
        }
      }

      // If not found, click first voice case
      if (!found) {
        for (const card of caseCards) {
          const text = await card.evaluate(el => el.textContent);
          if (text.includes('Voice')) {
            await card.click();
            await new Promise(resolve => setTimeout(resolve, 2000));
            found = true;
            break;
          }
        }
      }

      if (found) {
        // Screenshot 2: Voice case detail
        console.log('Capturing voice case detail...');
        await page.screenshot({
          path: path.join(SCREENSHOT_DIR, 'voice_case_detail_hi.png'),
          fullPage: false
        });
      }
    }

    console.log('✓ Screenshots generated successfully');
    console.log(`  - ${path.join(SCREENSHOT_DIR, 'dashboard_overview.png')}`);
    console.log(`  - ${path.join(SCREENSHOT_DIR, 'voice_case_detail_hi.png')}`);

  } catch (error) {
    console.error('Screenshot generation failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

module.exports = { generateScreenshots };

if (require.main === module) {
  generateScreenshots()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}
