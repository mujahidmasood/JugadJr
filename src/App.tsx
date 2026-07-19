import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  BookOpen, 
  Send,
  Sparkle,
  Trash2,
  Smile,
  Zap,
  Play
} from 'lucide-react';
import { CartoonElement, ChatHistoryItem, CuratedProblem } from './types';
import { COMPANIONS, CompanionAvatar, CompanionType } from './components/CompanionAvatars';

// Curated troubles with initial setup
const CURATED_PROBLEMS: CuratedProblem[] = [
  {
    id: "muddy-puppies",
    title: "Muddy Puppies 🐶",
    problem: "When dogs run in the wet park grass, their paws get super muddy and they ruin clean carpets!",
    companion_intro: "Oh no! The puppy got his paws all muddy playing in the park! What do you think we should do?",
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

// MediaRecorder hands us webm/opus, which Gemini does not accept. Decode it in the
// browser and re-encode as 16kHz mono WAV, which Gemini does accept and which is
// small enough to post as base64.
const RECORD_SAMPLE_RATE = 16000;

const toMono16k = (buffer: AudioBuffer): Int16Array => {
  const ratio = buffer.sampleRate / RECORD_SAMPLE_RATE;
  const outLength = Math.floor(buffer.length / ratio);
  const mono = new Float32Array(outLength);
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, c) => buffer.getChannelData(c));

  let peak = 0;
  for (let i = 0; i < outLength; i++) {
    // Average every source sample that maps into this output sample, across all
    // channels - cheap anti-aliasing that keeps small voices intelligible.
    const start = Math.floor(i * ratio);
    const end = Math.min(buffer.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    let count = 0;
    for (let j = start; j < end; j++) {
      for (const ch of channels) {
        sum += ch[j];
        count++;
      }
    }
    const sample = count ? sum / count : 0;
    mono[i] = sample;
    const mag = Math.abs(sample);
    if (mag > peak) peak = mag;
  }

  // Quiet, far-from-the-mic speech transcribes noticeably worse than loud speech, and
  // shy children are exactly who this has to work for. Lift the clip so its peak sits
  // near full scale.
  //
  // Only do this when the peak is high enough to be actual speech. Amplifying a clip
  // that holds nothing but room hiss would push it past the server's silence gate and
  // straight into the model, which answers silence by inventing a sentence.
  const gain = peak > 0.02 ? Math.min(8, 0.9 / peak) : 1;

  const out = new Int16Array(outLength);
  for (let i = 0; i < outLength; i++) {
    out[i] = Math.max(-1, Math.min(1, mono[i] * gain)) * 0x7fff;
  }
  return out;
};

const encodeWav = (pcm: Int16Array): Blob => {
  const buffer = new ArrayBuffer(44 + pcm.length * 2);
  const view = new DataView(buffer);
  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + pcm.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);          // PCM chunk size
  view.setUint16(20, 1, true);           // format = PCM
  view.setUint16(22, 1, true);           // mono
  view.setUint32(24, RECORD_SAMPLE_RATE, true);
  view.setUint32(28, RECORD_SAMPLE_RATE * 2, true); // byte rate
  view.setUint16(32, 2, true);           // block align
  view.setUint16(34, 16, true);          // bits per sample
  writeStr(36, "data");
  view.setUint32(40, pcm.length * 2, true);

  for (let i = 0; i < pcm.length; i++) view.setInt16(44 + i * 2, pcm[i], true);
  return new Blob([buffer], { type: "audio/wav" });
};

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

// Helper to speak text-to-speech for animal companions
const speakText = (text: string, isMuted: boolean, pitch = 1.1, rate = 0.95, onEnd?: () => void) => {
  if (isMuted) { onEnd?.(); return; }
  if (typeof window === 'undefined' || !window.speechSynthesis) { onEnd?.(); return; }

  window.speechSynthesis.cancel(); // Stop any current speech immediately

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = pitch;
  utterance.rate = rate;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||
                           voices.find(v => v.lang.startsWith('en')) ||
                           voices[0];
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
  }

  if (onEnd) utterance.onend = () => onEnd();
  window.speechSynthesis.speak(utterance);
};

export default function App() {
  // Personalized Kid Name
  const [kidName, setKidName] = useState<string>(() => {
    return localStorage.getItem("cartoon_kid_name") || "Abu";
  });
  const [tempName, setTempName] = useState<string>("");

  // Trouble Problem State
  const [problemText, setProblemText] = useState<string>(CURATED_PROBLEMS[0].problem);
  const [activeProblemId, setActiveProblemId] = useState<string>("muddy-puppies");
  
  // Canvas Elements
  const [elements, setElements] = useState<CartoonElement[]>(CURATED_PROBLEMS[0].initial_elements);
  
  // Companion Talk
  const [speechText, setSpeechText] = useState<string>("");
  const [cartoonTitle, setCartoonTitle] = useState<string>(CURATED_PROBLEMS[0].title);
  const [narrativeSummary, setNarrativeSummary] = useState<string>(`Today's big trouble: ${CURATED_PROBLEMS[0].problem}`);
  const [questionText, setQuestionText] = useState<string>("What is your idea?");
  
  // Input fields
  const [messageInput, setMessageInput] = useState<string>("");
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Companion State
  const [companion, setCompanion] = useState<CompanionType>('buddy');
  const [isCompanionTalking, setIsCompanionTalking] = useState<boolean>(false);
  
  // Sound
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Simulation Running State
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Journey phase: solve the trouble first, then grow it into helping others
  const [phase, setPhase] = useState<'solve' | 'grow'>('solve');

  // Coins: the kid's business wallet
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem("jugadjr_coins");
    return saved ? parseInt(saved, 10) : 20;
  });
  const [coinFlash, setCoinFlash] = useState<'earn' | 'spend' | null>(null);

  // Hands-free: auto-listen after the companion asks a question
  const [handsFree, setHandsFree] = useState<boolean>(true);

  // Shark Sana review
  const [sharkOpen, setSharkOpen] = useState<boolean>(false);
  const [sharkLoading, setSharkLoading] = useState<boolean>(false);
  const [sharkData, setSharkData] = useState<{
    speech: string; creativity: number; business_brain: number;
    math_sense: number; invested: boolean; tip: string;
  } | null>(null);

  const applyCoins = (earned: number, spent: number) => {
    const delta = (earned || 0) - (spent || 0);
    if (delta === 0) return;
    setCoins(prev => {
      const next = Math.max(0, prev + delta);
      localStorage.setItem("jugadjr_coins", String(next));
      return next;
    });
    setCoinFlash(delta > 0 ? 'earn' : 'spend');
    setTimeout(() => setCoinFlash(null), 1200);
  };

  // Speech Recognition
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Gemini hears young voices and non-US accents far better than the browser's own
  // recogniser, so we use it when the server has a key and keep Web Speech as the
  // fallback for every other case (no key, mic decode failure, transcription error).
  const [geminiVoice, setGeminiVoice] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const micStreamRef = useRef<MediaStream | null>(null);
  const recordTimersRef = useRef<number[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/capabilities")
      .then(r => r.ok ? r.json() : { geminiVoice: false })
      .then(data => {
        if (cancelled) return;
        // Only worth using if the browser can actually record and decode audio too.
        const canRecord = typeof MediaRecorder !== "undefined"
          && Boolean(navigator.mediaDevices?.getUserMedia)
          && typeof (window.AudioContext || (window as any).webkitAudioContext) !== "undefined";
        setGeminiVoice(Boolean(data?.geminiVoice) && canRecord);
      })
      .catch(() => { if (!cancelled) setGeminiVoice(false); });
    return () => { cancelled = true; };
  }, []);

  // Story log auto-scroll
  const historyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  // Minimal Text/Story Modal View toggle
  const [showStoryBook, setShowStoryBook] = useState<boolean>(false);

  // Hot, dusty scene (thirsty park) vs cool green park
  const isHotScene = activeProblemId === "thirsty-park";

  // Load or Reset a problem scene
  const handleLoadOrGenerateScene = async (customProblem: string, problemId?: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setHistory([]);
    setMessageInput("");
    setPhase('solve');
    setProblemText(customProblem);
    if (problemId) {
      setActiveProblemId(problemId);
    }
    
    // Find preset if available to serve as high-quality initial layout
    const matchedPreset = CURATED_PROBLEMS.find(p => p.id === problemId || customProblem.toLowerCase().includes(p.problem.toLowerCase()));
    const initialElements = matchedPreset ? matchedPreset.initial_elements : [
      { id: "custom-char", type: "character", emoji: "🥺", label: "Sad Friend", animation: "shake", x: 30, y: 60, size: "large", bubbleText: "Help!" },
      { id: "custom-trouble", type: "scenery", emoji: "🌪️", label: "The Trouble", animation: "spin", x: 70, y: 55, size: "large" }
    ];

    try {
      const response = await fetch("/api/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem: customProblem,
          message: "[INITIAL_SETUP]",
          history: [],
          current_elements: initialElements
        })
      });

      if (!response.ok) {
        throw new Error("Failed to initialize game scene.");
      }

      const data = await response.json();
      setElements(data.elements || initialElements);
      
      // Personalize speech text with kid's name if set
      let intro = data.speech;
      if (kidName) {
        intro = `${kidName}! ${intro}`;
      }
      setSpeechText(intro);
      setCartoonTitle(data.cartoon_title || (matchedPreset ? matchedPreset.title : "Magic Challenge"));
      setNarrativeSummary(data.narrative_summary);
      setQuestionText(data.question);
      setHistory([{ role: 'model', message: intro }]);

      // Intro finishes, then the trouble plays out by itself - no extra tap needed
      triggerCompanionVoice(intro, matchedPreset ? () => runTroubleSimulation(matchedPreset.id) : autoListenAfterQuestion);
    } catch (err: any) {
      console.error(err);
      // Fallback if network fails
      setElements(initialElements);
      const fallbackIntro = matchedPreset ? matchedPreset.companion_intro : "Oh look! This custom trouble has landed on our canvas. How should we solve this together?";
      const introText = kidName ? `${kidName}! ${fallbackIntro}` : fallbackIntro;
      setSpeechText(introText);
      setCartoonTitle(matchedPreset ? matchedPreset.title : "Magic Challenge");
      setNarrativeSummary(`Today's big trouble: ${customProblem}`);
      setQuestionText("What is your idea?");
      triggerCompanionVoice(introText, matchedPreset ? () => runTroubleSimulation(matchedPreset.id) : autoListenAfterQuestion);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger speech synthesis & speaking animation for current companion
  const triggerCompanionVoice = (text: string, onDone?: () => void) => {
    const config = COMPANIONS.find(c => c.id === companion) || COMPANIONS[0];
    setIsCompanionTalking(true);
    speakText(text, isMuted, config.pitch, config.rate, onDone);

    // Stop the bounce talk animation after a fitting delay based on text length
    setTimeout(() => {
      setIsCompanionTalking(false);
    }, Math.min(8000, text.length * 65));
  };

  // Companion finished asking a question: open the mic automatically (hands-free flow)
  const autoListenAfterQuestion = () => {
    if (!handsFree || isMuted || sharkOpen) return;
    setTimeout(() => startListening(true), 250);
  };

  // Switch companion and voice greet
  const handleSwitchCompanion = (newCompId: CompanionType) => {
    setCompanion(newCompId);
    const comp = COMPANIONS.find(c => c.id === newCompId) || COMPANIONS[0];
    
    let greet = "";
    if (newCompId === 'buddy') greet = `Woof! Buddy here! Let's cartoon together ${kidName ? kidName : 'kid boss'}!`;
    if (newCompId === 'luna') greet = `Hoot-hoot! I'm Luna. What creative ideas do you have, ${kidName ? kidName : 'my friend'}?`;
    if (newCompId === 'whiskers') greet = `Squeak! Whiskers is ready! What should we draw next?`;
    if (newCompId === 'cleo') greet = `Meow! Cleo at your service. Let's make some magic!`;

    setIsCompanionTalking(true);
    speakText(greet, isMuted, comp.pitch, comp.rate);
    setTimeout(() => {
      setIsCompanionTalking(false);
    }, 4000);
  };

  // Run the trouble simulation; plays automatically when a scene loads
  const runTroubleSimulation = (forcedId?: string) => {
    if (isSimulating) return;
    setIsSimulating(true);
    const probId = forcedId || activeProblemId;

    if (probId === "muddy-puppies") {
      // Full walk: dog trots across the park, hits mud, tracks it to the house
      const preset = CURATED_PROBLEMS.find(p => p.id === "muddy-puppies")!;
      setElements(preset.initial_elements.map(el =>
        el.id === "dog-1" ? { ...el, animation: "walk", bubbleText: "Let's walk!" } : el
      ));

      let currentX = 15;
      let hasSteppedInMud = false;
      let isVoicingMud = false;
      let stepCounter = 0;
      let tracks: { id: string, type: "effect", emoji: string, label: string, animation: "none", x: number, y: number, size: "small" }[] = [];

      const walkInterval = setInterval(() => {
        currentX += 0.5;
        stepCounter++;

        if (currentX >= 42 && !hasSteppedInMud) {
          hasSteppedInMud = true;
          tracks.push({ id: "splash-mud", type: "effect", emoji: "💦", label: "Splash", animation: "none", x: 42, y: 64, size: "small" });
        }

        if (hasSteppedInMud && !isVoicingMud) {
          isVoicingMud = true;
          triggerCompanionVoice("Oh look! Buddy stepped right in the squishy wet mud! His paws are completely muddy now!");
        }

        // Muddy paw prints trail behind, staggered like real steps
        if (hasSteppedInMud && stepCounter % 12 === 0 && currentX < 66) {
          tracks.push({
            id: `track-${stepCounter}`,
            type: "effect",
            emoji: "🐾",
            label: "Muddy Print",
            animation: "none",
            x: currentX - 4,
            y: tracks.length % 2 === 0 ? 66 : 69,
            size: "small"
          });
        }

        if (currentX >= 66) {
          clearInterval(walkInterval);
          setElements(prev => {
            const scenery = prev.filter(el =>
              !["dog-1", "rug-1"].includes(el.id) && !el.id.startsWith("track-") && el.id !== "splash-mud"
            );
            return [
              ...scenery,
              ...tracks,
              { id: "dog-1", type: "character", emoji: "🐕", label: "Muddy Pup", animation: "bounce", x: 64, y: 56, size: "large", bubbleText: "Uh-oh, so muddy!" },
              { id: "splat-1", type: "effect", emoji: "", label: "Mud Splat", animation: "none", x: 72, y: 70, size: "small" },
              { id: "splat-2", type: "effect", emoji: "", label: "Mud Splat", animation: "none", x: 79, y: 73, size: "small" },
              { id: "rug-1", type: "item", emoji: "🏠", label: "Dirty Floor!", animation: "shake", x: 86, y: 56, size: "large", bubbleText: "My clean carpet!" }
            ];
          });

          const introText = kidName
            ? `Nooo! ${kidName}, Buddy tracked mud all over the clean carpet! His paws are so muddy! What is your idea?`
            : "Nooo! Buddy tracked mud all over the clean carpet! His paws are so muddy! What is your idea?";
          setSpeechText(introText);
          setQuestionText("His paws are SO muddy... what is YOUR idea to fix this?");
          triggerCompanionVoice(introText, autoListenAfterQuestion);
          setIsSimulating(false);
          return;
        }

        setElements(prev => {
          const scenery = prev.filter(el =>
            !["dog-1", "rug-1"].includes(el.id) && !el.id.startsWith("track-") && el.id !== "splash-mud"
          );
          const rug = prev.find(el => el.id === "rug-1") || { id: "rug-1", type: "item" as const, emoji: "🏠", label: "Clean House", animation: "pulse" as const, x: 80, y: 58, size: "large" as const };
          const dogBubble = currentX < 30 ? "Let's walk!" : currentX < 42 ? "Grass is wet!" : "SPLAT! So muddy!";

          return [
            ...scenery,
            ...tracks,
            {
              id: "dog-1",
              type: "character",
              emoji: "🐕",
              label: hasSteppedInMud ? "Muddy Pup" : "Happy Puppy",
              animation: "walk",
              x: currentX,
              y: 57,
              size: "large",
              bubbleText: dogBubble
            },
            rug
          ];
        });

      }, 30);

    } else if (probId === "thirsty-park") {
      // Hot park day: everyone gets thirsty, no drinks anywhere
      const preset = CURATED_PROBLEMS.find(p => p.id === "thirsty-park")!;
      setElements(preset.initial_elements);

      setTimeout(() => {
        setElements(prev => prev.map(el =>
          el.id === "sun-hot" ? { ...el, emoji: "🥵☀️", label: "SUPER HOT SUN!", animation: "bounce", bubbleText: "Blazing!" } : el
        ));
      }, 1000);

      setTimeout(() => {
        setElements(prev => [
          ...prev.map(el => {
            if (el.id === "boy-1") return { ...el, emoji: "🥵", label: "Thirsty Kid", animation: "shake", bubbleText: "So thirsty!" };
            if (el.id === "girl-1") return { ...el, emoji: "😓", label: "Tired Friend", animation: "shake", bubbleText: "Need a drink..." };
            return el;
          }),
          { id: "sweat-1", type: "effect", emoji: "💦", label: "Sweat", animation: "float", x: 35, y: 48, size: "small" },
          { id: "sweat-2", type: "effect", emoji: "💦", label: "Sweat", animation: "float", x: 60, y: 50, size: "small" }
        ]);

        const text = kidName
          ? `Phew, ${kidName}! The sun turned the park into an oven! Everyone is thirsty and grumpy, and there is nothing to drink anywhere!`
          : "Phew! The sun turned the park into an oven! Everyone is thirsty and grumpy, and there is nothing to drink anywhere!";
        setSpeechText(text);
        setQuestionText("Everyone is SO thirsty... what is YOUR idea?");
        triggerCompanionVoice(text, autoListenAfterQuestion);
        setIsSimulating(false);
      }, 3000);

    } else {
      // Every other trouble gets a generic "it gets worse, then we ask" beat, so a new
      // curated problem only needs data - no bespoke animation code to ship it.
      const preset = CURATED_PROBLEMS.find(p => p.id === probId);
      if (!preset) {
        setIsSimulating(false);
        return;
      }

      setElements(preset.initial_elements);

      // The elements carrying a speech bubble are the ones telling the story: make
      // them react so the kid can see what is going wrong before being asked.
      setTimeout(() => {
        setElements(prev => prev.map(el =>
          el.bubbleText ? { ...el, animation: "shake" } : el
        ));
      }, 900);

      setTimeout(() => {
        const intro = kidName
          ? `${kidName}! ${preset.companion_intro}`
          : preset.companion_intro;
        setSpeechText(intro);
        setQuestionText("What is YOUR idea to fix this?");
        triggerCompanionVoice(intro, autoListenAfterQuestion);
        setIsSimulating(false);
      }, 2600);
    }
  };

  // Send message to AI and update cartoon scene at runtime
  const handleSendMessage = async (customText?: string) => {
    const queryText = customText || messageInput;
    if (!queryText.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setMessageInput("");

    // Personalize the prompt with kid's name context so Gemini knows who they are!
    const contextAdjustedQuery = kidName 
      ? `(Kid name is ${kidName}) ${queryText}`
      : queryText;

    const newHistory = [...history, { role: 'user', message: queryText } as ChatHistoryItem];
    setHistory(newHistory);

    try {
      const response = await fetch("/api/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem: problemText,
          message: contextAdjustedQuery,
          history: newHistory,
          current_elements: elements,
          phase
        })
      });

      if (!response.ok) {
        throw new Error("AI engine did not respond. Let's try again!");
      }

      const data = await response.json();
      setElements(data.elements || []);

      // Personalize speech response
      let updatedSpeech = data.speech;
      if (kidName && !updatedSpeech.includes(kidName)) {
        updatedSpeech = `${kidName}! ${updatedSpeech}`;
      }
      setSpeechText(updatedSpeech);

      setCartoonTitle(data.cartoon_title || "Magic World");
      setNarrativeSummary(data.narrative_summary);
      setQuestionText(data.question);
      setHistory([...newHistory, { role: 'model', message: updatedSpeech }]);

      applyCoins(data.coins_earned || 0, data.invention_cost || 0);

      // Safety net: if the solve phase drags on, move the journey forward anyway
      const kidTurns = newHistory.filter(h => h.role === 'user').length;

      if (phase === 'solve' && (data.solved || kidTurns >= 8)) {
        // Trouble fixed by the kid's own idea: move into the grow journey
        setPhase('grow');
        triggerCompanionVoice(updatedSpeech, autoListenAfterQuestion);
      } else if (phase === 'grow' && data.phase_done) {
        // Empathy + plan complete: NOW Shark Sana swims in
        triggerCompanionVoice(updatedSpeech, () => runSharkReview([...newHistory, { role: 'model', message: updatedSpeech }]));
      } else {
        triggerCompanionVoice(updatedSpeech, autoListenAfterQuestion);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Oh no! The cartoon world got stuck. Say that again, kid boss!");
    } finally {
      setIsLoading(false);
    }
  };

  // Shark Sana reviews the solved invention and scores the kid's business brain
  const runSharkReview = async (fullHistory: ChatHistoryItem[]) => {
    setSharkOpen(true);
    setSharkLoading(true);
    setSharkData(null);
    try {
      const response = await fetch("/api/shark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: problemText, history: fullHistory, coins })
      });
      const data = await response.json();
      setSharkData(data);
      speakText(data.speech, isMuted, 0.75, 0.92);
      if (data.invested) {
        setTimeout(() => applyCoins(20, 0), 1500);
      }
    } catch (err) {
      console.error(err);
      setSharkOpen(false);
    } finally {
      setSharkLoading(false);
    }
  };

  // Tear down anything the Gemini recording path left running.
  const cleanupRecording = () => {
    recordTimersRef.current.forEach(t => clearTimeout(t));
    recordTimersRef.current = [];
    micStreamRef.current?.getTracks().forEach(track => track.stop());
    micStreamRef.current = null;
    mediaRecorderRef.current = null;
  };

  // Record the kid, transcribe with Gemini, and hand the text to the normal turn
  // flow. Any failure at any step drops through to Web Speech so the kid still
  // gets to speak - the mic must never just die on them.
  const startGeminiRecording = async (auto = false) => {
    const fallback = () => {
      cleanupRecording();
      setIsRecording(false);
      setIsTranscribing(false);
      startWebSpeechRecognition(auto);
    };

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
    } catch (err) {
      console.error("Mic permission/error:", err);
      // A denied mic is not something Web Speech can rescue - it needs the same grant.
      if (!auto) setErrorMsg("I can't hear you! Let me use the microphone, or type your idea instead.");
      setIsRecording(false);
      return;
    }

    micStreamRef.current = stream;
    audioChunksRef.current = [];

    // Set by the loudness monitor below. Silent audio must never reach the model:
    // asked to transcribe silence it will happily invent a plausible child's answer,
    // and the game would then credit the kid with an idea they never had.
    let speechDetected = false;

    let recorder: MediaRecorder;
    try {
      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]
        .find(t => MediaRecorder.isTypeSupported(t));
      recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    } catch (err) {
      console.error("MediaRecorder unavailable:", err);
      return fallback();
    }

    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };

    recorder.onstop = async () => {
      const tracks = micStreamRef.current?.getTracks() || [];
      tracks.forEach(t => t.stop());
      micStreamRef.current = null;
      setIsRecording(false);

      const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
      audioChunksRef.current = [];
      // Too short to contain a real answer - almost certainly a mis-tap.
      if (blob.size < 1200) return;

      // The mic was open but nobody spoke. Prompt them again; never transcribe this.
      if (!speechDetected) {
        setErrorMsg("I didn't hear anything! Tap the mic and tell me your idea.");
        if (auto && handsFree) setTimeout(() => startListening(true), 800);
        return;
      }

      setIsTranscribing(true);
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
        ctx.close();

        const wav = encodeWav(toMono16k(decoded));
        const base64 = await blobToBase64(wav);

        const res = await fetch("/api/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ audio: base64, mimeType: "audio/wav" })
        });
        const data = await res.json().catch(() => ({ ok: false }));

        if (data?.ok && data.text) {
          setIsTranscribing(false);
          setMessageInput(data.text);
          handleSendMessage(data.text);
          return;
        }

        setIsTranscribing(false);
        if (data?.error === "unclear") {
          // Gemini heard nothing usable: ask again rather than silently stalling.
          setErrorMsg("I didn't quite catch that! Say it once more?");
          if (auto && handsFree) setTimeout(() => startListening(true), 600);
          return;
        }
        // Server-side transcription problem - give this turn to Web Speech.
        startWebSpeechRecognition(auto);
      } catch (err) {
        console.error("Transcription pipeline failed:", err);
        setIsTranscribing(false);
        startWebSpeechRecognition(auto);
      }
    };

    try {
      recorder.start();
    } catch (err) {
      console.error("Recorder start failed:", err);
      return fallback();
    }

    setIsRecording(true);
    setErrorMsg(null);

    // Kids do not know to press stop, so close the mic ourselves: as soon as they
    // go quiet after speaking, or at a hard cap if they never stop.
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const monitorCtx = new AudioCtx();
    const source = monitorCtx.createMediaStreamSource(stream);
    const analyser = monitorCtx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    const samples = new Float32Array(analyser.fftSize);

    let quietSince = 0;
    const startedAt = Date.now();

    const stopRecorder = () => {
      monitorCtx.close().catch(() => {});
      recordTimersRef.current.forEach(t => clearTimeout(t));
      recordTimersRef.current = [];
      if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    };

    const monitor = () => {
      if (mediaRecorderRef.current?.state !== "recording") return;

      analyser.getFloatTimeDomainData(samples);
      let sum = 0;
      for (const s of samples) sum += s * s;
      const rms = Math.sqrt(sum / samples.length);

      const now = Date.now();
      if (rms > 0.015) {
        speechDetected = true;
        quietSince = 0;
      } else if (speechDetected) {
        if (!quietSince) quietSince = now;
        // ~1.4s of quiet after real speech means they finished their thought.
        if (now - quietSince > 1400) return stopRecorder();
      } else if (now - startedAt > 6000) {
        // They never said anything at all.
        return stopRecorder();
      }

      if (now - startedAt > 15000) return stopRecorder();
      recordTimersRef.current.push(window.setTimeout(monitor, 120));
    };
    monitor();
  };

  // Route the mic to Gemini when available, otherwise straight to Web Speech.
  const startListening = (auto = false) => {
    if (geminiVoice) {
      startGeminiRecording(auto);
    } else {
      startWebSpeechRecognition(auto);
    }
  };

  // Browser-native fallback recogniser; auto=true means it was opened hands-free after a question
  const startWebSpeechRecognition = (auto = false) => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      if (!auto) setErrorMsg("Oops! Your browser doesn't support speaking with mic. Type your idea instead!");
      return;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }

    const rec = new SpeechRecognitionClass();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setIsRecording(true);
      setErrorMsg(null);
    };

    rec.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      if (resultText) {
        setMessageInput(resultText);
        handleSendMessage(resultText);
      }
    };

    rec.onerror = (e: any) => {
      console.error("Speech Recognition error:", e);
      setIsRecording(false);
    };

    rec.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (err) {
      console.error(err);
      setIsRecording(false);
    }
  };

  // Mic button tap: stop if listening, otherwise start
  const toggleSpeechRecognition = () => {
    if (isTranscribing) return;

    if (isRecording) {
      // Tapping stop should still submit what they already said, so let the
      // recorder's onstop handler run the transcription rather than discarding it.
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
        return;
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setIsRecording(false);
      return;
    }
    startListening(false);
  };

  // Never leave the mic open when the game unmounts.
  useEffect(() => cleanupRecording, []);

  // Tap element on canvas for interactive fun (cycles wiggles & animations)
  const handleTapElement = (elId: string) => {
    setElements(prev => prev.map(el => {
      if (el.id === elId) {
        const animations = ['wiggle', 'bounce', 'spin', 'shake', 'float', 'pulse'];
        const currentIndex = animations.indexOf(el.animation);
        const nextAnim = animations[(currentIndex + 1) % animations.length];
        
        if (el.bubbleText) {
          triggerCompanionVoice(`${el.label} says: "${el.bubbleText}"`);
        }
        
        return { ...el, animation: nextAnim };
      }
      return el;
    }));
  };

  // Save kid's name
  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      localStorage.setItem("cartoon_kid_name", tempName.trim());
      setKidName(tempName.trim());
      
      const welcome = `Woof! Hello ${tempName.trim()}! I'm Buddy. Let's solve some awesome cartoon challenges together!`;
      setSpeechText(welcome);
      triggerCompanionVoice(welcome);
    }
  };

  // Initial load
  useEffect(() => {
    handleLoadOrGenerateScene(CURATED_PROBLEMS[0].problem, "muddy-puppies");
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  return (
    <div id="cartoon-app-root" className="min-h-screen bg-sky-100 text-slate-800 font-sans pb-10 flex flex-col justify-between">
      
      {/* PERSONALIZED WELCOME DIALOG (If kid's name isn't set yet!) */}
      {!kidName && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white border-4 border-slate-950 p-6 md:p-8 rounded-3xl shadow-[8px_8px_0_#1e293b] max-w-md w-full text-center space-y-5 animate-cartoon-bounce">
            
            <div className="flex justify-center">
              <div className="bg-amber-400 p-4 rounded-full border-3 border-slate-950 shadow-[3px_3px_0_#000]">
                <CompanionAvatar id="buddy" size={100} isTalking={true} />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Hey Little Founder! 💡✨
              </h3>
              <p className="text-xs text-slate-500 font-bold leading-relaxed">
                Welcome to JugadJr! Every day brings a real trouble. YOU invent the fix, build it on screen with your voice, earn coins - and impress Shark Sana the investor!
              </p>
            </div>

            <form onSubmit={handleSaveName} className="space-y-3">
              <input
                type="text"
                required
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="What is your name?"
                className="w-full text-center bg-amber-50/50 border-3 border-slate-950 rounded-2xl px-4 py-3 text-sm font-black focus:outline-none focus:ring-4 focus:ring-amber-200 transition-all"
              />
              <button
                type="submit"
                className="w-full bg-amber-400 hover:bg-amber-300 border-3 border-slate-950 rounded-2xl py-3 text-xs font-black shadow-[4px_4px_0_#000] active:translate-y-0.5 active:shadow-none transition-all"
              >
                Let's Go! 🚀
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Playful Chunky Header */}
      <header className="bg-white border-b-4 border-slate-900 sticky top-0 z-50 py-3 px-6 shadow-[0_5px_0_#1e293b]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="bg-amber-400 p-2 rounded-2xl border-3 border-slate-900 shadow-[2px_2px_0_#1e293b]">
              <Sparkles className="w-5 h-5 text-slate-900 fill-yellow-100" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                JugadJr
              </h1>
              <p className="text-xs text-slate-500 font-bold">Spot the trouble. Speak your invention. Earn coins. Impress the shark!</p>
            </div>
          </div>

          {/* Quick Preset Starters */}
          <div className="flex items-center gap-1.5 flex-wrap bg-sky-50 border-2 border-slate-950 p-1.5 rounded-2xl">
            <span className="text-[9px] font-black uppercase text-slate-500 px-1">Select Trouble:</span>
            {CURATED_PROBLEMS.map((prob) => {
              const isSelected = activeProblemId === prob.id;
              return (
                <button
                  key={prob.id}
                  onClick={() => handleLoadOrGenerateScene(prob.problem, prob.id)}
                  className={`px-2.5 py-1 rounded-xl border text-[11px] font-black transition-all ${
                    isSelected 
                      ? 'bg-amber-400 border-slate-950 text-slate-900 shadow-[1px_1px_0_#000]' 
                      : 'bg-white border-slate-300 text-slate-600 hover:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {prob.title}
                </button>
              );
            })}
          </div>

          {/* Controls: Coins / Speaker Mute / Reset / Change Name */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 border-2 border-slate-900 rounded-xl px-2.5 py-1.5 font-black text-xs transition-all shadow-[2px_2px_0_#1e293b] ${
              coinFlash === 'earn' ? 'bg-emerald-300 scale-110' : coinFlash === 'spend' ? 'bg-rose-200 scale-110' : 'bg-amber-300'
            }`}>
              🪙 <span>{coins}</span>
            </div>

            <button
              onClick={() => setHandsFree(!handsFree)}
              title="Hands-free: mic opens by itself after each question"
              className={`text-[9px] font-black uppercase border-2 border-slate-900 rounded-xl px-2 py-1.5 shadow-[2px_2px_0_#1e293b] ${
                handsFree ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-100 text-slate-500'
              }`}
            >
              🎙️ Auto {handsFree ? 'ON' : 'OFF'}
            </button>

            {kidName && (
              <button 
                onClick={() => {
                  localStorage.removeItem("cartoon_kid_name");
                  setKidName("");
                  setTempName("");
                }}
                className="text-[9px] font-black uppercase bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 rounded-xl px-2.5 py-1.5 text-slate-600"
              >
                Change Name ✏️
              </button>
            )}

            <button
              onClick={() => {
                const updated = !isMuted;
                setIsMuted(updated);
                if (updated) {
                  if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
                } else {
                  triggerCompanionVoice("Sound is on!");
                }
              }}
              className={`p-2 rounded-xl border-2 shadow-[2px_2px_0_#1e293b] ${isMuted ? 'bg-rose-100 border-rose-400 text-rose-700' : 'bg-emerald-100 border-emerald-400 text-emerald-800'}`}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>

        </div>
      </header>

      {/* Main Sandbox Layout: one big game screen */}
      <main className="max-w-6xl w-full mx-auto px-4 mt-5 flex-1">

        {/* CARTOON CANVAS */}
        <div
          className="flex flex-col justify-between border-4 border-slate-900 rounded-3xl overflow-hidden relative shadow-[8px_8px_0_#1e293b] min-h-[420px] md:min-h-[520px]"
          style={{
            background: isHotScene
              ? 'linear-gradient(to bottom, #ffd98a 0%, #ffc76b 55%, #f7b45a 100%)'
              : 'linear-gradient(to bottom, #8fd6ff 0%, #b8e6ff 60%, #d8f2ff 100%)'
          }}
        >
          
          {/* Backdrops: rolling ground plane under an open sky */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <div className="absolute text-5xl opacity-40 top-8 animate-cloud-slow">☁️</div>
            <div className="absolute text-4xl opacity-30 top-16 animate-cloud-fast">☁️</div>
            {/* Curved horizon: a huge ellipse peeking up from the bottom */}
            <div
              className="absolute left-[-25%] right-[-25%] bottom-[-30%] h-[80%]"
              style={{
                borderRadius: '50% 50% 0 0 / 28% 28% 0 0',
                background: isHotScene
                  ? 'linear-gradient(to bottom, #d9c07a 0%, #c9ab5f 100%)'
                  : 'linear-gradient(to bottom, #6cc24a 0%, #3f9a2f 100%)'
              }}
            />
          </div>

          {/* Title Banner */}
          <div className="bg-slate-900/85 backdrop-blur-xs text-white border-b-3 border-slate-900 py-2.5 px-4 z-10 flex justify-between items-center">
            <span className="text-[10px] font-black uppercase bg-amber-400 text-slate-900 px-2 py-0.5 rounded-sm border border-slate-950">
              Active Cartoon Sandbox
            </span>
            <h2 className="text-xs sm:text-sm font-black tracking-wide text-amber-300 italic">
              "{cartoonTitle}"
            </h2>
            <button 
              onClick={() => handleLoadOrGenerateScene(problemText)}
              title="Reset Trouble Scene"
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition flex items-center gap-1 text-[10px] font-black"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* PLAY SIMULATOR CONTROLS BAR */}
          <div className="absolute top-16 left-4 z-20">
            <button
              onClick={() => runTroubleSimulation()}
              disabled={isSimulating}
              className="bg-rose-500 hover:bg-rose-400 text-white font-black text-xs px-4 py-2.5 rounded-2xl border-3 border-slate-950 shadow-[3px_3px_0_#000] active:translate-y-0.5 active:shadow-none disabled:bg-slate-300 disabled:shadow-none flex items-center gap-2 animate-bounce hover:animate-none"
            >
              <Play className="w-4 h-4 fill-white" />
              🔁 Replay the trouble!
            </button>
          </div>

          {/* DYNAMIC CANVAS OBJECTS */}
          <div className="flex-1 relative p-4">
            {isLoading && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-30 flex flex-col items-center justify-center text-center p-4">
                <div className="bg-white border-3 border-slate-900 p-6 rounded-2xl shadow-[4px_4px_0_#000] max-w-xs space-y-3">
                  <div className="text-4xl animate-bounce">🎨🪄</div>
                  <h4 className="font-black text-sm text-slate-900">AI is drawing your cartoon...</h4>
                  <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                    Drawing the requested solution onto the canvas instantly!
                  </p>
                </div>
              </div>
            )}

            {elements.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 space-y-2 p-6 text-center">
                <p className="text-4xl animate-bounce">✏️</p>
                <p className="font-black text-xs">Your custom sandbox is empty. Type a problem above to draw characters!</p>
              </div>
            ) : (
              elements.map((el) => {
                const sizeClass = el.size === 'small' ? 'text-4xl' : el.size === 'large' ? 'text-7xl' : 'text-5xl';
                
                let animClass = '';
                if (el.animation === 'bounce') animClass = 'animate-cartoon-bounce';
                else if (el.animation === 'spin') animClass = 'animate-cartoon-spin';
                else if (el.animation === 'float') animClass = 'animate-cartoon-float';
                else if (el.animation === 'shake') animClass = 'animate-cartoon-shake';
                else if (el.animation === 'wiggle') animClass = 'animate-cartoon-wiggle';
                else if (el.animation === 'pulse') animClass = 'animate-cartoon-pulse';
                else if (el.animation === 'walk') animClass = 'animate-cartoon-walk';

                const isMudPatch = el.label.toLowerCase().includes('mud patch') || el.id === 'mud-1';
                const isMudSplat = /splat|smudge/i.test(el.label) || el.id.startsWith('splat-');
                const isStand = /\b(stand|stall|booth|shop|kiosk)\b/i.test(el.label) || /^(stand|stall|shop)/i.test(el.id);
                const standGoods = el.emoji && el.emoji.trim() ? el.emoji.trim() : '🥤';
                // Dog and walker emojis are drawn facing left; flip them to face the way they travel
                const facesLeftByDefault = el.id === 'dog-1' || /🐕|🐩|🚶/.test(el.emoji);

                return (
                  <div
                    key={el.id}
                    onClick={() => handleTapElement(el.id)}
                    className={`absolute z-10 select-none group cursor-pointer ${isSimulating ? 'transition-none' : 'transition-all duration-1000 ease-out'}`}
                    style={{ 
                      left: `${Math.max(8, Math.min(el.x, 85))}%`, 
                      top: `${Math.max(10, Math.min(el.y, 75))}%`,
                      transform: 'translate(-50%, -50%)' 
                    }}
                  >
                    {/* Speech Bubble */}
                    {el.bubbleText && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white border-2 border-slate-900 text-[10px] font-black text-slate-800 py-1 px-2.5 rounded-full shadow-[2px_2px_0_#1e293b] whitespace-nowrap z-20 animate-bounce">
                        {el.bubbleText}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-0.5 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-white" />
                      </div>
                    )}

                    {/* Drawn props get real geometry; everything else stays an emoji actor */}
                    {isMudSplat ? (
                      <div
                        className="rounded-[50%]"
                        style={{
                          width: '30px', height: '13px',
                          background: 'radial-gradient(ellipse at 50% 40%, #8b5e34 0%, #63421f 100%)',
                          opacity: 0.85
                        }}
                      />
                    ) : isMudPatch ? (
                      <div
                        className="rounded-[50%] border-2 border-amber-950/40"
                        style={{
                          width: '110px', height: '38px',
                          background: 'radial-gradient(ellipse at 50% 35%, #8b5e34 0%, #5c3d21 100%)'
                        }}
                      />
                    ) : isStand ? (
                      <div className="relative" style={{ width: '150px' }}>
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-amber-300 border-3 border-slate-900 rounded-xl px-3 py-1 text-[11px] font-black text-amber-950 whitespace-nowrap shadow-[2px_2px_0_#0f172a]">
                          {el.label}
                        </div>
                        <div className="h-4 rounded-t-md border-3 border-slate-900" style={{
                          background: 'repeating-linear-gradient(90deg, #ef4444 0 14px, #ffffff 14px 28px)'
                        }} />
                        <div className="flex justify-between px-1">
                          <div className="w-1.5 h-10 bg-amber-800 border-x-2 border-slate-900" />
                          <div className="w-1.5 h-10 bg-amber-800 border-x-2 border-slate-900" />
                        </div>
                        <div className="h-11 -mt-1 rounded-md border-3 border-slate-900 flex items-center justify-around text-2xl" style={{
                          background: 'linear-gradient(to bottom, #b4763c 0%, #8b5a2b 100%)'
                        }}>
                          <span>{standGoods}</span><span>{standGoods}</span><span>{standGoods}</span>
                        </div>
                      </div>
                    ) : (
                      <div className={`${sizeClass} ${animClass} filter drop-shadow-md hover:scale-125 active:scale-135 transition-transform duration-150`}>
                        {facesLeftByDefault ? (
                          <span style={{ display: 'inline-block', transform: 'scaleX(-1)' }}>{el.emoji}</span>
                        ) : el.emoji}
                      </div>
                    )}

                    {/* Ground shadow: anchors characters and items to the world */}
                    {el.type !== 'scenery' && el.type !== 'effect' && !isMudPatch && (
                      <div
                        className="absolute left-1/2 -translate-x-1/2 rounded-[50%] bg-slate-900/20"
                        style={{
                          bottom: '-6px',
                          width: el.size === 'large' ? '56px' : el.size === 'medium' ? '38px' : '24px',
                          height: el.size === 'large' ? '12px' : '8px',
                          filter: 'blur(2px)'
                        }}
                      />
                    )}

                    {/* Label */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-slate-900/80 text-white text-[9px] font-black uppercase tracking-wider py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap">
                      {el.label} (Tap!)
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* TALK BAR: companion + speech + mic, all inside the game */}
          <div className="bg-indigo-950 border-t-4 border-slate-900 px-4 py-3 z-10 space-y-2">
            <div className="flex items-center gap-3">
              <div className="shrink-0">
                <CompanionAvatar id={companion} size={64} isTalking={isCompanionTalking} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-white font-extrabold leading-snug">
                  "{speechText}"
                </p>
                <p className="text-[11px] text-amber-300 font-black mt-1">
                  👉 {questionText}
                </p>
                {errorMsg && (
                  <p className="text-[10px] text-rose-300 font-bold mt-1">{errorMsg}</p>
                )}
              </div>

              <button
                onClick={() => triggerCompanionVoice(speechText)}
                title="Say it again"
                className="shrink-0 p-2 bg-indigo-900 hover:bg-indigo-800 text-indigo-200 rounded-xl border-2 border-indigo-800 transition"
              >
                <Volume2 className="w-4 h-4" />
              </button>

              <button
                onClick={toggleSpeechRecognition}
                disabled={isTranscribing}
                title={isTranscribing ? "Listening to your idea..." : "Tap and tell me your idea!"}
                className={`shrink-0 w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all shadow-[3px_3px_0_#000] active:translate-y-0.5 active:shadow-none ${
                  isTranscribing
                    ? 'bg-indigo-400 text-white border-indigo-200 animate-pulse'
                    : isRecording
                      ? 'bg-rose-500 text-white border-rose-200 animate-pulse scale-110'
                      : 'bg-amber-400 text-slate-900 border-slate-950 hover:bg-amber-300'
                }`}
              >
                {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              </button>
            </div>

            {isRecording && (
              <div className="flex items-center justify-center gap-1 py-1">
                <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <p className="text-[11px] text-rose-300 font-black ml-1.5">
                  Listening... tell me your idea!
                </p>
              </div>
            )}

            {isTranscribing && (
              <p className="text-[11px] text-indigo-300 font-black text-center py-1">
                🧠 Working out what you said...
              </p>
            )}

            {!isRecording && messageInput && (
              <p className="text-[11px] text-sky-300 font-bold text-center py-1">
                🗣️ You said: "{messageInput}"
              </p>
            )}
          </div>

        </div>

        {/* STORY SO FAR: growing conversation log */}
        {history.length > 0 && (
          <div className="mt-4 bg-white border-4 border-slate-900 rounded-3xl shadow-[5px_5px_0_#1e293b] overflow-hidden">
            <div className="bg-amber-100 border-b-2 border-slate-900 px-4 py-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-800" />
              <span className="text-[11px] font-black text-amber-950 uppercase tracking-wider">Our story so far</span>
              <span className="ml-auto text-[10px] font-black text-amber-700 bg-amber-200 px-2 py-0.5 rounded-full border border-amber-300">
                {history.length} turns
              </span>
            </div>
            <div ref={historyRef} className="max-h-[220px] overflow-y-auto p-3 space-y-2 bg-amber-50/40">
              {history.map((h, i) => (
                <div
                  key={i}
                  className={`flex ${h.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] px-3 py-1.5 rounded-2xl border-2 text-xs font-bold leading-relaxed ${
                    h.role === 'user'
                      ? 'bg-sky-100 border-sky-300 text-sky-900 rounded-br-sm'
                      : 'bg-white border-slate-200 text-slate-700 rounded-bl-sm'
                  }`}>
                    <span className="block text-[9px] uppercase font-black opacity-60 mb-0.5">
                      {h.role === 'user' ? `🗣️ ${kidName || 'You'}` : '🐕 Buddy'}
                    </span>
                    {h.message}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* SHARK SANA INVESTOR REVIEW */}
      {sharkOpen && (
        <div className="fixed inset-0 bg-indigo-950/80 backdrop-blur-md z-[90] flex items-center justify-center p-4">
          <div className="bg-white border-4 border-slate-950 p-6 rounded-3xl shadow-[8px_8px_0_#1e293b] max-w-md w-full text-center space-y-4 animate-cartoon-bounce">
            <div className="text-6xl">🦈</div>
            <h3 className="text-xl font-black text-slate-900">Shark Sana's Verdict</h3>

            {sharkLoading && (
              <p className="text-xs font-bold text-slate-500 animate-pulse py-4">
                Shark Sana is swimming over to review your invention... 🌊
              </p>
            )}

            {sharkData && (
              <>
                <p className="text-xs font-bold text-slate-700 bg-sky-50 border-2 border-slate-900 rounded-2xl p-3 italic leading-relaxed">
                  "{sharkData.speech}"
                </p>

                <div className="space-y-2 text-left">
                  {[
                    { label: '🎨 Creativity', val: sharkData.creativity },
                    { label: '🧠 Business brain', val: sharkData.business_brain },
                    { label: '🔢 Math sense', val: sharkData.math_sense }
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-600 w-28 shrink-0">{row.label}</span>
                      <div className="flex-1 h-3 bg-slate-100 border-2 border-slate-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ${row.val >= 7 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                          style={{ width: `${row.val * 10}%` }}
                        />
                      </div>
                      <span className="text-xs font-black w-6">{row.val}</span>
                    </div>
                  ))}
                </div>

                <div className={`border-3 border-slate-950 rounded-2xl p-3 font-black text-sm ${
                  sharkData.invested ? 'bg-emerald-200 text-emerald-950' : 'bg-amber-100 text-amber-900'
                }`}>
                  {sharkData.invested ? '🎉 INVESTED! +20 coins for you, founder!' : '🤝 Not yet — but come back tomorrow!'}
                </div>

                <p className="text-[10px] font-bold text-slate-500">
                  💡 Shark tip: {sharkData.tip}
                </p>
              </>
            )}

            <button
              onClick={() => setSharkOpen(false)}
              className="w-full bg-amber-400 hover:bg-amber-300 border-3 border-slate-950 rounded-2xl py-2.5 text-xs font-black shadow-[4px_4px_0_#000] active:translate-y-0.5 active:shadow-none transition-all"
            >
              Keep inventing! 🚀
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
