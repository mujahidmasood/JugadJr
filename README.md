# JugadJr

**A Socratic tutor that cannot let a child give up — and scores how they think like a founder.**

Kids aged 5–11 watch a small trouble unfold in a cartoon world, say their own idea out loud, and watch the world change to match it. Then a shark investor reviews what they built.

🔗 **Live:** https://jugadjr-372821245947.europe-west1.run.app

---

## The problem with AI tutors for kids

Give a child an LLM and one of two things happens. It hands them the answer, so they learn nothing. Or it keeps asking open-ended questions until the child gets frustrated and quits.

Both failure modes come from the same place: the model decides, turn by turn, how hard to push. Models are bad at that, and children have no patience for the times they get it wrong.

## What we built instead

JugadJr takes that decision away from the model.

Before every turn, the server counts how many times the child has answered and how many times in a row they've stalled — `"dunno"`, `"maybe"`, two words or fewer. That count selects a directive injected at the very top of the system prompt, above everything else:

| Situation | What the companion is forced to do |
|---|---|
| Engaging | Ask one fresh question, deeper than any asked before |
| Stuck once | Give one concrete sensory clue, then a genuinely new question |
| Stuck twice | Stop asking. Offer a specific idea and ask if they like it |
| Stuck 3× or 6 turns in | Stop entirely. Build the best available idea, celebrate, move on |

The model never chooses when to back off. The code does, deterministically. **A child cannot get stuck in JugadJr, and a child cannot be handed the answer early.** That guarantee is the product.

The moment they name any plausible fix — water, soap, a mat, a towel, a machine — it gets built into the scene, and their imperfect version always beats the model's perfect one.

## The second half: do they think like a founder?

Once the trouble is solved, the game shifts into a `grow` phase and walks a fixed empathy ladder, one question per turn: *Who else has this problem? Do you want to help them? For free, or to earn a little? How would you tell people?*

Then **Shark Sana** reviews the whole transcript and scores three things:

- **Creativity** — was the invention actually theirs?
- **Business brain** — did they ever think about who pays?
- **Math sense** — did costs and earnings roughly line up?

Score 7+ and she invests. Every review ends positive. This is the parent-facing artifact: not "your child played for 20 minutes," but a read on how they reason.

Helping for free is scored as a win. The game never pushes money.

---

## How it uses Gemini

Gemini runs three jobs, all through structured JSON output:

**1. Scene director** (`/api/interact`) — turns a spoken idea into a full array of positioned emoji elements with animations and speech bubbles, plus the companion's line, coin costs, coins earned, and a `solved` flag. The response schema is enforced, so the game never parses prose.

**2. Ears** (`/api/transcribe`) — speech-to-text tuned for the actual users. The browser's built-in recogniser is Chrome-only and mishears young children and non-US accents constantly. Gemini is prompted to transcribe *without* correcting grammar or completing sentences, so a five-year-old's real words reach the game. Audio is captured with `MediaRecorder`, re-encoded in-browser to 16 kHz mono WAV, and posted as base64.

**3. Investor** (`/api/shark`) — reads the full conversation and returns the three scores, the verdict, and one practical tip.

### Degradation, everywhere

Nothing in this app is allowed to show a child an error.

- **No Gemini key, or no `MediaRecorder`?** Voice silently falls back to the Web Speech API.
- **Transcription fails?** That turn falls back to Web Speech.
- **Audio unintelligible?** The companion warmly asks again instead of stalling.
- **Model returns 429 or 404?** `MODEL_CHAIN` hops to the next Gemini model — free-tier quota is per model, so an exhausted bucket is not an outage.
- **Every model fails?** A canned in-character response keeps the story moving.

### Abuse control

`/api/interact`, `/api/transcribe` and `/api/shark` are rate-limited per IP per minute (20 / 30 / 6). The API key and the shared free-tier quota sit behind those routes.

---

## Stack

React 19 + Vite + Tailwind 4 on the front, Express + `@google/genai` on the back, containerised and deployed to Google Cloud Run. No database — progress and coins live in `localStorage`.

```
server.ts                  API, curated troubles, prompt logic, rate limiting
src/App.tsx                game loop, canvas, voice capture, WAV encoding
src/components/            companion avatars, inspiration presets
```

## Run locally

```bash
npm install
echo "GEMINI_API_KEY=your_key_here" > .env
npm run dev          # http://localhost:3000
```

Without a key the app still runs — curated scenes load, voice uses Web Speech, and the canned fallbacks stand in for the model.

```bash
npm run build && npm start   # production build
npm run lint                 # tsc --noEmit
```

## Adding a trouble

Append an entry to `CURATED_PROBLEMS` in both `server.ts` and `src/App.tsx`. Anything without a bespoke animation gets a generic "it gets worse, then we ask" opening beat automatically — new troubles are data, not code.

---

## Why "Jugad"

*Jugad* is the art of solving a real problem with whatever is actually in front of you. No budget, no permission, no perfect parts. That instinct is worth teaching, and it doesn't belong to any one country — every child everywhere has some of it before school trains it out of them.
