import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

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

async function generateWithFallback(config: { contents: string; config: any }) {
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
