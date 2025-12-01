import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as fs from 'fs';

chromium.use(StealthPlugin());

const USERNAME = process.env.INSTAGRAM_USER || 'sprrr22';
const PASSWORD = process.env.INSTAGRAM_PASS || 'Kebab123';
const SESSION_FILE = 'instagram_session.json';


async function saveSession(): Promise<void> {
    const browser = await chromium.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-blink-features=AutomationControlled'
        ]
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto('https://www.instagram.com', { waitUntil: 'networkidle' });
    await page.waitForSelector('input[name="username"]');

    await page.fill('input[name="username"]', USERNAME);
    await page.fill('input[name="password"]', PASSWORD);
    await page.press('input[name="password"]', 'Enter');

    console.log('Logga in manuellt om 2FA behövs...');
    await page.waitForTimeout(20000);

    await context.storageState({ path: SESSION_FILE });
    console.log(`✅ Session sparad i ${SESSION_FILE}`);

    await browser.close();
}

async function autoAcceptCollabs(): Promise<void> {
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

    const context: BrowserContext = await browser.newContext({ storageState: SESSION_FILE });
    const page = await context.newPage();

    await page.goto('https://www.instagram.com/accounts/activity/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(6000);

    // Typa locator som string
    async function clickAll(locator: string): Promise<void> {
        const buttons = page.locator(locator);
        const count = await buttons.count();
        if (count > 0) {
            console.log(`Hittade ${count} förfrågningar. Klickar...`);
            for (let i = 0; i < count; i++) {
                await buttons.nth(0).click();
                await page.waitForTimeout(2000);
            }
            console.log('✅ Alla förfrågningar hanterade.');
        } else {
            console.log(`Inga förfrågningar hittades för ${locator}.`);
        }
    }

    await clickAll('//span[contains(text(),"bjudit")]');
    await clickAll('//div[contains(text(),"Recensera")]');
    await clickAll('//span[contains(text(),"Godkänn")]');

    await browser.close();
}

// ✅ Kör i rätt ordning
(async () => {
    await saveSession();
    await autoAcceptCollabs();
})();})();