import React, { useState } from 'react';
import { Lock, X, ShieldCheck } from 'lucide-react';

/**
 * Parental gate.
 *
 * This is an AGE check, not authentication. It is the pattern Apple (App Review
 * 1.3) and Google Play Families require: a challenge a young child is unlikely to
 * pass, guarding grown-up-only areas. There is deliberately no PIN and no secret
 * to distribute - anyone who can do the arithmetic gets in, which is the point.
 *
 * It is honestly not childproof against a determined 11-year-old. No arithmetic
 * gate is. It exists to stop a 5-year-old wandering into settings and to give
 * parents one place that states plainly what the app does with their child's voice.
 */

// Two-digit x one-digit with a carry: trivial for an adult, awkward for a young child.
function newChallenge() {
  const a = 12 + Math.floor(Math.random() * 8);   // 12-19
  const b = 4 + Math.floor(Math.random() * 5);    // 4-8
  return { a, b, answer: a * b };
}

export const ParentGate: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [challenge, setChallenge] = useState(newChallenge);
  const [entry, setEntry] = useState("");
  const [wrong, setWrong] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(entry.trim()) === challenge.answer) {
      setUnlocked(true);
      return;
    }
    // Re-roll on failure so the answer cannot be found by guessing repeatedly.
    setWrong(true);
    setChallenge(newChallenge());
    setEntry("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border-4 border-slate-950 rounded-3xl shadow-[6px_6px_0_#0f172a] w-full max-w-md max-h-[90vh] overflow-y-auto">

        <div className="flex items-center justify-between border-b-4 border-slate-950 px-4 py-3 bg-amber-300 rounded-t-2xl">
          <h2 className="font-black text-sm flex items-center gap-2 text-slate-900">
            {unlocked ? <ShieldCheck className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            {unlocked ? "Grown-ups" : "Grown-ups only"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 bg-white border-2 border-slate-950 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!unlocked ? (
          <form onSubmit={submit} className="p-5 space-y-4">
            <p className="text-xs font-bold text-slate-600 leading-relaxed">
              This part is for a grown-up. Please solve this to continue.
            </p>

            <div className="text-center py-3 bg-sky-50 border-3 border-slate-900 rounded-2xl">
              <p className="text-3xl font-black text-slate-900">
                {challenge.a} × {challenge.b} = ?
              </p>
            </div>

            <input
              autoFocus
              inputMode="numeric"
              value={entry}
              onChange={(e) => { setEntry(e.target.value); setWrong(false); }}
              placeholder="Type the answer"
              className="w-full border-3 border-slate-900 rounded-xl px-3 py-2.5 font-black text-center text-lg outline-none focus:bg-amber-50"
            />

            {wrong && (
              <p className="text-[11px] font-black text-rose-600 text-center">
                Not quite — here is a new one.
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-amber-400 hover:bg-amber-300 border-3 border-slate-950 rounded-xl py-2.5 font-black text-sm shadow-[3px_3px_0_#0f172a] active:translate-y-0.5 active:shadow-none"
            >
              Unlock
            </button>
          </form>
        ) : (
          <div className="p-5 space-y-4 text-slate-700">
            <section className="space-y-1.5">
              <h3 className="font-black text-xs uppercase tracking-wide text-slate-900">Your child's voice</h3>
              <p className="text-[11px] font-bold leading-relaxed">
                When your child taps the microphone, a short clip of what they say is sent to
                Google's Gemini service to be turned into text, so the game can understand
                their idea. We do not store the recording, and it is not saved to any database
                or account. Google processes it under their API terms.
              </p>
              <p className="text-[11px] font-bold leading-relaxed">
                The microphone only opens when your child taps it, or right after the companion
                asks a question while hands-free mode is on. You can turn hands-free off with
                the "Auto" button at any time.
              </p>
            </section>

            <section className="space-y-1.5">
              <h3 className="font-black text-xs uppercase tracking-wide text-slate-900">What we keep</h3>
              <p className="text-[11px] font-bold leading-relaxed">
                Nothing leaves this device except the voice clip and the words of the idea
                itself. There is no account and no sign-up. Your child's name and coins are
                stored only in this browser, and clearing your browser data removes them.
              </p>
            </section>

            <section className="space-y-1.5">
              <h3 className="font-black text-xs uppercase tracking-wide text-slate-900">What your child is practising</h3>
              <p className="text-[11px] font-bold leading-relaxed">
                Every trouble is solved by their own idea. The companion is built never to hand
                over the answer, and never to let them get stuck — if they run out of steam it
                offers a suggestion and moves the story on. Afterwards Shark Sana comments on
                their creativity, their thinking about who would pay, and whether the numbers
                roughly add up.
              </p>
            </section>

            <button
              onClick={() => {
                localStorage.removeItem("jugadjr_coins");
                localStorage.removeItem("cartoon_kid_name");
                window.location.reload();
              }}
              className="w-full bg-rose-100 hover:bg-rose-200 border-3 border-rose-500 text-rose-800 rounded-xl py-2 font-black text-[11px]"
            >
              Erase my child's name and coins from this device
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
