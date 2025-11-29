const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');
const minimist = require('minimist');

const args = minimist(process.argv.slice(2), {
  string: ['baseUrl', 'adminEmail', 'adminPass', 'thresholdPct'],
  default: {
    baseUrl: 'http://localhost:5173',
    adminEmail: 'admin@wildlife-demo.local',
    adminPass: 'demo123',
    thresholdPct: '2.0'
  }
});

const BASE_URL = args.baseUrl;
const ADMIN_EMAIL = args.adminEmail;
const ADMIN_PASS = args.adminPass;
const THRESHOLD_PCT = parseFloat(args.thresholdPct);

const SCREENSHOTS_DIR = path.join(__dirname, '../static/demo-screenshots');
const REFERENCE_DIR = path.join(__dirname, '../reference-screenshots');

// Ensure directories exist
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function login(page) {
  console.log('Logging in...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  
  await page.type('input[type="email"]', ADMIN_EMAIL);
  await page.type('input[type="password"]', ADMIN_PASS);
  await page.click('button[type="submit"]');
  
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  console.log('✓ Logged in successfully');
}

async function takeScreenshot(page, name, selector = null) {
  const filepath = path.join(SCREENSHOTS_DIR, `${name}.png`);
  
  if (selector) {
    const element = await page.$(selector);
    if (element) {
      await element.screenshot({ path: filepath });
    } else {
      console.warn(`⚠ Element ${selector} not found for ${name}`);
      await page.screenshot({ path: filepath, fullPage: true });
    }
  } else {
    await page.screenshot({ path: filepath, fullPage: true });
  }
  
  console.log(`✓ Screenshot saved: ${name}.png`);
  return filepath;
}

function compareImages(img1Path, img2Path) {
  if (!fs.existsSync(img1Path) || !fs.existsSync(img2Path)) {
    console.log('⚠ Reference image not found, skipping comparison');
    return { diffPercent: 0, passed: true, skipped: true };
  }
  
  const img1 = PNG.sync.read(fs.readFileSync(img1Path));
  const img2 = PNG.sync.read(fs.readFileSync(img2Path));
  
  const { width, height } = img1;
  const diff = new PNG({ width, height });
  
  const numDiffPixels = pixelmatch(
    img1.data,
    img2.data,
    diff.data,
    width,
    height,
    { threshold: 0.1 }
  );
  
  const totalPixels = width * height;
  const diffPercent = (numDiffPixels / totalPixels) * 100;
  
  // Save diff image
  const diffPath = img1Path.replace('.png', '_diff.png');
  fs.writeFileSync(diffPath, PNG.sync.write(diff));
  
  return {
    diffPercent: diffPercent.toFixed(2),
    passed: diffPercent <= THRESHOLD_PCT,
    numDiffPixels,
    totalPixels
  };
}

async function runPixelCheck() {
  console.log('=== Wildlife Bot Pixel Check ===\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Threshold: ${THRESHOLD_PCT}%\n`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Login
    await login(page);
    
    // Take screenshots
    console.log('\nCapturing screenshots...');
    
    const screenshots = [
      { name: 'dashboard_overview', url: '/dashboard', selector: null },
      { name: 'voice_case_detail_hi', url: '/dashboard/cases/WR-DEMO-VOICE-HI-001', selector: null }
    ];
    
    const results = [];
    
    for (const shot of screenshots) {
      await page.goto(`${BASE_URL}${shot.url}`, { waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for animations
      
      const screenshotPath = await takeScreenshot(page, shot.name, shot.selector);
      
      // Compare with reference if exists
      const referencePath = path.join(REFERENCE_DIR, `${shot.name}.png`);
      const comparison = compareImages(screenshotPath, referencePath);
      
      results.push({
        name: shot.name,
        ...comparison
      });
    }
    
    // Print results
    console.log('\n=== Pixel Check Results ===\n');
    
    let allPassed = true;
    for (const result of results) {
      if (result.skipped) {
        console.log(`⚠ ${result.name}: SKIPPED (no reference)`);
      } else if (result.passed) {
        console.log(`✓ ${result.name}: PASSED (${result.diffPercent}% diff)`);
      } else {
        console.log(`✗ ${result.name}: FAILED (${result.diffPercent}% diff, threshold: ${THRESHOLD_PCT}%)`);
        allPassed = false;
      }
    }
    
    console.log('\n' + '='.repeat(40));
    
    if (allPassed) {
      console.log('✓ All pixel checks passed!');
      process.exit(0);
    } else {
      console.log('✗ Some pixel checks failed');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runPixelCheck();
