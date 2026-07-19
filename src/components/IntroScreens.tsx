import React, { useState } from 'react';
import { DogActor, KidActor, TeddyActor } from './SceneActors';

/**
 * First-run intro.
 *
 * A judge or a parent opening this cold saw a cartoon park and a microphone, with
 * no statement of what the app is FOR. These three cards say it before anything
 * else happens: you find a trouble, your own idea gets built, then you pitch it.
 *
 * Shown once per device. The grown-ups area is not the place for this - it needs
 * to be the first thing anyone sees.
 */

const SLIDES = [
  {
    key: 'trouble',
    art: <DogActor size={150} mood="muddy" />,
    title: "Every big idea starts with a little trouble",
    body: "Muddy paws. A lost teddy. Thirsty birds in the garden. Pick one of ours — or tell us a trouble from your own day.",
    chip: "1 · Find the trouble",
  },
  {
    key: 'idea',
    art: <KidActor size={150} mood="happy" variant={0} />,
    title: "Say what YOU would do",
    body: "Speak your idea out loud and watch it appear in the world. Soap, a doormat, a robot — your idea gets built, not ours.",
    chip: "2 · Invent the fix",
  },
  {
    key: 'shark',
    art: <TeddyActor size={140} mood="happy" />,
    title: "Then pitch it to the shark",
    body: "Shark Sana scores your invention: was it creative, who would pay for it, and do the coins add up? Impress her and she invests.",
    chip: "3 · Pitch it",
  },
];

export const IntroScreens: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [step, setStep] = useState(0);
  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  return (
    <div className="fixed inset-0 z-[100] bg-sky-100 flex flex-col items-center justify-center p-5">
      <div className="w-full max-w-md bg-white border-4 border-slate-950 rounded-3xl shadow-[8px_8px_0_#0f172a] overflow-hidden">

        <div className="bg-amber-300 border-b-4 border-slate-950 px-4 py-2.5 flex items-center justify-between">
          <span className="font-black text-lg text-slate-900">JugadJr</span>
          <span className="text-[10px] font-black uppercase bg-white border-2 border-slate-950 rounded-full px-2 py-0.5">
            {slide.chip}
          </span>
        </div>

        <div className="p-6 text-center space-y-4">
          <div className="flex items-end justify-center h-[150px]">{slide.art}</div>

          <h2 className="text-xl font-black text-slate-900 leading-tight">{slide.title}</h2>
          <p className="text-xs font-bold text-slate-600 leading-relaxed">{slide.body}</p>

          <div className="flex items-center justify-center gap-1.5 pt-1">
            {SLIDES.map((s, i) => (
              <span
                key={s.key}
                className={`h-2 rounded-full border-2 border-slate-900 transition-all ${
                  i === step ? 'w-6 bg-amber-400' : 'w-2 bg-white'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={onDone}
              className="text-[11px] font-black text-slate-400 hover:text-slate-700 px-2 py-2"
            >
              Skip
            </button>
            <button
              onClick={() => (isLast ? onDone() : setStep(step + 1))}
              className="flex-1 bg-amber-400 hover:bg-amber-300 border-3 border-slate-950 rounded-2xl py-3 font-black text-sm shadow-[3px_3px_0_#0f172a] active:translate-y-0.5 active:shadow-none"
            >
              {isLast ? "Let's solve a trouble!" : "Next"}
            </button>
          </div>
        </div>
      </div>

      <p className="text-[10px] font-bold text-slate-500 mt-4 text-center max-w-xs leading-relaxed">
        Built for ages 5–11. Uses the microphone only when you tap it — you can type instead.
      </p>
    </div>
  );
};
