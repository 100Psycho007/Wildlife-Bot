const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const fetch = require('node-fetch');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const REFERENCE_DIR = path.join(__dirname, '../static/demo-ui-frames');
const OUTPUT_DIR = path.join(__dirname, '../static/demo-screenshots');
const THRESHOLD = 0.02; // 2% difference threshold

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function compareImages(img1Path, img2Path, diffPath) {
  if (!fs.existsSync(img1Path)) {
    console.log(`⚠️  Reference image not found: ${img1Path}`);
    return { match: true, diff: 0 };
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
  
  fs.writeFileSync(diffPath, PNG.sync.write(diff));
  
  const totalPixels = width * height;
  const diffPercentage = (numDiffPixels / totalPixels) * 100;
  
  return {
    match: diffPercentage <= (THRESHOLD * 100),
    diff: diffPercentage,
    numDiffPixels,
    totalPixels
  };
}

async function runPixelCheck() {
  console.log('=== Pixel-Perfect Visual Diff Check ===\n');
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  console.log(`Threshold: ${THRESHOLD * 100}%\n`);

  // Check if frontend is accessible
  console.log('Checking if frontend is running...');
  try {
    const response = await fetch(FRONTEND_URL);
    if (!response.ok) {
      throw new Error(`Frontend returned status ${response.status}`);
    }
    console.log('✓ Frontend is accessible\n');
  } catch (error) {
    console.error('❌ Cannot connect to frontend at', FRONTEND_URL);
    console.error('\nPlease ensure:');
    console.error('1. Frontend is running: cd client && npm run dev');
    console.error('2. Frontend is accessible at http://localhost:5173');
    console.error('3. Backend is running: npm run dev');
    console.error('4. Demo data is seeded: npm run seed:demo\n');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Login first
    console.log('Step 1: Logging in...');
    try {
      await page.goto(`${FRONTEND_URL}/login`, { waitUntil: 'networkidle0', timeout: 10000 });
    } catch (error) {
      console.error('❌ Failed to load login page');
      console.error('Make sure frontend is running on port 5173');
      throw error;
    }
    
    await page.type('input[type="email"]', 'admin@wildlife-demo.local');
    await page.type('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
    console.log('✓ Logged in successfully\n');

    const screenshots = [
      {
        name: 'dashboard_home_page',
        action: async () => {
          await page.goto(`${FRONTEND_URL}/dashboard`, { waitUntil: 'networkidle0' });
          await page.waitForTimeout(2000);
        }
      },
      {
        name: 'dashboard_responders',
        action: async () => {
          await page.click('button:has-text("RESPONDERS")');
          await page.waitForTimeout(2000);
        }
      },
      {
        name: 'dashboard_map',
        action: async () => {
          await page.click('button:has-text("MAP")');
          await page.waitForTimeout(3000); // Wait for map to load
        }
      }
    ];

    const results = [];

    for (const screenshot of screenshots) {
      console.log(`Step: Capturing ${screenshot.name}...`);
      
      await screenshot.action();
      
      const outputPath = path.join(OUTPUT_DIR, `${screenshot.name}.png`);
      await page.screenshot({ path: outputPath, fullPage: false });
      console.log(`✓ Screenshot saved: ${outputPath}`);
      
      const referencePath = path.join(REFERENCE_DIR, `${screenshot.name}.png`);
      const diffPath = path.join(OUTPUT_DIR, `${screenshot.name}_diff.png`);
      
      const comparison = await compareImages(referencePath, outputPath, diffPath);
      
      results.push({
        name: screenshot.name,
        ...comparison
      });
      
      if (comparison.match) {
        console.log(`✅ PASS: ${screenshot.name} (${comparison.diff.toFixed(2)}% difference)\n`);
      } else {
        console.log(`❌ FAIL: ${screenshot.name} (${comparison.diff.toFixed(2)}% difference > ${THRESHOLD * 100}%)`);
        console.log(`   Diff image: ${diffPath}\n`);
      }
    }

    console.log('\n=== Summary ===');
    const passed = results.filter(r => r.match).length;
    const failed = results.filter(r => !r.match).length;
    
    console.log(`Passed: ${passed}/${results.length}`);
    console.log(`Failed: ${failed}/${results.length}`);
    
    if (failed > 0) {
      console.log('\n❌ Visual diff check FAILED');
      console.log('Review diff images in:', OUTPUT_DIR);
      process.exit(1);
    } else {
      console.log('\n✅ All visual diff checks PASSED');
    }

  } catch (error) {
    console.error('\n❌ Error during pixel check:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runPixelCheck();
