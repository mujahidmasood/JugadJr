/**
 * Records the 1-minute prototype demo video by playing a full session in Chrome.
 *
 * Captures the page viewport only - no browser chrome, no tabs, nothing but the game.
 * Every answer is typed, so the whole run is deterministic and repeatable.
 *
 * Plays ONE trouble start to finish: intro -> the trouble plays out -> invent the
 * fix -> the grow questions -> Shark Sana's verdict. Deliberately a single
 * scenario; cutting between two troubles reads as confusing, not impressive.
 *
 * Writes frames plus milestones.json (frame indices for caption timing).
 *
 *   node scripts/record-video.mjs <url> <outDir>
 */
import puppeteer from 'puppeteer-core';
import { mkdir, rm, writeFile } from 'node:fs/promises';

const URL = process.argv[2] || 'http://localhost:8115';
const OUT = process.argv[3] || '/tmp/jugadjr-video';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FPS = 10;

// Queue of answers, in order. Solve first, then the grow/empathy questions.
const ANSWERS = [
  'we can wipe his paws with a doormat by the door',
  'lots of people at the park have muddy dogs too',
  'yes i want to help them',
  'make a little money',
  'yes lets make a plan',
  'i will put up posters at the park gate',
  'ask the pet shop to tell people about it',
];

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--hide-scrollbars', '--force-device-scale-factor=1', '--mute-audio'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });

let n = 0;
const milestones = [];
const mark = (label) => { milestones.push({ label, frame: n }); console.log(`  [${n}] ${label}`); };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Puppeteer serialises CDP commands per page, so a background capture loop
// deadlocks against page.type()/click(). Capture sequentially instead: every
// wait in this script is a wait that also records frames.
const shot = async () => {
  try { await page.screenshot({ path: `${OUT}/f${String(n++).padStart(5, '0')}.png` }); } catch {}
};
const hold = async (ms) => {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const t = Date.now();
    await shot();
    await sleep(Math.max(0, 1000 / FPS - (Date.now() - t)));
  }
};
const text = () => page.evaluate(() => document.body.innerText);

const typeInto = async (sel, str) => {
  await page.focus(sel);
  for (const ch of str) { await page.type(sel, ch, { delay: 0 }); await shot(); }
};

// Wait until the model has finished and the companion has asked something new.
const waitForTurn = async (timeout = 45000) => {
  const end = Date.now() + timeout;
  await hold(700);
  while (Date.now() < end) {
    const t = await text();
    if (!t.includes('Drawing…')) {
      const busy = await page.$('input[placeholder*="type your idea"][disabled]');
      if (!busy) return true;
    }
    await hold(400);
  }
  return false;
};

await page.evaluateOnNewDocument(() => localStorage.clear());
await page.goto(URL, { waitUntil: 'networkidle2' });
await hold(1200);

// --- Intro ---
mark('intro');
for (let i = 0; i < 3; i++) {
  await hold(2100);
  const [btn] = await page.$$('xpath/.//button[contains(., "Next") or contains(., "Let\'s solve")]');
  if (btn) await btn.click();
  await hold(400);
}
mark('the trouble plays out');
await hold(11000);           // the dog walks across the park and into the mud

// --- Solve, then the grow questions ---
for (let i = 0; i < ANSWERS.length; i++) {
  const shark = await page.evaluate(() => /Shark Sana|Creativity|Business Brain/i.test(document.body.innerText));
  if (shark) break;

  const box = await page.$('input[placeholder*="type your idea"]');
  if (!box) break;

  mark(i === 0 ? 'their idea' : `grow answer ${i}`);
  await typeInto('input[placeholder*="type your idea"]', ANSWERS[i]);
  await hold(600);
  const [send] = await page.$$('xpath/.//button[contains(., "Send")]');
  if (send) await send.click();
  if (i === 0) mark('idea gets built');
  await waitForTurn();
  await hold(2200);
}

// --- Shark verdict ---
const end = Date.now() + 40000;
while (Date.now() < end) {
  if (await page.evaluate(() => /Shark Sana|Creativity|Business Brain/i.test(document.body.innerText))) break;
  await hold(500);
}
mark('shark verdict');
await hold(6000);

await writeFile(`${OUT}/milestones.json`, JSON.stringify(milestones, null, 2));
console.log(`\ncaptured ${n} frames (~${(n / FPS).toFixed(1)}s) -> ${OUT}`);
await browser.close();
