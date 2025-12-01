import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Add stealth plugin - this uses the actual puppeteer stealth plugin!
chromium.use(StealthPlugin());

async function testBotDetection() {
    console.log('🚀 Starting Playwright Stealth Test...\n');

    // Launch browser with stealth
    const browser = await chromium.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-blink-features=AutomationControlled'
        ]
    });

    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1366, height: 768 }
    });

    const page = await context.newPage();

    
        // Test with bot detection site
        console.log('📍 Testing: instagram');
        await page.goto('https://www.instagram.com', { waitUntil: 'load' });

        // Get page title
        const title = await page.title();
        console.log(`📄 Page title: ${title}`);

        // Log key page elements that indicate detection status
        console.log('\n🧪 Detection Test Results:');
        
            await page.fill('input[name="username"]', 'sprrr22');
    await page.fill('input[name="password"]', 'Kebab123');
    await page.press('input[name="password"]', 'Enter');

    console.log('Logga in manuellt om 2FA behövs...');
    await page.waitForTimeout(20000);
                        
            

            // Analyze 
        await browser.close();
    

// Run the test
testBotDetection().catch(console.error);