import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Voice clips arrive as base64 in the JSON body, so the default 100kb cap is too small.
app.use(express.json({ limit: "12mb" }));

// The API keys sit behind these routes and the free-tier quota is shared by every
// visitor, so cap how fast a single IP can burn it. In-memory is fine for a single
// Cloud Run instance; move to Redis if this ever scales horizontally.
const RATE_LIMIT_WINDOW_MS = 60_000;
// Keys are relative to the /api mount point below, where req.path is "/shark", not "/api/shark".
const RATE_LIMITS: Record<string, number> = {
  "/interact": 20,
  "/transcribe": 30,
  "/shark": 6,
};
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

app.use("/api", (req, res, next) => {
  const limit = RATE_LIMITS[req.path];
  if (!limit) return next();

  const ip = (req.headers["x-forwarded-for"] as string || "").split(",")[0].trim() || req.ip || "unknown";
  const key = `${ip}:${req.path}`;
  const now = Date.now();
  const bucket = rateBuckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (bucket.count >= limit) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    res.set("Retry-After", String(retryAfter));
    return res.status(429).json({ error: "Too many ideas at once! Take a breath and try again.", retryAfter });
  }

  bucket.count++;
  next();
});

// Drop expired buckets so the map cannot grow without bound.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateBuckets) {
    if (now > bucket.resetAt) rateBuckets.delete(key);
  }
}, RATE_LIMIT_WINDOW_MS).unref();

// Initialize Gemini
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Free-tier daily quota is per model per project. If one model's bucket is
// exhausted (429), hop to the next until one answers.
const MODEL_CHAIN = [
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

async function generateWithFallback(config: { contents: any; config: any }) {
  let lastErr: any = null;
  for (const model of MODEL_CHAIN) {
    try {
      return await ai.models.generateContent({ model, ...config });
    } catch (err: any) {
      lastErr = err;
      const msg = String(err);
      if (err?.status === 429 || err?.status === 404 || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("NOT_FOUND")) {
        console.warn(`Model ${model} unavailable (${err?.status}), trying next...`);
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

// The browser asks this on boot to decide which ear to use: Gemini (better with
// young voices and accents) or the built-in Web Speech API.
app.get("/api/capabilities", (_req, res) => {
  res.json({ geminiVoice: Boolean(process.env.GEMINI_API_KEY) });
});

// Asked to transcribe silence, the model does not return [UNCLEAR] - it confidently
// invents a plausible child's answer ("I want to play."), which would credit the kid
// with an idea they never had. No prompt reliably suppresses this, so silence is
// rejected arithmetically before it ever reaches the model. The client gates on mic
// loudness too; this is the backstop that does not depend on a trusted client.
// Measured on 16kHz mono clips: digital silence scores 0, a shy child recorded at 8%
// of full scale scores ~0.014, normal speech ~0.18. 0.005 sits well clear of both edges.
// We score the LOUDEST 100ms window rather than the whole clip, because averaging over
// the whole clip would reject a short "a towel!" surrounded by dead air.
const SPEECH_RMS_THRESHOLD = 0.005;
const WAV_HEADER_BYTES = 44;

function isAudibleWav(base64: string): boolean {
  try {
    const buf = Buffer.from(base64, "base64");
    // Client always sends 16-bit mono PCM WAV: 44-byte header, then samples.
    const sampleCount = Math.floor((buf.length - WAV_HEADER_BYTES) / 2);
    if (sampleCount <= 0) return false;

    const windowSamples = 1600;          // 100ms at 16kHz
    const step = windowSamples / 2;      // 50% overlap so speech cannot straddle a boundary
    let loudest = 0;

    for (let start = 0; start < sampleCount; start += step) {
      const end = Math.min(start + windowSamples, sampleCount);
      let sum = 0;
      for (let i = start; i < end; i++) {
        const sample = buf.readInt16LE(WAV_HEADER_BYTES + i * 2) / 0x8000;
        sum += sample * sample;
      }
      const rms = Math.sqrt(sum / (end - start));
      if (rms > loudest) loudest = rms;
      if (loudest > SPEECH_RMS_THRESHOLD) return true;  // heard enough
    }
    return false;
  } catch {
    // Unparseable audio: let it through and let the model decide.
    return true;
  }
}

// Gemini-powered speech-to-text. Web Speech is a hard floor for our actual users -
// it is Chrome-only and mishears 5-to-11-year-olds constantly - so we transcribe
// with Gemini when we can and let the client fall back when we cannot.
app.post("/api/transcribe", async (req, res) => {
  const { audio, mimeType } = req.body;

  if (!audio || typeof audio !== "string") {
    return res.status(400).json({ ok: false, error: "No audio provided." });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ ok: false, error: "Gemini voice unavailable." });
  }
  if ((mimeType || "audio/wav") === "audio/wav" && !isAudibleWav(audio)) {
    return res.json({ ok: false, error: "unclear" });
  }

  try {
    const response = await generateWithFallback({
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: mimeType || "audio/webm", data: audio } },
            { text: "Transcribe exactly what the child says." }
          ]
        }
      ],
      config: {
        // Deliberately NOT told what the game is about. Describing the scenario here
        // primes the model to invent a plausible kid's answer when it hears silence,
        // which would put words in the child's mouth and wreck the whole premise.
        systemInstruction: `You are a speech-to-text transcription engine. Nothing else.

Output a verbatim transcript of speech that is actually audible in the audio.

RULES:
- Never guess, infer, complete, or invent words. Transcribe only what you actually hear.
- Do not correct grammar, word choice, or pronunciation. Speakers may be young children with unusual phrasing; keep their exact words.
- Never add context, explanation, punctuation-based interpretation, quotes, or labels.
- If the audio contains no intelligible human speech - silence, breathing, background noise, music, or a single unclear syllable - you MUST output exactly: [UNCLEAR]
- Outputting invented speech for silent audio is the worst possible failure. When in doubt, output [UNCLEAR].

Output only the transcript, or [UNCLEAR].`,
        temperature: 0,
      }
    });

    const text = (response.text || "").trim();
    if (!text || text === "[UNCLEAR]") {
      return res.json({ ok: false, error: "unclear" });
    }
    res.json({ ok: true, text });
  } catch (error: any) {
    console.error("Error in /api/transcribe:", error);
    // Signal the client to retry this turn on Web Speech instead of failing the kid.
    res.status(502).json({ ok: false, error: "transcription_failed" });
  }
});

// Curated pool of highly relatable, exciting daily problems for kids
export const CURATED_PROBLEMS = [
  {
    id: "muddy-puppies",
    title: "Muddy Puppies 🐶",
    problem: "When dogs run in the wet park grass, their paws get super muddy and they ruin clean carpets!",
    companion_intro: "Oh no, look! The sweet puppy got his paws all muddy playing in the park! What do you think we should do?",
    initial_elements: [
      { id: "sun-park", type: "scenery", emoji: "☀️", label: "Golden Sun", animation: "pulse", x: 85, y: 12, size: "large" },
      { id: "tree-park", type: "scenery", emoji: "🌳", label: "Big Oak Tree", animation: "wiggle", x: 18, y: 32, size: "large" },
      { id: "bench-park", type: "scenery", emoji: "🪵", label: "Park Bench", animation: "none", x: 50, y: 58, size: "medium" },
      { id: "butterfly-park", type: "scenery", emoji: "🦋", label: "Fluttering Butterfly", animation: "float", x: 26, y: 22, size: "small" },
      { id: "flower-park-1", type: "scenery", emoji: "🌸", label: "Pink Blossom", animation: "wiggle", x: 22, y: 72, size: "small" },
      { id: "flower-park-2", type: "scenery", emoji: "🌷", label: "Red Tulip", animation: "wiggle", x: 58, y: 74, size: "small" },
      { id: "dog-1", type: "character", emoji: "🐕", label: "Happy Puppy", animation: "bounce", x: 15, y: 58, size: "large", bubbleText: "Let's walk!" },
      { id: "mud-1", type: "scenery", emoji: "", label: "Wet Mud Patch", animation: "none", x: 42, y: 70, size: "medium" },
      { id: "rug-1", type: "item", emoji: "🏠", label: "Clean House", animation: "pulse", x: 80, y: 58, size: "large", bubbleText: "Keep me clean!" }
    ]
  },
  {
    id: "thirsty-park",
    title: "Thirsty Park Day 🍋",
    problem: "It is SO hot at the park today. Everyone is thirsty and grumpy, and there is nothing to drink anywhere!",
    companion_intro: "Phew, what a hot day at the park! Everyone is thirsty and grumpy, and there is nothing to drink anywhere! What do you think we should do?",
    initial_elements: [
      { id: "sun-hot", type: "scenery", emoji: "☀️", label: "Blazing Sun", animation: "pulse", x: 80, y: 12, size: "large" },
      { id: "tree-park", type: "scenery", emoji: "🌳", label: "Shady Tree", animation: "wiggle", x: 15, y: 30, size: "large" },
      { id: "kid-ball", type: "character", emoji: "⚽", label: "Football", animation: "none", x: 42, y: 70, size: "small" },
      { id: "boy-1", type: "character", emoji: "🚶", label: "Playing Kid", animation: "bounce", x: 35, y: 58, size: "medium", bubbleText: "So fun!" },
      { id: "girl-1", type: "character", emoji: "🚶‍♀️", label: "Park Friend", animation: "none", x: 60, y: 60, size: "medium", bubbleText: "Hot day!" },
      { id: "bench-1", type: "scenery", emoji: "🪵", label: "Park Bench", animation: "none", x: 75, y: 65, size: "medium" },
      { id: "flower-1", type: "scenery", emoji: "🌸", label: "Blossom", animation: "wiggle", x: 25, y: 74, size: "small" }
    ]
  },
  {
    id: "melting-icecream",
    title: "Melting Ice Cream 🍦",
    problem: "Ice cream melts and drips all over your hands before you can finish it, and the sticky mess ruins the fun!",
    companion_intro: "Uh oh! The ice cream is melting faster than she can eat it, and it is dripping everywhere! What do you think we should do?",
    initial_elements: [
      { id: "sun-ice", type: "scenery", emoji: "☀️", label: "Hot Sun", animation: "pulse", x: 82, y: 12, size: "large" },
      { id: "tree-ice", type: "scenery", emoji: "🌳", label: "Shady Tree", animation: "wiggle", x: 14, y: 30, size: "large" },
      { id: "kid-ice", type: "character", emoji: "🧒", label: "Ice Cream Kid", animation: "bounce", x: 40, y: 58, size: "large", bubbleText: "So yummy!" },
      { id: "cone-1", type: "item", emoji: "🍦", label: "Melting Cone", animation: "shake", x: 52, y: 50, size: "medium", bubbleText: "Drip drip!" },
      { id: "drip-1", type: "effect", emoji: "💧", label: "Sticky Drip", animation: "float", x: 50, y: 70, size: "small" },
      { id: "bench-ice", type: "scenery", emoji: "🪵", label: "Park Bench", animation: "none", x: 74, y: 64, size: "medium" },
      { id: "flower-ice", type: "scenery", emoji: "🌷", label: "Tulip", animation: "wiggle", x: 24, y: 74, size: "small" }
    ]
  },
  {
    id: "lost-teddy",
    title: "Lost Teddy 🧸",
    problem: "Small toys get lost in the long playground grass, and kids go home crying without their favourite teddy!",
    companion_intro: "Oh no! Someone's favourite teddy is lost somewhere in this big grassy playground! What do you think we should do?",
    initial_elements: [
      { id: "sun-lost", type: "scenery", emoji: "☀️", label: "Bright Sun", animation: "pulse", x: 84, y: 12, size: "large" },
      { id: "tree-lost", type: "scenery", emoji: "🌳", label: "Tall Tree", animation: "wiggle", x: 16, y: 30, size: "large" },
      { id: "kid-lost", type: "character", emoji: "👧", label: "Sad Kid", animation: "shake", x: 30, y: 58, size: "large", bubbleText: "Where is he?" },
      { id: "grass-1", type: "scenery", emoji: "🌾", label: "Long Grass", animation: "wiggle", x: 58, y: 70, size: "large" },
      { id: "grass-2", type: "scenery", emoji: "🌿", label: "Thick Grass", animation: "wiggle", x: 72, y: 74, size: "medium" },
      { id: "teddy-1", type: "item", emoji: "🧸", label: "Hidden Teddy", animation: "none", x: 66, y: 72, size: "small", bubbleText: "Help!" },
      { id: "slide-1", type: "scenery", emoji: "🛝", label: "Playground Slide", animation: "none", x: 84, y: 58, size: "medium" }
    ]
  },
  {
    id: "thirsty-birds",
    title: "Thirsty Birds 🐦",
    problem: "In hot summer the garden birds cannot find any water to drink, so they stop visiting and the garden goes quiet!",
    companion_intro: "Listen... the garden is so quiet! The little birds have no water to drink in this heat. What do you think we should do?",
    initial_elements: [
      { id: "sun-bird", type: "scenery", emoji: "☀️", label: "Blazing Sun", animation: "pulse", x: 82, y: 12, size: "large" },
      { id: "tree-bird", type: "scenery", emoji: "🌳", label: "Garden Tree", animation: "wiggle", x: 22, y: 30, size: "large" },
      { id: "bird-1", type: "character", emoji: "🐦", label: "Thirsty Bird", animation: "float", x: 34, y: 34, size: "medium", bubbleText: "So thirsty!" },
      { id: "bird-2", type: "character", emoji: "🕊️", label: "Tired Bird", animation: "float", x: 62, y: 28, size: "small", bubbleText: "No water..." },
      { id: "ground-dry", type: "scenery", emoji: "🍂", label: "Dry Ground", animation: "none", x: 50, y: 72, size: "medium" },
      { id: "flower-bird", type: "scenery", emoji: "🌻", label: "Droopy Sunflower", animation: "shake", x: 74, y: 66, size: "medium", bubbleText: "So dry!" },
      { id: "fence-bird", type: "scenery", emoji: "🪵", label: "Garden Fence", animation: "none", x: 14, y: 68, size: "small" }
    ]
  },
  {
    id: "rainy-books",
    title: "Soggy School Books 📚",
    problem: "Rain soaks school bags on the walk home, and all the homework books turn into soggy mush!",
    companion_intro: "Oh dear, it is pouring! His school books are getting soaked right through his bag! What do you think we should do?",
    initial_elements: [
      { id: "cloud-rain", type: "scenery", emoji: "🌧️", label: "Rain Cloud", animation: "float", x: 60, y: 14, size: "large", bubbleText: "Splish splash!" },
      { id: "cloud-rain-2", type: "scenery", emoji: "☁️", label: "Grey Cloud", animation: "float", x: 24, y: 16, size: "medium" },
      { id: "kid-rain", type: "character", emoji: "🚶", label: "Soaked Kid", animation: "shake", x: 38, y: 58, size: "large", bubbleText: "So wet!" },
      { id: "bag-1", type: "item", emoji: "🎒", label: "Wet School Bag", animation: "shake", x: 50, y: 62, size: "medium", bubbleText: "Dripping!" },
      { id: "book-1", type: "item", emoji: "📚", label: "Soggy Books", animation: "shake", x: 62, y: 70, size: "medium", bubbleText: "Ruined!" },
      { id: "puddle-1", type: "effect", emoji: "💧", label: "Big Puddle", animation: "pulse", x: 74, y: 74, size: "medium" },
      { id: "tree-rain", type: "scenery", emoji: "🌳", label: "Dripping Tree", animation: "wiggle", x: 15, y: 32, size: "large" }
    ]
  }];

// Conversational cartoon scene updating endpoint
app.post("/api/interact", async (req, res) => {
  const { problem, message, history, current_elements, phase } = req.body;

  if (!problem) {
    return res.status(400).json({ error: "No problem text provided." });
  }

  try {
    // If it's the initial load, handle it instantly without LLM latency if we have curated data,
    // OR query Gemini to build a custom initial scene.
    // Let's check if we match a curated problem. If yes, and message is "[INITIAL_SETUP]", return preset elements!
    if (message === "[INITIAL_SETUP]") {
      const match = CURATED_PROBLEMS.find(p => problem.toLowerCase().includes(p.problem.toLowerCase()) || p.problem.toLowerCase().includes(problem.toLowerCase()));
      if (match) {
        return res.json({
          speech: match.companion_intro,
          cartoon_title: match.title,
          elements: match.initial_elements,
          narrative_summary: `Today's big trouble: ${match.problem}`,
          question: "What is your idea?"
        });
      }
    }

    // Work out how the companion should coach on THIS turn, deterministically.
    const kidTurns = (history || []).filter((h: any) => h.role === "user");
    const turnCount = kidTurns.length;
    const stuckRe = /(don'?t know|dunno|no idea|nothing|not sure|maybe|hmm+)/i;
    const stuckStreak = (() => {
      let n = 0;
      for (let i = kidTurns.length - 1; i >= 0; i--) {
        const m = String(kidTurns[i].message || "");
        if (stuckRe.test(m) || m.trim().split(/\s+/).length <= 2) n++; else break;
      }
      return n;
    })();

    let TURN_DIRECTIVE = "";
    if (phase === 'grow') {
      TURN_DIRECTIVE = "Follow the GROW phase steps below, one question per turn, never repeating a question already in the history.";
    } else if (stuckStreak >= 3 || turnCount >= 6) {
      TURN_DIRECTIVE = "THE KID IS STUCK OR THIS HAS GONE ON LONG ENOUGH. STOP ASKING QUESTIONS. Pick the best idea from the whole conversation (or, if there is none, warmly propose washing the paws with warm water and soap yourself), BUILD it into the scene right now, set solved=true, and celebrate the kid's effort. Your \"question\" field must NOT ask about the trouble anymore - make it a happy closing line.";
    } else if (stuckStreak === 2) {
      TURN_DIRECTIVE = "The kid is stuck twice in a row. OFFER one specific idea yourself, warmly, in your speech, and ask only if they want to try it. Example shape: 'I have an idea - what if we washed his paws with warm water? Should we try that?' Do NOT ask another open question.";
    } else if (stuckStreak === 1) {
      TURN_DIRECTIVE = "The kid is a little stuck. Give ONE concrete everyday clue that points at a category without naming the tool, then ask a NEW question you have never asked before.";
    } else {
      TURN_DIRECTIVE = "The kid is engaging well. Ask ONE fresh open cross-question that goes a step deeper than anything already in the history. If they named any plausible fix, BUILD it and set solved=true instead of asking more.";
    }

    const systemInstruction = `You are a creative, magical Cartoon Scene Director for kids.

>>> YOUR SINGLE MOST IMPORTANT INSTRUCTION FOR THIS TURN <<<
${TURN_DIRECTIVE}
Obey that instruction above everything else that follows.

You turn kids' spoken or typed ideas into visual elements (emojis, positions, and animations) in a live sandbox cartoon world!
Target audience is kids aged 5-11. Keep all text output extremely simple, joyful, and short.

CRITICAL PEDAGOGICAL GOAL - THE KID THINKS FIRST, BUT THE STORY MUST ALWAYS MOVE FORWARD:
The kid should reach the idea themselves - but NEVER at the cost of getting stuck. Read the conversation history and count how many times the kid has already answered (turnCount below). Then follow this escalation ladder EXACTLY:

TURN 1-2 (opening): Ask ONE open cross-question, no solutions, no options.
  "What do you think we should do?" / "What happens to mud when it gets wet?"
TURN 3-4 (nudge): If they are still stuck or vague, give a concrete sensory CLUE that points at a category without naming the tool.
  "Hmm, when YOUR hands get sticky and dirty, where do you run to in the house?"
TURN 5 (offer): If they are still stuck, SUGGEST one specific idea yourself, warmly, and ask if they like it.
  "I have an idea - what if we washed his paws with warm water? Should we try that?"
TURN 6+ (resolve): STOP asking. Build the best available idea from the whole conversation, set solved=true, and celebrate the kid.

HARD RULES THAT OVERRIDE EVERYTHING:
- NEVER ask a question that already appears in the conversation history. Read the history first. If your next question is even close to one you already asked, you MUST move one step further down the ladder instead.
- The moment the kid names ANY plausible fix (water, soap, a mat, a towel, a stand, a machine, anything), BUILD IT and set solved=true. Do not keep probing for detail. One cross-question maximum on their idea, then build it.
- "yes", "ok", "sure", "I don't know", or silence after you offered an idea = the kid accepted. Build it and set solved=true.
- Never repeat the same speech twice. Each turn must add something new to the scene.
- Their imperfect idea always beats your perfect one - build THEIR version.
Praise the THINKING ("Smart thinking!"), not just the result.

TURN COUNT: the kid has answered ${turnCount} time(s); they have been stuck ${stuckStreak} turn(s) in a row.

Your primary output is a JSON describing:
1. "speech": What the animal companion says to the kid (max 20 words!). It must be super warm, enthusiastic, and sound like a cartoon companion (e.g. Buddy the dog, Cleo the cat, Whiskers, Luna). It must either praise the kid's choice or guide the kid with a playful hint or choice!
2. "cartoon_title": A short name for the growing masterpiece (max 3 words).
3. "elements": The updated full array of visual cartoon elements present on screen.
   - If the Kid's latest idea/action is exactly "[INITIAL_SETUP]", you MUST generate 3 to 5 cute initial elements representing the trouble and place them nicely.
   - The dog is one full-body dog '🐕' (id 'dog-1'). When muddy, keep the muddy paw-print trail '🐾' near him. NEVER use the '💩' emoji anywhere - for mud, use elements whose label contains 'Mud Splat' or 'Mud Patch' with an empty emoji string; the game draws real mud for those. When the kid's invention cleans him: remove all mud, prints, and splats, make the dog sparkle ('🐕' plus a separate '✨' effect beside him, happy bubbleText), and add washing elements like bubbles '🧼' and splashes '💦'.
   - Only when the kid actually decides and describes a cleaning step (like "soap", "bubbles", "shampoo", "hose", "water", "sponge", "wipe"), update the elements to represent that step! REMOVE every muddy element (all mud patches, splats, and paw-print trails), make the dog happy with a sparkle '✨' beside him, and add beautiful washing elements like soap bubbles '🧼' or water splashes '💦'.
   - Ensure the park scenery remains beautiful, rich, and realistic with green trees '🌳', gorgeous flowers '🌸', '🌷', butterflies '🦋', a park bench '🪵', a fountain '⛲', or a shiny sun '☀️'.
   - If the kid invents a stand, shop, or stall (like a lemonade stand): add ONE element whose label contains the word 'Stand' (e.g. label 'Lemonade Stand', id 'stand-1', emoji '🍋', size 'large') - the game draws a real stall for it. Then over the following turns show happy customers walking up and queueing ('🧒', '👧', '👵' with bubbleText like "Yum!" or "One please!"). Customers should be full-body walking people ('🚶', '🚶‍♀️', '🧍') with animation 'walk'.
   - 'animation' may also be 'walk' for characters who are walking or arriving.
   - Emojis should be extremely expressive, bright, and fun.
   - Position 'x' is horizontal percent (10 to 90).
   - Position 'y' is vertical percent (10 to 80).
   - 'animation' must be: 'bounce' | 'spin' | 'float' | 'wiggle' | 'pulse' | 'none'.
   - 'size' must be: 'small' | 'medium' | 'large'.
   - 'bubbleText' is an optional tiny thought or speech bubble (max 3 words) that floats above that specific item or character (e.g., "Yay, clean!", "Wee! Bath time!").
4. "narrative_summary": A very fun, short story-book paragraph describing how the kid's creative inventions are solving this problem step-by-step. Keep it cute and positive!
5. "question": ONE open cross-question that makes the kid think harder. Max 15 words. It must NEVER contain a solution, tool name, or options to pick from. (e.g., "What do you think mud is afraid of?")
6. "invention_cost": Whole number of coins (0-10) this step's new supplies cost. Real things the kid adds (soap, sponge, umbrella, pool) cost 2-6 coins. Nothing new added = 0. Mention the cost playfully in "speech" when above 0 (e.g., "The bubbly soap costs 3 coins!").
7. "coins_earned": Whole number of coins (0-15) earned THIS step. Award coins only when the kid's idea clearly helps (5-10), or fully solves the trouble (10-15). Otherwise 0.
8. "solved": true ONLY when the trouble is truly fixed (paws clean, ice cream safe, toy found, birds drinking). Otherwise false.
9. "phase_done": ONLY relevant in the GROW phase (see below). false in every other case.

${phase === 'grow' ? `CURRENT PHASE: GROW - THE TROUBLE IS ALREADY SOLVED BY THE KID'S OWN INVENTION.
Do NOT solve anything anymore. Keep "solved" true. Now grow their empathy and founder thinking, ONE question at a time, strictly in this order (move to the next step only after they answer the current one - check the conversation history to see which step you are on):
STEP 1 - Empathy: "How many people do you think have this same problem? Do you know someone?"
STEP 2 - Mission: "Do you want to help them too?"
STEP 3 - Choice: If they want to help: "Do you want to help for free, or make a little ice-cream money from it?" (This is the ONLY time you may name options - it is a values choice, not a solution.)
STEP 4 - Plan invite: If they chose money: "Should we make a plan together?" If they chose free: praise their kind heart, ask how they would still tell people about it, then set phase_done=true.
STEP 5 - Plan, one question per turn: "How will you tell your friends and neighbors about it?" then "How could you make it bigger so more people can use it?"
After the kid has answered at least two plan questions, set phase_done=true and give a proud, warm summary of THEIR whole plan in "speech".
While growing: update the scene to show the idea spreading - more happy characters arriving, a little stand, more sparkles. Award small coins_earned (2-5) for thoughtful answers.
Never push money. Helping for free is also a win. Praise every answer.` : `CURRENT PHASE: SOLVE.
Focus ONLY on solving the trouble through the kid's own thinking. Do NOT mention money, business, customers, or selling yet - that comes later. Supplies may still cost coins (invention_cost). When the trouble is truly fixed, set solved=true and celebrate the kid's invention in "speech" - and ask NO further question about the trouble; the next stage begins automatically.`}

SAFETY RULE:
- Absolutely NO weapons, violence, bad words, romance, or personal information sharing.

INPUT INFORMATION PROVIDED:
- Today's Trouble: "${problem}"
- Kid's latest idea/action: "${message}"
- Conversation history: ${JSON.stringify(history || [])}
- Currently visible elements on canvas: ${JSON.stringify(current_elements || [])}

Create an exciting, interactive cartoon translation! Make sure you use guiding cross-questions to let the kid lead the discovery!`;

    const prompt = `Translate this kid's input into the updated cartoon world state!
Latest input: "${message}"`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            speech: { type: Type.STRING },
            cartoon_title: { type: Type.STRING },
            elements: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  emoji: { type: Type.STRING },
                  label: { type: Type.STRING },
                  animation: { type: Type.STRING },
                  x: { type: Type.INTEGER },
                  y: { type: Type.INTEGER },
                  size: { type: Type.STRING },
                  bubbleText: { type: Type.STRING }
                },
                required: ["id", "type", "emoji", "label", "animation", "x", "y", "size"]
              }
            },
            narrative_summary: { type: Type.STRING },
            question: { type: Type.STRING },
            invention_cost: { type: Type.INTEGER },
            coins_earned: { type: Type.INTEGER },
            solved: { type: Type.BOOLEAN },
            phase_done: { type: Type.BOOLEAN }
          },
          required: ["speech", "cartoon_title", "elements", "narrative_summary", "question", "invention_cost", "coins_earned", "solved", "phase_done"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response text received from Gemini.");
    }

    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Error in /api/interact:", error);
    // Return a safe fallback response if Gemini fails so the kid doesn't see an error screen
    res.json({
      speech: "Whoa, that idea was so magical it shook our cartoon world! Let's keep building!",
      cartoon_title: "My Amazing Idea",
      elements: current_elements || [],
      narrative_summary: "We are building an awesome solution together!",
      question: "What else should we add?"
    });
  }
});

// Shark Sana reviews the kid's solved invention and scores their business brain
app.post("/api/shark", async (req, res) => {
  const { problem, history, coins } = req.body;

  try {
    const systemInstruction = `You are Shark Sana, a warm but sharp cartoon shark investor in a kids game (ages 5-11).
The kid just solved today's trouble with their own invention. Review their whole conversation and score them.

Output JSON:
1. "speech": Your spoken review, max 45 words. Confident, kind, a little dramatic ("Splash! I'm Shark Sana!"). Announce each score with one playful reason. If invested, say you are giving 20 coins. Never mock the kid; always end positive.
2. "creativity": 0-10. Fresh, imaginative invention?
3. "business_brain": 0-10. Did they ever think about WHO pays, price, or earning coins? Low if never mentioned.
4. "math_sense": 0-10. Did costs vs earnings roughly make sense?
5. "invested": true if average of the three scores is 7 or higher.
6. "tip": ONE practical, kid-level business tip, max 12 words.

SAFETY: no violence, romance, bad words, or personal data. Simple words only.

Today's trouble: "${problem}"
Kid's current coins: ${coins}
Conversation: ${JSON.stringify(history || [])}`;

    const response = await generateWithFallback({
      contents: "Review the kid's invention and give your shark verdict!",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            speech: { type: Type.STRING },
            creativity: { type: Type.INTEGER },
            business_brain: { type: Type.INTEGER },
            math_sense: { type: Type.INTEGER },
            invested: { type: Type.BOOLEAN },
            tip: { type: Type.STRING }
          },
          required: ["speech", "creativity", "business_brain", "math_sense", "invested", "tip"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini.");
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Error in /api/shark:", error);
    res.json({
      speech: "Splash! What a day of inventing! You solved the trouble with your own idea - I love it. Keep thinking about who pays, little founder!",
      creativity: 8,
      business_brain: 6,
      math_sense: 6,
      invested: true,
      tip: "Ask who else would pay for your idea!"
    });
  }
});

// Serve frontend assets and start server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
