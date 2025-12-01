import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as fs from 'fs';

chromium.use(StealthPlugin());

const USERNAME = process.env.INSTAGRAM_USER || 'sprrr22';
const PASSWORD = process.env.INSTAGRAM_PASS || 'Kebab123';
const SESSION_FILE = 'instagram_session.json';

async function saveSession() {
    const browser = await chromium.launch({ headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-blink-features=AutomationControlled'
        ] }); // UI för första login
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('https://www.instagram.com');
    await page.waitForTimeout(5000);

    await page.fill('input[name="username"]', USERNAME);
    await page.fill('input[name="password"]', PASSWORD);
    await page.press('input[name="password"]', 'Enter');

    console.log('Logga in manuellt om 2FA behövs...');
    await page.waitForTimeout(20000);

    await context.storageState({ path: SESSION_FILE });
    console.log(`✅ Session sparad i ${SESSION_FILE}`);

    await browser.close();
}

async function autoAcceptCollabs() {
    if (!fs.existsSync(SESSION_FILE)) {
        console.error('Ingen sparad session hittades. Kör saveSession() först.');
        return;
    }

    const browser = await chromium.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-blink-features=AutomationControlled'
        ]
    });

    const context = await browser.newContext({ storageState: SESSION_FILE });
    const page = await context.newPage();

    await page.goto('https://www.instagram.com/accounts/activity/');
    await page.waitForTimeout(6000);

    const acceptButtons = page.locator('//span[contains(text(),"bjudit")]');
    const count = await acceptButtons.count();

    if (count > 0) {
        console.log(`Hittade ${count} förfrågningar. Accepterar...`);
        
            await acceptButtons.nth(0).click();
            await page.waitForTimeout(2000);
        
        console.log('✅ Alla collab-förfrågningar klickade.');
    } else {
        console.log('Inga collab-förfrågningar hittades.');
    }

const acceptButtons2 = page.locator('//div[contains(text(),"Recensera")]');
    const count2 = await acceptButtons2.count();
if (count2 > 0) {
        console.log(`Hittade ${count2} förfrågningar. Accepterar...`);
        
            await acceptButtons2.nth(0).click();
            await page.waitForTimeout(2000);
        
        console.log('✅ Alla collab-förfrågningar recenserade.');
    } else {
        console.log('Inga recensera-förfrågningar hittades.');
    }

const acceptButtons3 = page.locator('//span[contains(text(),"Godkänn")]');
    const count3 = await acceptButtons3.count();
if (count3 > 0) {
        console.log(`Hittade ${count3} förfrågningar. Accepterar...`);
        
            await acceptButtons3.nth(0).click();
            await page.waitForTimeout(2000);
        
        console.log('✅ Alla collab-förfrågningar godkändes.');
    } else {
        console.log('Inga godkänn-förfrågningar hittades.');
    }

    await browser.close();
}

// Kör auto-accept som standard
saveSession();
autoAcceptCollabs();
