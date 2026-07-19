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
    companion_intro: "Oh no! The puppy has separate cute paws that get super muddy while playing in the park! What should we build on our canvas to clean his feet?",
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
    companion_intro: "Look! The hot summer sun is melting the squirrels' delicious acorn ice cream! What cool cartoon gadget can we create to shield and cool them?",
    initial_elements: [
      { id: "sun-1", type: "scenery", emoji: "☀️", label: "Friendly Sun", animation: "pulse", x: 50, y: 15, size: "large", bubbleText: "Nice day!" },
      { id: "squirrel-1", type: "character", emoji: "🐿️", label: "Happy Squirrel", animation: "none", x: 30, y: 60, size: "medium", bubbleText: "My ice cream!" },
      { id: "cart-1", type: "item", emoji: "🍦", label: "Acorn Ice Cream", animation: "none", x: 45, y: 62, size: "large", bubbleText: "Cold & sweet!" }
    ]
  },
  {
    id: "lost-toys",
    title: "Lost Playground Toys 🔍🧸",
    problem: "Kids keep losing their tiny puzzle pieces, shiny keys, and toy cars in the thick tall grass of the playground!",
    companion_intro: "Yikes! Small toys are slipping into the giant grass jungle! What kind of neat finder tool or robotic seeker can we build on our canvas?",
    initial_elements: [
      { id: "grass-1", type: "scenery", emoji: "🌾", label: "Tall Grass", animation: "wiggle", x: 50, y: 68, size: "large" },
      { id: "toy-1", type: "item", emoji: "🚗", label: "My Toy Car", animation: "none", x: 20, y: 62, size: "medium", bubbleText: "Weeee!" },
      { id: "kid-1", type: "character", emoji: "👧", label: "Happy Kid", animation: "bounce", x: 12, y: 58, size: "medium", bubbleText: "Play time!" }
    ]
  },
  {
    id: "thirsty-birds",
    title: "Hot Thirsty Birds 🦜💧",
    problem: "Beautiful rainbow birds are visiting the garden, but the water fountain is dry and they are very hot and thirsty!",
    companion_intro: "The cute garden birds are flapping around with dry beaks because the water fountain is empty! What amazing cartoon splash pool or bird-cozy oasis should we design?",
    initial_elements: [
      { id: "bird-1", type: "character", emoji: "🦜", label: "Garden Bird", animation: "float", x: 30, y: 35, size: "medium", bubbleText: "Chirp chirp!" },
      { id: "sun-2", type: "scenery", emoji: "☀️", label: "Golden Sun", animation: "pulse", x: 75, y: 15, size: "large" },
      { id: "bowl-empty", type: "item", emoji: "🥣", label: "Water Fountain", animation: "none", x: 55, y: 65, size: "large", bubbleText: "Nice water!" },
      { id: "splash-1", type: "effect", emoji: "💦", label: "Splash", animation: "bounce", x: 55, y: 52, size: "small" }
    ]
  }
];

// Helper to speak text-to-speech for animal companions
const speakText = (text: string, isMuted: boolean, pitch = 1.1, rate = 0.95) => {
  if (isMuted) return;
  if (typeof window === 'undefined' || !window.speechSynthesis) return;

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

  window.speechSynthesis.speak(utterance);
};

export default function App() {
  // Personalized Kid Name
  const [kidName, setKidName] = useState<string>(() => {
    return localStorage.getItem("cartoon_kid_name") || "";
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
  const [questionText, setQuestionText] = useState<string>("What should we build first?");
  
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

  // Speech Recognition
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  // Minimal Text/Story Modal View toggle
  const [showStoryBook, setShowStoryBook] = useState<boolean>(false);
  
  // Language Support
  const [activeLang, setActiveLang] = useState<'english' | 'urdu' | 'german'>('english');

  // Load or Reset a problem scene
  const handleLoadOrGenerateScene = async (customProblem: string, problemId?: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setHistory([]);
    setMessageInput("");
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

      triggerCompanionVoice(intro);
    } catch (err: any) {
      console.error(err);
      // Fallback if network fails
      setElements(initialElements);
      const fallbackIntro = matchedPreset ? matchedPreset.companion_intro : "Oh look! This custom trouble has landed on our canvas. How should we solve this together?";
      const introText = kidName ? `${kidName}! ${fallbackIntro}` : fallbackIntro;
      setSpeechText(introText);
      setCartoonTitle(matchedPreset ? matchedPreset.title : "Magic Challenge");
      setNarrativeSummary(`Today's big trouble: ${customProblem}`);
      setQuestionText("What should we build first?");
      triggerCompanionVoice(introText);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger speech synthesis & speaking animation for current companion
  const triggerCompanionVoice = (text: string) => {
    const config = COMPANIONS.find(c => c.id === companion) || COMPANIONS[0];
    setIsCompanionTalking(true);
    speakText(text, isMuted, config.pitch, config.rate);
    
    // Stop the bounce talk animation after a fitting delay based on text length
    setTimeout(() => {
      setIsCompanionTalking(false);
    }, Math.min(8000, text.length * 65));
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

  // Run Walk Simulator and Get Dirty easily!
  const runTroubleSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);

    if (activeProblemId === "muddy-puppies") {
      // Step-by-step smooth custom walk animation for Muddy Puppies
      // Reset first to clean puppy on the left with full park scenery
      setElements([
        { id: "sun-park", type: "scenery", emoji: "☀️", label: "Golden Sun", animation: "pulse", x: 85, y: 12, size: "large" },
        { id: "tree-park", type: "scenery", emoji: "🌳", label: "Big Oak Tree", animation: "wiggle", x: 18, y: 32, size: "large" },
        { id: "bench-park", type: "scenery", emoji: "🪵", label: "Park Bench", animation: "none", x: 50, y: 58, size: "medium" },
        { id: "butterfly-park", type: "scenery", emoji: "🦋", label: "Fluttering Butterfly", animation: "float", x: 26, y: 22, size: "small" },
        { id: "flower-park-1", type: "scenery", emoji: "🌸", label: "Pink Blossom", animation: "wiggle", x: 22, y: 72, size: "small" },
        { id: "flower-park-2", type: "scenery", emoji: "🌷", label: "Red Tulip", animation: "wiggle", x: 58, y: 74, size: "small" },
        { id: "dog-1", type: "character", emoji: "🐶", label: "Happy Puppy", animation: "none", x: 15, y: 55, size: "large", bubbleText: "Let's walk!" },
        { id: "paw-front", type: "item", emoji: "🐾", label: "Front Paw", animation: "none", x: 12, y: 66, size: "small" },
        { id: "paw-back", type: "item", emoji: "🐾", label: "Back Paw", animation: "none", x: 18, y: 66, size: "small" },
        { id: "mud-1", type: "scenery", emoji: "💩", label: "Wet Mud Patch", animation: "none", x: 42, y: 70, size: "medium" },
        { id: "rug-1", type: "item", emoji: "🏠", label: "Clean House", animation: "pulse", x: 80, y: 58, size: "large", bubbleText: "Keep me clean!" }
      ]);

      let currentX = 15;
      let hasSteppedInMud = false;
      let isVoicingMud = false;
      let stepCounter = 0;
      let tracks: { id: string, type: "effect", emoji: "🐾", label: string, animation: "none", x: number, y: number, size: "small" }[] = [];

      const walkInterval = setInterval(() => {
        currentX += 0.5; // Walk forward smoothly
        stepCounter++;

        // Calculate alternating paw lifting to look like continuous walking!
        const alternate = Math.sin(stepCounter * 0.4);
        const frontY = alternate > 0 ? 63 : 67;
        const backY = alternate > 0 ? 67 : 63;

        // Front paw sits slightly ahead, back paw slightly behind
        const frontX = currentX - 3;
        const backX = currentX + 3;

        if (currentX >= 42 && !hasSteppedInMud) {
          hasSteppedInMud = true;
        }

        if (hasSteppedInMud && !isVoicingMud) {
          isVoicingMud = true;
          triggerCompanionVoice("Oh look! Buddy stepped right in the squishy wet mud! His separate paws are completely muddy!");
        }

        // Drop footprints after stepping in mud
        if (hasSteppedInMud && stepCounter % 12 === 0 && currentX < 80) {
          tracks.push({
            id: `track-${stepCounter}`,
            type: "effect",
            emoji: "🐾",
            label: "Muddy Print",
            animation: "none",
            x: currentX,
            y: 68,
            size: "small"
          });
        }

        if (currentX >= 80) {
          clearInterval(walkInterval);
          setElements(prev => {
            const decorAndStatic = prev.filter(el => 
              !["dog-1", "paw-front", "paw-back", "rug-1"].includes(el.id) && !el.id.startsWith("track-")
            );

            return [
              ...decorAndStatic,
              ...tracks,
              { id: "dog-1", type: "character", emoji: "🐶", label: "Muddy Pup", animation: "bounce", x: 80, y: 53, size: "large", bubbleText: "Uh-oh, dirty floor!" },
              { id: "paw-front", type: "item", emoji: "💩🐾", label: "Muddy Front Paw", animation: "shake", x: 77, y: 64, size: "small", bubbleText: "Super dirty!" },
              { id: "paw-back", type: "item", emoji: "💩🐾", label: "Muddy Back Paw", animation: "shake", x: 83, y: 64, size: "small" },
              { id: "rug-1", type: "item", emoji: "🏠🛖", label: "Dirty Floor!", animation: "pulse", x: 80, y: 58, size: "large", bubbleText: "Oh no, dirty mud!" }
            ];
          });

          const introText = kidName 
            ? `Nooo! ${kidName}, Buddy walked on the clean carpet with mud! Look at his separate paws, they are so muddy! Let's clean his feet first!`
            : "Nooo! Buddy walked on the clean carpet with mud! Look at his separate paws, they are so muddy! Quick, tell me how we should clean his feet up!";
          setSpeechText(introText);
          setQuestionText("What should we use first? Soap? Bubble water?");
          triggerCompanionVoice(introText);
          setIsSimulating(false);
          return;
        }

        // Regular continuous update
        setElements(prev => {
          const decorAndStatic = prev.filter(el => 
            !["dog-1", "paw-front", "paw-back", "rug-1"].includes(el.id) && !el.id.startsWith("track-")
          );
          
          const rug = prev.find(el => el.id === "rug-1") || { id: "rug-1", type: "item" as const, emoji: "🏠", label: "Clean House", animation: "pulse" as const, x: 80, y: 58, size: "large" as const };

          const dogBubble = currentX < 30 ? "Let's walk!" : currentX < 42 ? "Grass is wet!" : "SPLAT! So muddy!";
          const pawEmoji = hasSteppedInMud ? "💩🐾" : "🐾";

          return [
            ...decorAndStatic,
            ...tracks,
            {
              id: "dog-1",
              type: "character",
              emoji: "🐶",
              label: hasSteppedInMud ? "Muddy Pup" : "Happy Puppy",
              animation: "none",
              x: currentX,
              y: 55,
              size: "large",
              bubbleText: dogBubble
            },
            {
              id: "paw-front",
              type: "item",
              emoji: pawEmoji,
              label: hasSteppedInMud ? "Muddy Front Paw" : "Front Paw",
              animation: "none",
              x: frontX,
              y: frontY,
              size: "small",
              bubbleText: hasSteppedInMud ? "Ouch, mud!" : undefined
            },
            {
              id: "paw-back",
              type: "item",
              emoji: pawEmoji,
              label: hasSteppedInMud ? "Muddy Back Paw" : "Back Paw",
              animation: "none",
              x: backX,
              y: backY,
              size: "small"
            },
            rug
          ];
        });

      }, 30);

    } else if (activeProblemId === "sad-squirrels") {
      // Hot Sun simulation
      setElements([
        { id: "sun-1", type: "scenery", emoji: "☀️", label: "Friendly Sun", animation: "pulse", x: 50, y: 15, size: "large", bubbleText: "Nice day!" },
        { id: "squirrel-1", type: "character", emoji: "🐿️", label: "Happy Squirrel", animation: "none", x: 30, y: 60, size: "medium", bubbleText: "My ice cream!" },
        { id: "cart-1", type: "item", emoji: "🍦", label: "Acorn Ice Cream", animation: "none", x: 45, y: 62, size: "large", bubbleText: "Cold & sweet!" }
      ]);

      setTimeout(() => {
        setElements(prev => prev.map(el => el.id === "sun-1" ? { ...el, emoji: "🥵☀️", label: "SUPER HOT SUN!", size: "large", animation: "bounce", bubbleText: "Blazing fire!" } : el));
      }, 1000);

      setTimeout(() => {
        setElements(prev => [
          ...prev.map(el => {
            if (el.id === "squirrel-1") return { ...el, emoji: "😭🐿️", label: "Sweating Squirrel", animation: "shake", bubbleText: "It's melting!" };
            if (el.id === "cart-1") return { ...el, emoji: "🍦💧", label: "Melting Ice Cream", animation: "wiggle", bubbleText: "Drip drop!" };
            return el;
          }),
          { id: "sweat-1", type: "effect", emoji: "💦", label: "Hot sweat", animation: "float", x: 30, y: 50, size: "small" },
          { id: "sweat-2", type: "effect", emoji: "💦", label: "Hot sweat", animation: "float", x: 45, y: 52, size: "small" }
        ]);

        const text = kidName 
          ? `Phew! ${kidName}, the sun got super hot and the squirrels ice cream is melting! What cool cartoon gadget can we add to cool them?`
          : "Phew! The sun got super hot and the squirrels ice cream is melting! What cool cartoon gadget can we add to cool them?";
        setSpeechText(text);
        setQuestionText("Should we add a big umbrella or a snow machine?");
        triggerCompanionVoice(text);
        setIsSimulating(false);
      }, 3000);

    } else if (activeProblemId === "lost-toys") {
      // Lost Playground Toys simulation
      setElements([
        { id: "grass-1", type: "scenery", emoji: "🌾", label: "Tall Grass", animation: "wiggle", x: 50, y: 68, size: "large" },
        { id: "toy-1", type: "item", emoji: "🚗", label: "My Toy Car", animation: "none", x: 20, y: 62, size: "medium", bubbleText: "Weeee!" },
        { id: "kid-1", type: "character", emoji: "👧", label: "Happy Kid", animation: "bounce", x: 12, y: 58, size: "medium", bubbleText: "Play time!" }
      ]);

      setTimeout(() => {
        setElements(prev => prev.map(el => el.id === "toy-1" ? { ...el, x: 45, y: 64, bubbleText: "Whoops! Slipped!" } : el));
      }, 1000);

      setTimeout(() => {
        setElements(prev => [
          ...prev.map(el => {
            if (el.id === "toy-1") return { ...el, x: 50, y: 75, size: "small", bubbleText: "Help, I'm lost!" };
            if (el.id === "kid-1") return { ...el, emoji: "😭👧", label: "Sad Kid", animation: "shake", bubbleText: "Where is it?" };
            return el;
          }),
          { id: "mystery-1", type: "effect", emoji: "❓", label: "Mystery Query", animation: "float", x: 50, y: 55, size: "medium" }
        ]);

        const text = kidName
          ? `Oh no, ${kidName}! The toy car slipped right into the thick tall grass! We can't see it! What should we build to find it?`
          : "Oh no! The toy car slipped right into the thick tall grass! We can't see it! What should we build to find it?";
        setSpeechText(text);
        setQuestionText("A metal finder? A helper robot?");
        triggerCompanionVoice(text);
        setIsSimulating(false);
      }, 3000);

    } else if (activeProblemId === "thirsty-birds") {
      // Thirsty birds empty fountain simulation
      setElements([
        { id: "bird-1", type: "character", emoji: "🦜", label: "Garden Bird", animation: "float", x: 30, y: 35, size: "medium", bubbleText: "Chirp chirp!" },
        { id: "sun-2", type: "scenery", emoji: "☀️", label: "Golden Sun", animation: "pulse", x: 75, y: 15, size: "large" },
        { id: "bowl-empty", type: "item", emoji: "🥣", label: "Water Fountain", animation: "none", x: 55, y: 65, size: "large", bubbleText: "Nice water!" },
        { id: "splash-1", type: "effect", emoji: "💦", label: "Splash", animation: "bounce", x: 55, y: 52, size: "small" }
      ]);

      setTimeout(() => {
        setElements(prev => prev.filter(el => el.id !== "splash-1"));
      }, 1000);

      setTimeout(() => {
        setElements(prev => [
          ...prev.map(el => {
            if (el.id === "bird-1") return { ...el, emoji: "🥺🦜", label: "Thirsty Bird", animation: "shake", bubbleText: "Water please!" };
            if (el.id === "bowl-empty") return { ...el, emoji: "🥣", label: "Bone Dry Basin", bubbleText: "Completely dry!" };
            return el;
          }),
          { id: "sad-flower", type: "scenery", emoji: "🥀", label: "Wilted Flower", animation: "none", x: 80, y: 68, size: "medium" }
        ]);

        const text = kidName
          ? `Oh no, ${kidName}! The water fountain dried out under the hot sun! The parrot has dry feathers. What should we do?`
          : "Oh no! The water fountain dried out under the hot sun! The parrot has dry feathers. What should we do?";
        setSpeechText(text);
        setQuestionText("How can we spray fresh splash water?");
        triggerCompanionVoice(text);
        setIsSimulating(false);
      }, 2500);
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
          current_elements: elements
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

      triggerCompanionVoice(updatedSpeech);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Oh no! The cartoon world got stuck. Say that again, kid boss!");
    } finally {
      setIsLoading(false);
    }
  };

  // Set up microphone voice synthesis
  const toggleSpeechRecognition = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      setErrorMsg("Oops! Your browser doesn't support speaking with mic. Type your idea instead!");
      return;
    }

    const rec = new SpeechRecognitionClass();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = activeLang === 'urdu' ? 'ur-PK' : activeLang === 'german' ? 'de-DE' : 'en-US';

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
                Hey Kid Boss! 🎨✨
              </h3>
              <p className="text-xs text-slate-500 font-bold leading-relaxed">
                Welcome to Cartoon Solver! Tell me your name, and we'll start drawing magical visual solutions to help cartoon characters on the screen!
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
                Cartoon Solver
                {kidName && (
                  <span className="text-[10px] bg-indigo-600 text-white font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-slate-900">
                    {kidName}'s Sandbox 🎨
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-500 font-bold">Talk to the AI to build dynamic solutions onto the screen instantly!</p>
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
                  {prob.id === "muddy-puppies" && "🐶 Muddy Paws"}
                  {prob.id === "sad-squirrels" && "🐿️ Melted Acorn"}
                  {prob.id === "lost-toys" && "🌾 Lost Car"}
                  {prob.id === "thirsty-birds" && "🦜 Thirsty Bird"}
                </button>
              );
            })}
          </div>

          {/* Controls: Speaker Mute / Reset / Change Name */}
          <div className="flex items-center gap-2">
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

            <div className="bg-slate-50 border-2 border-slate-900 rounded-xl px-2 py-1 flex items-center gap-1">
              <button 
                onClick={() => { setActiveLang('english'); triggerCompanionVoice("English!"); }}
                className={`px-1.5 py-0.5 rounded text-[9px] font-black ${activeLang === 'english' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
              >
                EN
              </button>
              <button 
                onClick={() => { setActiveLang('urdu'); triggerCompanionVoice("Salam, urdu enabled!"); }}
                className={`px-1.5 py-0.5 rounded text-[9px] font-black ${activeLang === 'urdu' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
              >
                اردو
              </button>
              <button 
                onClick={() => { setActiveLang('german'); triggerCompanionVoice("Hallo!"); }}
                className={`px-1.5 py-0.5 rounded text-[9px] font-black ${activeLang === 'german' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-200'}`}
              >
                DE
              </button>
            </div>

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

      {/* TOPIC EDITOR PANEL */}
      <section className="max-w-6xl w-full mx-auto px-4 mt-5">
        <div className="bg-white border-4 border-slate-900 rounded-3xl p-4 shadow-[5px_5px_0_#1e293b] flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-indigo-600 text-white font-black text-[9px] uppercase px-2 py-0.5 rounded-md border border-slate-950 animate-pulse">
                Current Trouble Topic
              </span>
              <p className="text-[10px] font-black text-slate-400">✏️ Type any problem you want to solve!</p>
            </div>
            <input 
              type="text"
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              placeholder="e.g., 'A dinosaur is hot and needs cold ice water!'"
              className="w-full bg-slate-50 border-2 border-slate-900 rounded-2xl px-4 py-2 text-xs font-black text-slate-800 focus:outline-none focus:ring-4 focus:ring-amber-200 transition-all"
            />
          </div>
          <button
            onClick={() => handleLoadOrGenerateScene(problemText)}
            disabled={isLoading || !problemText.trim()}
            className="w-full md:w-auto bg-amber-400 hover:bg-amber-300 disabled:bg-slate-100 border-3 border-slate-900 rounded-2xl px-6 py-2.5 text-xs font-black shadow-[3px_3px_0_#000] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-1.5 whitespace-nowrap self-end"
          >
            <Sparkles className="w-4 h-4 text-slate-900" /> Draw Custom Trouble!
          </button>
        </div>
      </section>

      {/* Main Sandbox Layout */}
      <main className="max-w-6xl w-full mx-auto px-4 mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch">
        
        {/* CARTOON CANVAS: Left Area (Large Stage) */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-200 border-4 border-slate-900 rounded-3xl overflow-hidden relative shadow-[8px_8px_0_#1e293b] min-h-[380px] md:min-h-[460px]">
          
          {/* Backdrops */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
            <div className="absolute text-5xl opacity-40 top-8 animate-cloud-slow">☁️</div>
            <div className="absolute text-4xl opacity-30 top-16 animate-cloud-fast">☁️</div>
            <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-b from-emerald-400 to-emerald-600 border-t-3 border-slate-900/30" />
            <div className="absolute bottom-12 left-10 text-4xl opacity-15">🌳</div>
            <div className="absolute bottom-11 right-12 text-4xl opacity-20">🌳</div>
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
              onClick={runTroubleSimulation}
              disabled={isSimulating}
              className="bg-rose-500 hover:bg-rose-400 text-white font-black text-xs px-4 py-2.5 rounded-2xl border-3 border-slate-950 shadow-[3px_3px_0_#000] active:translate-y-0.5 active:shadow-none disabled:bg-slate-300 disabled:shadow-none flex items-center gap-2 animate-bounce hover:animate-none"
            >
              <Play className="w-4 h-4 fill-white" />
              {activeProblemId === "muddy-puppies" && "🏃‍♂️ Walk the Dog & Get Muddy!"}
              {activeProblemId === "sad-squirrels" && "☀️ Turn on Blazing Sun!"}
              {activeProblemId === "lost-toys" && "🌿 Drop Toy in Grass!"}
              {activeProblemId === "thirsty-birds" && "☀️ Drain Water Basin!"}
              {!["muddy-puppies", "sad-squirrels", "lost-toys", "thirsty-birds"].includes(activeProblemId) && "🎭 Start Problem Simulation!"}
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
                const sizeClass = el.size === 'small' ? 'text-4xl' : el.size === 'large' ? 'text-7xl animate-pulse' : 'text-5xl';
                
                let animClass = '';
                if (el.animation === 'bounce') animClass = 'animate-cartoon-bounce';
                else if (el.animation === 'spin') animClass = 'animate-cartoon-spin';
                else if (el.animation === 'float') animClass = 'animate-cartoon-float';
                else if (el.animation === 'shake') animClass = 'animate-cartoon-shake';
                else if (el.animation === 'wiggle') animClass = 'animate-cartoon-wiggle';
                else if (el.animation === 'pulse') animClass = 'animate-cartoon-pulse';

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

                    {/* Emoji */}
                    <div className={`${sizeClass} ${animClass} filter drop-shadow-md hover:scale-125 active:scale-135 transition-transform duration-150`}>
                      {el.emoji}
                    </div>

                    {/* Label */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-slate-900/80 text-white text-[9px] font-black uppercase tracking-wider py-0.5 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap">
                      {el.label} (Tap!)
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Clean Overlay Banner */}
          <div className="bg-indigo-950 border-t-4 border-slate-900 px-4 py-3 z-10 flex gap-2.5 items-center justify-between">
            <div className="flex gap-2 items-center">
              <span className="bg-amber-400 text-slate-900 font-black text-[9px] uppercase px-1.5 py-0.5 rounded">
                Today's Trouble
              </span>
              <p className="text-xs text-white font-extrabold leading-tight">
                "{problemText}"
              </p>
            </div>
            <p className="text-[10px] text-amber-300 font-black uppercase tracking-wider hidden sm:block">
              👉 Click on characters on the canvas to wiggle them!
            </p>
          </div>

        </div>

        {/* COMPANION & RUNTIME INTERACTION: Right Area */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-5">
          
          {/* Companion Card */}
          <div className="bg-white border-4 border-slate-900 rounded-3xl p-5 shadow-[6px_6px_0_#1e293b] flex flex-col justify-between flex-1 space-y-4">
            
            {/* Guide Switcher */}
            <div className="flex justify-between items-center border-b-2 border-dashed border-slate-100 pb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                My Cartoon Companion
              </span>
              <div className="flex gap-1.5">
                {COMPANIONS.map((c) => {
                  const isSelected = companion === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleSwitchCompanion(c.id)}
                      title={`Switch to ${c.name}`}
                      className={`w-7 h-7 rounded-xl text-xs flex items-center justify-center border-2 transition-all ${
                        isSelected 
                          ? 'bg-amber-400 border-slate-900 scale-110 shadow-[1px_1px_0_#000]' 
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {c.emoji}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Talk Area */}
            <div className="flex-1 flex flex-col items-center justify-center py-2 space-y-3">
              
              <div className="shrink-0">
                <CompanionAvatar id={companion} size={100} isTalking={isCompanionTalking} />
              </div>

              {/* Speech bubble */}
              <div className="w-full relative bg-amber-50 border-3 border-slate-900 rounded-2xl p-4 shadow-[3px_3px_0_#1e293b]">
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-slate-900" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mt-1 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-amber-50" />
                
                <p className="text-xs sm:text-sm font-black text-amber-950 text-center leading-relaxed italic">
                  "{speechText}"
                </p>
                
                {/* Challenge prompt */}
                <div className="mt-2.5 pt-2 border-t border-amber-900/10 text-center">
                  <p className="text-[9px] uppercase font-black text-amber-700 tracking-wider">
                    Next Challenge:
                  </p>
                  <p className="text-xs font-black text-indigo-700">
                    {questionText}
                  </p>
                </div>
              </div>

            </div>

            <div className="flex justify-center">
              <button 
                onClick={() => triggerCompanionVoice(speechText)}
                className="flex items-center gap-1.5 text-[9px] font-black text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-300 py-1 px-3 rounded-full transition"
              >
                <Volume2 className="w-3 h-3" /> Say it again!
              </button>
            </div>

          </div>

          {/* RUNTIME TALK CONTROLLER */}
          <div className="bg-white border-4 border-slate-900 rounded-3xl p-4 shadow-[6px_6px_0_#1e293b] space-y-3">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
              🎙️ Speak or type below to build anything!
            </h4>

            {errorMsg && (
              <p className="text-[10px] text-rose-600 font-extrabold bg-rose-50 p-2 rounded-xl border border-rose-200 text-center">
                {errorMsg}
              </p>
            )}

            <div className="flex gap-2">
              {/* Animated Microphone button */}
              <button
                onClick={toggleSpeechRecognition}
                title="Speak your solution"
                className={`w-12 h-12 rounded-2xl border-3 flex items-center justify-center transition-all shadow-[2.5px_2.5px_0_#1e293b] active:translate-y-0.5 active:shadow-none ${
                  isRecording 
                    ? 'bg-rose-500 text-white border-slate-950 animate-pulse scale-105' 
                    : 'bg-indigo-50 text-indigo-700 border-slate-950 hover:bg-indigo-100'
                }`}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 animate-pulse text-indigo-600" />}
              </button>

              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                disabled={isLoading}
                placeholder="e.g., 'let's clean them!', 'use a bubble sponge!'"
                className="flex-1 px-3 py-1.5 rounded-2xl border-3 border-slate-900 bg-slate-50 text-xs font-black focus:outline-none focus:ring-3 focus:ring-sky-200"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!messageInput.trim() || isLoading}
                className="w-12 h-12 bg-amber-400 hover:bg-amber-300 border-3 border-slate-900 rounded-2xl flex items-center justify-center text-slate-900 shadow-[2.5px_2.5px_0_#1e293b] active:translate-y-0.5 active:shadow-none disabled:bg-slate-100 disabled:border-slate-300 disabled:text-slate-400 disabled:shadow-none transition-all"
              >
                <Send className="w-4 h-4 stroke-[3px]" />
              </button>
            </div>

            {isRecording && (
              <div className="flex items-center justify-center gap-1 py-1">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <p className="text-[10px] text-red-600 font-black ml-1.5">
                  Listening... Tell me what we should build or clean!
                </p>
              </div>
            )}
          </div>

          {/* MINIMAL STORY BOOK LOG */}
          <div className="bg-amber-50/60 border-3 border-slate-900 rounded-2xl shadow-[4px_4px_0_#1e293b] overflow-hidden">
            <button
              onClick={() => setShowStoryBook(!showStoryBook)}
              className="w-full py-2 px-3 bg-amber-100 hover:bg-amber-200 border-b-2 border-slate-900 text-[11px] font-black text-amber-950 flex justify-between items-center transition"
            >
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-800" />
                📖 Show Story Words & Log
              </span>
              <span className="text-[9px] bg-amber-200 px-2 py-0.5 rounded border border-amber-300">
                {showStoryBook ? "Hide" : "Show"}
              </span>
            </button>

            {showStoryBook && (
              <div className="p-3 space-y-2.5 max-h-[200px] overflow-y-auto bg-amber-50/40 text-xs">
                <div className="p-2.5 bg-white border border-amber-900/15 rounded-xl space-y-1">
                  <p className="text-[9px] uppercase font-black text-amber-600 tracking-wider">
                    Our Story Book So Far:
                  </p>
                  <p className="font-bold text-amber-950 leading-relaxed italic">
                    {narrativeSummary}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider">
                    Creative Ideas Track:
                  </p>
                  <div className="space-y-1.5 text-[10px] font-semibold">
                    {history.map((h, i) => (
                      <div 
                        key={i} 
                        className={`p-1.5 rounded-lg border ${
                          h.role === 'user' 
                            ? 'bg-sky-50 border-sky-100 text-sky-900' 
                            : 'bg-amber-50 border-amber-100 text-amber-900'
                        }`}
                      >
                        <span className="font-black text-[8px] block uppercase opacity-65">
                          {h.role === 'user' ? '👧 Kid Boss' : '🐕 Companion'}
                        </span>
                        {h.message}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </main>

    </div>
  );
}
