import { chromium } from 'playwright-extra';
import { BrowserContext } from 'playwright'; // Typen kommer från Playwrightimport * as fs from 'fs';

const USERNAME = ${{shared.INSTAGRAM_USER}};
const PASSWORD = ${{shared.INSTAGRAM_PASSWORD}};
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

    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 800 },
        locale: 'sv-SE'
    });

    const page = await context.newPage();

    // Stealth tweaks
    await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
        Object.defineProperty(navigator, 'languages', { get: () => ['sv-SE', 'en'] });
    });

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

    const context: BrowserContext = await browser.newContext({
        storageState: SESSION_FILE,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 800 },
        locale: 'sv-SE'
    });

    const page = await context.newPage();

    await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => false });
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
        Object.defineProperty(navigator, 'languages', { get: () => ['sv-SE', 'en'] });
    });

    await page.goto('https://www.instagram.com/accounts/activity/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(6000);

    async function clickAll(locator: string): Promise<void> {
        const buttons = page.locator(locator);
        const count = await buttons.count();
        if (count > 0) {
            console.log(`Hittade ${count} förfrågningar. Klickar...`);
            for (let i = 0; i < count; i++) {
                await buttons.nth(i).click();
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
    if (!fs.existsSync(SESSION_FILE)) {
        console.log('Ingen session hittades. Skapar ny...');
        await saveSession();
    } else {
        console.log('✅ Sparad session hittades. Hoppar över login.');
    }

    await autoAcceptCollabs();
})();