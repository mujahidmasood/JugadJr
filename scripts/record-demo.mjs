/**
 * Records the README demo GIF by driving a real session in Chrome.
 *
 * Not a mockup: it walks the intro, types a trouble that is in none of the curated
 * list, and answers with a child's idea, capturing frames throughout. Run the app
 * first, then: node scripts/record-demo.mjs [url] [outDir]
 */
import puppeteer from 'puppeteer-core';
import { mkdir, rm } from 'node:fs/promises';

const URL = process.argv[2] || 'http://localhost:8114';
const OUT = process.argv[3] || '/tmp/jugadjr-frames';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const TROUBLE = 'my little brother keeps losing his shoes and we are late for school';
const IDEA = 'a shoe parking spot by the door with his name on it';

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--window-size=1280,860', '--hide-scrollbars', '--force-device-scale-factor=1'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 860 });

let n = 0;
const shot = async () => page.screenshot({ path: `${OUT}/f${String(n++).padStart(4, '0')}.png` });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Capture continuously so animation (walking, drop-in, sparkles) is actually in the GIF.
const hold = async (ms, every = 200) => {
  const end = Date.now() + ms;
  while (Date.now() < end) { await shot(); await sleep(every); }
};

const type = async (sel, text) => {
  await page.click(sel);
  for (const ch of text) {          // real keystrokes so it reads as typing
    await page.type(sel, ch, { delay: 0 });
    if (Math.random() < 0.35) await shot();
    await sleep(28);
  }
};

// Always start at the intro.
await page.evaluateOnNewDocument(() => localStorage.clear());
await page.goto(URL, { waitUntil: 'networkidle2' });
await sleep(600);

// --- Intro cards ---
for (let i = 0; i < 3; i++) {
  await hold(1500);
  const [btn] = await page.$$('xpath/.//button[contains(., "Next") or contains(., "Let\'s solve")]');
  if (btn) await btn.click();
  await sleep(500);
}
await hold(2500);   // opening scene loads and the dog walks into the mud

// --- The child brings their own trouble ---
await type('input[placeholder*="trouble do YOU"]', TROUBLE);
await hold(600);
await page.click('form button[type="submit"]');
await hold(9000);   // Gemini builds a bespoke world

// --- The child answers with their own idea ---
await type('input[placeholder*="type your idea"]', IDEA);
await hold(600);
const [send] = await page.$$('xpath/.//button[contains(., "Send")]');
if (send) await send.click();
await hold(11000);  // scene rebuilds around their idea

console.log(`captured ${n} frames -> ${OUT}`);
await browser.close();
