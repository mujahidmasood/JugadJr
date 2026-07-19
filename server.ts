import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

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

// Curated pool of highly relatable, exciting daily problems for kids
export const CURATED_PROBLEMS = [
  {
    id: "muddy-puppies",
    title: "Muddy Puppies 🐶",
    problem: "When dogs run in the wet park grass, their paws get super muddy and they ruin clean carpets!",
    companion_intro: "Oh no, look! The sweet puppy is playing in a beautiful park but has separate fluffy paws that got super muddy! What can we build to wash his feet?",
    initial_elements: [
      { id: "sun-park", type: "scenery", emoji: "☀️", label: "Golden Sun", animation: "pulse", x: 85, y: 12, size: "large" },
      { id: "tree-park", type: "scenery", emoji: "🌳", label: "Big Oak Tree", animation: "wiggle", x: 18, y: 32, size: "large" },
      { id: "bench-park", type: "scenery", emoji: "🪵", label: "Park Bench", animation: "none", x: 50, y: 58, size: "medium" },
      { id: "butterfly-park", type: "scenery", emoji: "🦋", label: "Fluttering Butterfly", animation: "float", x: 26, y: 22, size: "small" },
      { id: "flower-park-1", type: "scenery", emoji: "🌸", label: "Pink Blossom", animation: "wiggle", x: 22, y: 72, size: "small" },
      { id: "flower-park-2", type: "scenery", emoji: "🌷", label: "Red Tulip", animation: "wiggle", x: 58, y: 74, size: "small" },
      { id: "dog-1", type: "character", emoji: "🐶", label: "Happy Puppy", animation: "bounce", x: 15, y: 55, size: "large", bubbleText: "Let's walk!" },
      { id: "paw-front", type: "item", emoji: "🐾", label: "Front Paw", animation: "bounce", x: 12, y: 66, size: "small" },
      { id: "paw-back", type: "item", emoji: "🐾", label: "Back Paw", animation: "bounce", x: 18, y: 66, size: "small" },
      { id: "mud-1", type: "scenery", emoji: "💩", label: "Wet Mud Patch", animation: "none", x: 42, y: 70, size: "medium" },
      { id: "rug-1", type: "item", emoji: "🏠", label: "Clean House", animation: "pulse", x: 80, y: 58, size: "large", bubbleText: "Keep me clean!" }
    ]
  },
  {
    id: "sad-squirrels",
    title: "Melting Squirrel Ice Cream 🐿️🍦",
    problem: "The squirrels' homemade nut-ice-cream is melting super fast under the burning summer sun!",
    companion_intro: "Look up there! The hot summer sun is melting the squirrels' delicious acorn ice cream! What cool cartoon gadget can we create to shield and cool them?",
    initial_elements: [
      { id: "sun-1", type: "scenery", emoji: "☀️", label: "Hot Sun", animation: "pulse", x: 50, y: 15, size: "large", bubbleText: "So hot!" },
      { id: "squirrel-1", type: "character", emoji: "🐿️", label: "Sad Squirrel", animation: "shake", x: 30, y: 60, size: "medium", bubbleText: "My ice cream!" },
      { id: "cart-1", type: "item", emoji: "🍦", label: "Melting Cart", animation: "wiggle", x: 45, y: 62, size: "large", bubbleText: "Drip drop!" },
      { id: "sweat-1", type: "effect", emoji: "💦", label: "Melting", animation: "float", x: 45, y: 50, size: "small" }
    ]
  },
  {
    id: "lost-toys",
    title: "Lost Playground Toys 🔍🧸",
    problem: "Kids keep losing their tiny puzzle pieces, shiny keys, and toy cars in the thick tall grass of the playground!",
    companion_intro: "Yikes! Small toys are slipping into the giant grass jungle, and our friends are sad! What kind of neat finder tool or robotic seeker can we build on our canvas?",
    initial_elements: [
      { id: "grass-1", type: "scenery", emoji: "🌾", label: "Tall Grass", animation: "wiggle", x: 50, y: 68, size: "large" },
      { id: "toy-1", type: "item", emoji: "🚗", label: "Lost Car", animation: "none", x: 48, y: 75, size: "small", bubbleText: "Where am I?" },
      { id: "kid-1", type: "character", emoji: "😭", label: "Sad Friend", animation: "shake", x: 25, y: 55, size: "medium", bubbleText: "My toy!" },
      { id: "question-1", type: "effect", emoji: "❓", label: "Mystery", animation: "float", x: 48, y: 55, size: "small" }
    ]
  },
  {
    id: "thirsty-birds",
    title: "Hot Thirsty Birds 🦜💧",
    problem: "Beautiful rainbow birds are visiting the garden, but the water fountain is dry and they are very hot and thirsty!",
    companion_intro: "The cute garden birds are flapping around with dry beaks because the water fountain is empty! What amazing cartoon splash pool or bird-cozy oasis should we design?",
    initial_elements: [
      { id: "bird-1", type: "character", emoji: "🦜", label: "Thirsty Bird", animation: "shake", x: 30, y: 40, size: "medium", bubbleText: "Water please!" },
      { id: "sun-2", type: "scenery", emoji: "☀️", label: "Blazing Sun", animation: "pulse", x: 75, y: 15, size: "large" },
      { id: "bowl-empty", type: "item", emoji: "🥣", label: "Dry Fountain", animation: "none", x: 55, y: 65, size: "large", bubbleText: "Dry!" },
      { id: "flower-sad", type: "scenery", emoji: "🥀", label: "Sad Flower", animation: "none", x: 75, y: 68, size: "medium" }
    ]
  }
];

// Conversational cartoon scene updating endpoint
app.post("/api/interact", async (req, res) => {
  const { problem, message, history, current_elements } = req.body;

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
          question: "What should we build first?"
        });
      }
    }

    const systemInstruction = `You are a creative, magical Cartoon Scene Director for kids.
You turn kids' spoken or typed ideas into visual elements (emojis, positions, and animations) in a live sandbox cartoon world!
Target audience is kids aged 5-11. Keep all text output extremely simple, joyful, and short.

CRITICAL PEDAGOGICAL GOAL:
Our goal is to enable the kid to reach the solution themselves! Do NOT just instantly provide or draw the complete solution if the kid says "I don't know", "help", or gives simple or hesitant inputs. 
Instead, your "speech" and "question" MUST guide the kid step-by-step by asking playful cross-questions and offering fun, imaginative choices (e.g., "Should we wash them with bubbly warm soap or use a giant wet sponge? Which one first?").
Always encourage the kid to make the creative decisions and tell you what to draw next. If they say "I don't know", give them two funny options to choose from!

Your primary output is a JSON describing:
1. "speech": What the animal companion says to the kid (max 20 words!). It must be super warm, enthusiastic, and sound like a cartoon companion (e.g. Buddy the dog, Cleo the cat, Whiskers, Luna). It must either praise the kid's choice or guide the kid with a playful hint or choice!
2. "cartoon_title": A short name for the growing masterpiece (max 3 words).
3. "elements": The updated full array of visual cartoon elements present on screen.
   - If the Kid's latest idea/action is exactly "[INITIAL_SETUP]", you MUST generate 3 to 5 cute initial elements representing the trouble and place them nicely.
   - For the Muddy Puppies park scene, the dog has separate feet/paws ('paw-front' with emoji 🐾 or 💩🐾, and 'paw-back' with emoji 🐾 or 💩🐾) placed right beneath the dog. Make sure to keep these paws relative to the dog's x position.
   - Only when the kid actually decides and describes a cleaning step (like "soap", "bubbles", "shampoo", "hose", "water", "sponge", "wipe"), update the elements to represent that step! REMOVE any muddy aspects, change dirty/sad paw emojis ('💩🐾') to clean/sparkling/bubbly paw emojis ('✨🐾✨' or '🐾'), make the dog happy ('✨🐶✨' or '🐶' with happy bubbleText), and add beautiful washing elements like soap bubbles '🧼' or water splashes '💦'.
   - Ensure the park scenery remains beautiful, rich, and realistic with green trees '🌳', gorgeous flowers '🌸', '🌷', butterflies '🦋', a park bench '🪵', a fountain '⛲', or a shiny sun '☀️'.
   - Emojis should be extremely expressive, bright, and fun.
   - Position 'x' is horizontal percent (10 to 90).
   - Position 'y' is vertical percent (10 to 80).
   - 'animation' must be: 'bounce' | 'spin' | 'float' | 'wiggle' | 'pulse' | 'none'.
   - 'size' must be: 'small' | 'medium' | 'large'.
   - 'bubbleText' is an optional tiny thought or speech bubble (max 3 words) that floats above that specific item or character (e.g., "Yay, clean!", "Wee! Bath time!").
4. "narrative_summary": A very fun, short story-book paragraph describing how the kid's creative inventions are solving this problem step-by-step. Keep it cute and positive!
5. "question": A quick, playful, guiding cross-question to help the kid arrive at the next step or solution themselves by offering choices. Max 15 words. (e.g., "Should we wash them with bubbly soap or a giant wet sponge?")

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

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
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
            question: { type: Type.STRING }
          },
          required: ["speech", "cartoon_title", "elements", "narrative_summary", "question"]
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
