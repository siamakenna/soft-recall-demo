import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import bedroomImg from "@/assets/scene-bedroom.jpg";
import phoneImg from "@/assets/scene-phone.jpg";
import hallwayImg from "@/assets/scene-hallway.jpg";
import kitchenImg from "@/assets/scene-kitchen.jpg";
import bathroomImg from "@/assets/scene-bathroom.jpg";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type SceneId = "bedroom" | "phone" | "hallway" | "kitchen" | "bathroom";
type EndingId = "supported" | "smaller" | "notalone";

interface Hotspot {
  id: string;
  label: string;
  x: number;
  y: number;
  action: () => void;
}

interface Line { speaker: string; text: string; }

interface Choice {
  id: string; label: string; hint?: string; onPick: () => void;
}

interface ConfidencePrompt {
  question: string;
  options: string[];
  bucket: "sure" | "cue";
}

interface MemoryEntry {
  section: "Fragments" | "Messages" | "Self-Monitoring" | "Reflections";
  title: string;
  body: string;
}

interface Settings {
  reducedMotion: boolean;
  grain: number;      // 0..1
  fuzzCap: number;    // 0..1 — caps depth-driven text fuzz
}

interface SaveState {
  version: 1;
  scene: SceneId;
  visited: SceneId[];
  memory: MemoryEntry[];
  depth: number;
  visitedIntros: SceneId[];
  savedAt: number;
}

const SAVE_KEY = "soft-recall.save.v1";
const SETTINGS_KEY = "soft-recall.settings.v1";

const DEFAULT_SETTINGS: Settings = {
  reducedMotion: false,
  grain: 0.55,
  fuzzCap: 1,
};

/* ------------------------------------------------------------------ */
/* Map adjacency — the small apartment                                 */
/* ------------------------------------------------------------------ */

const ROOM_ADJACENCY: Record<Exclude<SceneId, "phone">, Exclude<SceneId, "phone">[]> = {
  bedroom:  ["hallway"],
  hallway:  ["bedroom", "kitchen", "bathroom"],
  kitchen:  ["hallway"],
  bathroom: ["hallway"],
};

/* ------------------------------------------------------------------ */
/* Root component                                                      */
/* ------------------------------------------------------------------ */

export default function SoftRecall() {
  const [started, setStarted] = useState(false);
  const [hasSave, setHasSave] = useState(false);
  const [scene, setScene] = useState<SceneId>("bedroom");
  const [history, setHistory] = useState<SceneId[]>([]);
  const [visited, setVisited] = useState<Set<SceneId>>(new Set(["bedroom"]));
  const [queue, setQueue] = useState<Line[]>([]);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [confidence, setConfidence] = useState<ConfidencePrompt | null>(null);
  const [memory, setMemory] = useState<MemoryEntry[]>([]);
  const [showBook, setShowBook] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [supportGlow, setSupportGlow] = useState(false);
  const [ending, setEnding] = useState<EndingId | null>(null);
  const [focusIdx, setFocusIdx] = useState(0);
  const [depth, setDepth] = useState(0);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const hotspotsRef = useRef<Hotspot[]>([]);
  const firstVisitRef = useRef<Set<SceneId>>(new Set());
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  /* -------- load settings + detect save on mount ------------------ */
  useEffect(() => {
    try {
      const s = localStorage.getItem(SETTINGS_KEY);
      if (s) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(s) });
      const save = localStorage.getItem(SAVE_KEY);
      setHasSave(!!save);
    } catch { /* ignore */ }
  }, []);

  /* -------- persist settings when changed ------------------------- */
  useEffect(() => {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* ignore */ }
  }, [settings]);

  /* -------- autosave on meaningful state changes ------------------ */
  useEffect(() => {
    if (!started || ending) return;
    try {
      const payload: SaveState = {
        version: 1,
        scene,
        visited: Array.from(visited),
        memory,
        depth,
        visitedIntros: Array.from(firstVisitRef.current),
        savedAt: Date.now(),
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
      setHasSave(true);
    } catch { /* ignore */ }
  }, [scene, visited, memory, depth, started, ending]);

  const deepen = useCallback((n = 1) => setDepth((d) => Math.min(d + n, 18)), []);

  const say = useCallback((lines: Line[]) => {
    setQueue((q) => [...q, ...lines]);
    deepen(lines.length);
  }, [deepen]);

  const remember = useCallback((entry: MemoryEntry) => {
    setMemory((m) => {
      // Avoid dupes by title+section
      if (m.some((e) => e.title === entry.title && e.section === entry.section)) return m;
      return [...m, entry];
    });
    deepen();
  }, [deepen]);

  const askConfidence = useCallback((p: ConfidencePrompt) => setConfidence(p), []);

  const goto = useCallback((next: SceneId) => {
    setScene((cur) => {
      if (cur === next) return cur;
      setHistory((h) => [...h, cur]);
      setChoices([]);
      setQueue([]);
      setFocusIdx(0);
      setVisited((v) => {
        if (v.has(next)) return v;
        const n = new Set(v); n.add(next); return n;
      });
      return next;
    });
  }, []);

  /* ------------------ scene entrance narration ---------------------- */
  useEffect(() => {
    if (!started) return;
    if (firstVisitRef.current.has(scene)) return;
    firstVisitRef.current.add(scene);
    const intros: Record<SceneId, Line[]> = {
      bedroom: [
        { speaker: "Morning", text: "The room is familiar before it is clear." },
        { speaker: "Morning", text: "The table remembers where your hands usually go." },
      ],
      phone: [
        { speaker: "Phone", text: "You know what you mean. The sentence is the hard part." },
      ],
      hallway: [
        { speaker: "Hallway", text: "A short corridor. Warm light from the side window." },
      ],
      kitchen: [
        { speaker: "Kitchen", text: "The kettle is where you left it. The mug is only one mug." },
      ],
      bathroom: [
        { speaker: "Bathroom", text: "The mirror is not asking anything. Just showing." },
      ],
    };
    setQueue(intros[scene]);
    setChoices([]);
    setFocusIdx(0);
  }, [scene, started]);

  /* ---------------------- Scene 1 : Bedroom ------------------------- */
  const bedroomHotspots: Hotspot[] = useMemo(() => [
    { id: "glasses", label: "Reading glasses", x: 46, y: 63,
      action: () => {
        say([{ speaker: "Glasses", text: "The world sharpens at the edges first." }]);
        remember({ section: "Fragments", title: "Glasses", body: "The world sharpens at the edges first." });
        askConfidence({ question: "How sure does this feel?", options: ["Sure", "Partly sure", "Unsure"], bucket: "sure" });
      },
    },
    { id: "phone", label: "Phone", x: 55, y: 66,
      action: () => {
        say([{ speaker: "Phone", text: "It is lit from underneath, the way water is lit at night." }]);
        setChoices([
          { id: "open", label: "Pick it up", onPick: () => goto("phone") },
          { id: "leave", label: "Leave it", onPick: () => { setChoices([]); say([{ speaker: "You", text: "Not yet. Something first." }]); } },
        ]);
      },
    },
    { id: "note", label: "Folded note", x: 66, y: 68,
      action: () => {
        say([
          { speaker: "Note", text: "In your own handwriting, small: one thing at a time." },
          { speaker: "Note", text: "Underneath, in a different pen: keys first." },
        ]);
        remember({ section: "Fragments", title: "The note", body: "one thing at a time / keys first" });
      },
    },
    { id: "window", label: "Window", x: 82, y: 30,
      action: () => {
        say([
          { speaker: "Window", text: "A pigeon on the sill, pretending you can't see it." },
          { speaker: "Window", text: "The sky is the color of a page that hasn't been written on yet." },
        ]);
        remember({ section: "Reflections", title: "Window", body: "sky like an unwritten page." });
      },
    },
    { id: "lamp", label: "Bedside lamp", x: 30, y: 55,
      action: () => {
        say([{ speaker: "Lamp", text: "Still on from last night. You must have meant to." }]);
        remember({ section: "Fragments", title: "Lamp", body: "on since last night — meant to?" });
      },
    },
    { id: "door", label: "Toward the hallway", x: 8, y: 40,
      action: () => {
        say([{ speaker: "You", text: "The hallway is that way. The morning is still assembling itself." }]);
        setChoices([
          { id: "go", label: "Step into the hallway", onPick: () => goto("hallway") },
          { id: "stay", label: "Stay a moment longer", onPick: () => setChoices([]) },
        ]);
      },
    },
  ], [say, remember, askConfidence, goto]);

  /* ---------------------- Scene 2 : Phone --------------------------- */
  const phoneHotspots: Hotspot[] = useMemo(() => [
    { id: "chat", label: "Message thread", x: 50, y: 38,
      action: () => {
        say([
          { speaker: "Thread", text: "Three grey bubbles from someone who cares. One draft, half-typed, from you." },
          { speaker: "Draft", text: "hey — sorry, was going to say" },
        ]);
        setChoices([
          { id: "send", label: "Send a simple reply", hint: "\"still here. slow morning.\"",
            onPick: () => {
              say([{ speaker: "You", text: "You send four words. The screen exhales." }]);
              remember({ section: "Messages", title: "Reply sent", body: "still here. slow morning." });
              setChoices([]);
              askConfidence({ question: "Did the cue make the next step smaller?", options: ["Yes", "A little", "Not yet"], bucket: "cue" });
            },
          },
          { id: "draft", label: "Save as draft", hint: "keep the sentence for later",
            onPick: () => {
              say([{ speaker: "You", text: "You put the sentence down like a cup you might come back to." }]);
              remember({ section: "Messages", title: "Draft saved", body: "hey — sorry, was going to say" });
              setChoices([]);
            },
          },
          { id: "one", label: "Ask for one question at a time", hint: "make the shape smaller",
            onPick: () => {
              say([
                { speaker: "You", text: "\"can you ask me one thing at a time today?\"" },
                { speaker: "Reply", text: "\"of course. what do you want first — coffee or a plan?\"" },
              ]);
              remember({ section: "Messages", title: "One at a time", body: "asked for one thing — got two soft ones back." });
              setChoices([]);
              askConfidence({ question: "Did the cue make the next step smaller?", options: ["Yes", "A little", "Not yet"], bucket: "cue" });
            },
          },
          { id: "not", label: "Not now", onPick: () => { say([{ speaker: "You", text: "You turn the screen face down. The paper is quieter than the glass." }]); setChoices([]); } },
        ]);
      },
    },
    { id: "memo", label: "Voice memo", x: 50, y: 60,
      action: () => {
        say([
          { speaker: "Memo", text: "A waveform, unplayed. Underneath, the transcript reads:" },
          { speaker: "Transcript", text: "\"— if you get this, it's fine, take the — take the small one — okay bye —\"" },
        ]);
        remember({ section: "Fragments", title: "Voice memo", body: "take the small one — okay bye" });
      },
    },
    { id: "photo", label: "Yesterday's photo", x: 78, y: 44,
      action: () => {
        say([{ speaker: "Photo", text: "A cup, a hand, a sunlit corner. Proof the day before was real." }]);
        remember({ section: "Reflections", title: "Yesterday's photo", body: "proof the day before was real." });
      },
    },
    { id: "back", label: "Put the phone down", x: 12, y: 90,
      action: () => {
        say([{ speaker: "You", text: "You set it back on the table. The room is where you left it." }]);
        setChoices([{ id: "back", label: "Return to the room", onPick: () => goto("bedroom") }]);
      },
    },
  ], [say, remember, askConfidence, goto]);

  /* ---------------------- Scene 3 : Hallway ------------------------- */
  const hallwayHotspots: Hotspot[] = useMemo(() => [
    { id: "keys", label: "Keys on the hook", x: 18, y: 30,
      action: () => {
        say([{ speaker: "Keys", text: "They are where they should be. It surprises you a little." }]);
        remember({ section: "Fragments", title: "Keys", body: "where they should be — surprising." });
      },
    },
    { id: "tote", label: "Tote bag", x: 30, y: 70,
      action: () => {
        say([{ speaker: "Tote", text: "Inside: a paperback, a receipt, half a granola bar. A list you wrote last night." }]);
        remember({ section: "Fragments", title: "Tote", body: "paperback / receipt / granola / a list from last night" });
      },
    },
    { id: "coat", label: "Coat on the hook", x: 12, y: 55,
      action: () => {
        say([{ speaker: "Coat", text: "The pocket weighs more than it should. Nothing in particular. Just weight." }]);
        remember({ section: "Reflections", title: "Coat pocket", body: "heavier than it should be — nothing in particular." });
      },
    },
    { id: "note", label: "Note on the wall", x: 84, y: 38,
      action: () => {
        say([
          { speaker: "Wall note", text: "The same handwriting again: one thing at a time." },
          { speaker: "Wall note", text: "Below it, an appointment card. The date is today. The time is later." },
        ]);
        remember({ section: "Fragments", title: "Wall note", body: "one thing at a time — appointment today, later." });
      },
    },
    { id: "shoes", label: "Shoes by the door", x: 66, y: 82,
      action: () => {
        say([{ speaker: "Shoes", text: "Two, facing outward. A version of you already thought this through." }]);
        remember({ section: "Self-Monitoring", title: "Shoes", body: "already facing out — a past-self helped." });
      },
    },
    { id: "door", label: "Front door", x: 52, y: 48,
      action: () => {
        say([
          { speaker: "Hallway", text: "You moved. The door did not get closer." },
          { speaker: "Door", text: "The door is not only a door. It is the shape of the whole morning asking to be finished." },
        ]);
        setChoices([
          { id: "leave", label: "Leave — the way you planned", hint: "keys, bag, coat", onPick: () => endWith("supported") },
          { id: "smaller", label: "Make today smaller", hint: "one errand, then home", onPick: () => endWith("smaller") },
          { id: "not_alone", label: "Ask someone to be on the other end", hint: "not alone, even if overloaded", onPick: () => endWith("notalone") },
        ]);
      },
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [say, remember]);

  /* ---------------------- Scene 4 : Kitchen ------------------------- */
  const kitchenHotspots: Hotspot[] = useMemo(() => [
    { id: "kettle", label: "Kettle", x: 20, y: 55,
      action: () => {
        say([
          { speaker: "Kettle", text: "You fill it to the line for one. The click is small and definite." },
          { speaker: "You", text: "A cup of something warm before anything else." },
        ]);
        remember({ section: "Self-Monitoring", title: "Kettle", body: "one cup, filled to the line for one." });
      },
    },
    { id: "mug", label: "The single mug", x: 47, y: 55,
      action: () => {
        say([{ speaker: "Mug", text: "Only one is out. That is enough for now." }]);
        remember({ section: "Fragments", title: "One mug", body: "only one is out — enough for now." });
      },
    },
    { id: "plant", label: "Window plant", x: 66, y: 40,
      action: () => {
        say([{ speaker: "Plant", text: "New leaf, unfurling. Nothing asked of you. Just noticing." }]);
        remember({ section: "Reflections", title: "New leaf", body: "unfurling — nothing asked, just noticing." });
      },
    },
    { id: "fridge", label: "Fridge magnets", x: 84, y: 55,
      action: () => {
        say([
          { speaker: "Magnets", text: "A shopping list, three months old. A photo. A postcard from someone who signs off with three x's." },
        ]);
        remember({ section: "Messages", title: "Postcard", body: "signed off with three x's." });
      },
    },
    { id: "bread", label: "Bread on the counter", x: 40, y: 78,
      action: () => {
        say([{ speaker: "Bread", text: "A slice, already out. A quiet suggestion." }]);
        remember({ section: "Self-Monitoring", title: "Bread", body: "already out — a quiet suggestion to eat." });
      },
    },
  ], [say, remember]);

  /* ---------------------- Scene 5 : Bathroom ------------------------ */
  const bathroomHotspots: Hotspot[] = useMemo(() => [
    { id: "mirror", label: "Mirror", x: 50, y: 30,
      action: () => {
        say([{ speaker: "Mirror", text: "Your face. Awake. Not more, not less." }]);
        askConfidence({ question: "Does this feel like you today?", options: ["Yes", "Mostly", "Not quite"], bucket: "sure" });
      },
    },
    { id: "tap", label: "Cold tap", x: 50, y: 68,
      action: () => {
        say([{ speaker: "Tap", text: "Cold water on the wrists. The morning takes half a step back." }]);
        remember({ section: "Self-Monitoring", title: "Cold water", body: "on the wrists — the morning took half a step back." });
      },
    },
    { id: "toothbrush", label: "Toothbrush", x: 42, y: 62,
      action: () => {
        say([{ speaker: "You", text: "A small routine, done. One thing that behaved the way you expected." }]);
        remember({ section: "Self-Monitoring", title: "Routine", body: "a small thing behaved as expected." });
      },
    },
    { id: "towel", label: "Folded towel", x: 78, y: 62,
      action: () => {
        say([{ speaker: "Towel", text: "Folded, exactly the way you learned it, from someone you don't call enough." }]);
        remember({ section: "Reflections", title: "Towel", body: "folded the way someone taught you." });
      },
    },
    { id: "meds", label: "Pill bottle", x: 22, y: 42,
      action: () => {
        say([
          { speaker: "Bottle", text: "Today's compartment: already taken. Yesterday: also. The list is being kept." },
        ]);
        remember({ section: "Self-Monitoring", title: "Meds taken", body: "today and yesterday — the list is kept." });
      },
    },
  ], [say, remember, askConfidence]);

  /* --------------------- Support cue -------------------------------- */
  const useSupportCue = useCallback(() => {
    setSupportGlow(true);
    setTimeout(() => setSupportGlow(false), 1200);
    const cue: Record<SceneId, string> = {
      hallway:  "One step. Keys first.",
      bedroom:  "Not the whole morning. Just the next hand.",
      phone:    "The sentence can be short. Short is still true.",
      kitchen:  "Warm first. Plans after.",
      bathroom: "Water. Face. Then the rest.",
    };
    const text = cue[scene];
    say([{ speaker: "Support", text }]);
    remember({ section: "Self-Monitoring", title: "Support cue", body: `${text} (${scene})` });
  }, [scene, say, remember]);

  const endWith = useCallback((id: EndingId) => {
    setEnding(id); setChoices([]); setQueue([]);
    // Wipe autosave once ending is reached
    try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ }
    setHasSave(false);
  }, []);

  /* --------------------- Active hotspots ---------------------------- */
  const activeHotspots =
    scene === "bedroom"  ? bedroomHotspots  :
    scene === "phone"    ? phoneHotspots    :
    scene === "hallway"  ? hallwayHotspots  :
    scene === "kitchen"  ? kitchenHotspots  :
                           bathroomHotspots;
  hotspotsRef.current = activeHotspots;

  const advance = useCallback(() => {
    if (queue.length > 1) setQueue((q) => q.slice(1));
    else if (queue.length === 1) setQueue([]);
    else if (choices.length === 0 && activeHotspots[focusIdx]) activeHotspots[focusIdx].action();
  }, [queue, choices.length, activeHotspots, focusIdx]);

  const stepBack = useCallback(() => {
    if (queue.length > 0) { setQueue([]); return; }
    if (choices.length > 0) { setChoices([]); return; }
    const prev = history[history.length - 1];
    if (prev) {
      setHistory((h) => h.slice(0, -1));
      setScene(prev);
    }
  }, [queue, choices.length, history]);

  useEffect(() => {
    if (!started) return;
    const handler = (e: KeyboardEvent) => {
      if (ending) return;
      if (showSettings) {
        if (e.key === "Escape") { setShowSettings(false); e.preventDefault(); }
        return;
      }
      if (e.key === "Tab") { e.preventDefault(); setFocusIdx((i) => (i + (e.shiftKey ? -1 : 1) + activeHotspots.length) % activeHotspots.length); return; }
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); advance(); return; }
      if (e.key === "Escape") { e.preventDefault(); if (showBook) setShowBook(false); else stepBack(); return; }
      if (e.key === "ArrowLeft")  { setFocusIdx((i) => (i - 1 + activeHotspots.length) % activeHotspots.length); return; }
      if (e.key === "ArrowRight") { setFocusIdx((i) => (i + 1) % activeHotspots.length); return; }
      if (e.key === "ArrowDown")  { stepBack(); return; }
      if (e.key.toLowerCase() === "m") { setShowBook((s) => !s); return; }
      if (e.key.toLowerCase() === "s") { useSupportCue(); return; }
      if (e.key === ",")               { setShowSettings((s) => !s); return; }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [started, ending, activeHotspots, advance, stepBack, showBook, showSettings, useSupportCue]);

  /* --------------- Save / Load handlers --------------------------- */
  const loadSave = useCallback(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const s: SaveState = JSON.parse(raw);
      if (s.version !== 1) return false;
      setScene(s.scene);
      setVisited(new Set(s.visited));
      setMemory(s.memory);
      setDepth(s.depth);
      firstVisitRef.current = new Set(s.visitedIntros);
      setHistory([]);
      setQueue([]);
      setChoices([]);
      setStarted(true);
      return true;
    } catch { return false; }
  }, []);

  const newGame = useCallback(() => {
    try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ }
    setScene("bedroom");
    setVisited(new Set(["bedroom"]));
    setMemory([]);
    setDepth(0);
    firstVisitRef.current = new Set();
    setHistory([]);
    setQueue([]);
    setChoices([]);
    setHasSave(false);
    setStarted(true);
  }, []);

  if (!started) return <TitleScreen hasSave={hasSave} onNew={newGame} onContinue={loadSave} onSettings={() => setShowSettings(true)} settings={settings} setSettings={setSettings} showSettings={showSettings} closeSettings={() => setShowSettings(false)} />;
  if (ending) return <EndingScreen id={ending} memory={memory} onRestart={newGame} />;

  const sceneImg =
    scene === "bedroom"  ? bedroomImg  :
    scene === "phone"    ? phoneImg    :
    scene === "hallway"  ? hallwayImg  :
    scene === "kitchen"  ? kitchenImg  :
                           bathroomImg;
  const currentLine = queue[0];

  const focusedHs = activeHotspots[focusIdx];
  const focusX = focusedHs ? focusedHs.x : 50;
  const focusY = focusedHs ? focusedHs.y : 50;
  const motionMul = settings.reducedMotion ? 0.15 : 1;
  const parallaxX = ((focusX - 50) / 50) * -3.2 * motionMul;
  const parallaxY = ((focusY - 50) / 50) * -2.2 * motionMul;
  const confusion = Math.min(depth, 14);
  const povRotate = (((focusX - 50) / 50) * 0.35 + Math.sin(depth * 0.6) * 0.15) * motionMul;

  const reachable = scene === "phone"
    ? new Set<SceneId>(["bedroom"])
    : new Set<SceneId>([scene, ...ROOM_ADJACENCY[scene as Exclude<SceneId, "phone">]]);

  return (
    <div
      className="bg-paperfield relative flex h-[100dvh] w-full flex-col overflow-hidden"
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY; }}
      onTouchEnd={(e) => {
        const sx = touchStartX.current, sy = touchStartY.current;
        touchStartX.current = null; touchStartY.current = null;
        if (sx == null || sy == null) return;
        const dx = e.changedTouches[0].clientX - sx;
        const dy = e.changedTouches[0].clientY - sy;
        if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return; // treat as tap
        if (Math.abs(dx) > Math.abs(dy)) {
          if (dx < 0) advance(); // swipe left = advance
          else stepBack();       // swipe right = back
        }
      }}
    >
      {/* Top HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <div className="font-hand text-xl tracking-wide text-paper/80 sm:text-2xl">soft recall</div>
        <div className="pointer-events-auto flex flex-wrap gap-2 text-xs">
          <HudButton onClick={() => setShowBook(true)} chord="M">Memory</HudButton>
          <HudButton onClick={useSupportCue} chord="S" glow={supportGlow}>Support</HudButton>
          <HudButton onClick={() => setShowSettings(true)} chord=",">Settings</HudButton>
        </div>
      </div>

      {/* Floating apartment map — responsive position */}
      <div className="pointer-events-none absolute z-40 top-[64px] right-3 sm:top-auto sm:bottom-[232px] sm:right-4">
        <ApartmentMap
          current={scene}
          visited={visited}
          reachable={reachable}
          onGo={(s) => { if (s !== scene && reachable.has(s)) goto(s); }}
        />
      </div>

      {/* Scene plate */}
      <div className="relative mx-auto flex w-full max-w-[1600px] flex-1 items-center justify-center px-2 pt-[100px] pb-[220px] sm:px-4 sm:pt-[110px] sm:pb-[240px]">
        <div className="paper-grain relative aspect-[16/9] w-full max-h-full overflow-hidden rough-edge ink-vignette rounded-md">
          <div
            className="absolute inset-0"
            style={{
              transform: `translate3d(${parallaxX}%, ${parallaxY}%, 0) rotate(${povRotate}deg) scale(${settings.reducedMotion ? 1.03 : 1.08})`,
              transition: "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
              transformOrigin: `${focusX}% ${focusY}%`,
            }}
          >
            <img
              key={scene}
              src={sceneImg}
              alt={scene}
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                animation: settings.reducedMotion
                  ? "fade-in 420ms ease both"
                  : "fade-in 420ms ease both, drift 22s ease-in-out infinite",
                filter: `saturate(${Math.max(0.72, 0.9 - confusion * 0.014)}) contrast(${1.02 + confusion * 0.004}) brightness(0.82)`,
              }}
            />
            <div className="pointer-events-none absolute inset-0" style={{
              background: "radial-gradient(ellipse 55% 42% at 50% 48%, oklch(0.88 0.06 75 / 8%), transparent 74%), linear-gradient(180deg, oklch(0.20 0.04 260 / 28%), oklch(0.14 0.03 275 / 18%) 60%, oklch(0.10 0.02 285 / 32%))",
              animation: settings.reducedMotion ? "none" : "vignette-breathe 9s ease-in-out infinite",
            }} />
          </div>
          <div className="ink-drips absolute inset-0 pointer-events-none" />
          <div className="film-grain" style={{ opacity: 0.18 * settings.grain }} />
          <div className="pointer-events-none absolute inset-2 rounded-sm border border-paper/10" />
          <div className="paper-grain-after" />

          {activeHotspots.map((h, i) => (
            <HotspotMarker key={h.id} hotspot={h} focused={i === focusIdx} onFocus={() => setFocusIdx(i)} />
          ))}
        </div>
      </div>

      <VNPanel
        scene={scene}
        line={currentLine}
        choices={choices}
        confidence={confidence}
        depth={depth}
        fuzzCap={settings.fuzzCap}
        onAdvance={() => { advance(); deepen(); }}
        onChoice={(c) => { c.onPick(); deepen(2); }}
        onConfidence={(opt) => {
          if (!confidence) return;
          remember({ section: "Self-Monitoring", title: confidence.question, body: opt });
          setConfidence(null);
        }}
      />

      {showBook && <MemoryBook entries={memory} onClose={() => setShowBook(false)} />}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          setSettings={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}


/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function HudButton({ children, onClick, chord, glow }: { children: React.ReactNode; onClick: () => void; chord: string; glow?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`choice-btn group flex items-center gap-2 rounded-sm px-2.5 py-1.5 font-sans text-[11px] uppercase tracking-[0.18em] hover:bg-ink/50 sm:px-3 ${glow ? "marker-glow" : ""}`}
    >
      <span className="rounded-sm border border-paper/30 px-1.5 py-0.5 font-mono text-[10px] text-paper/70">{chord}</span>
      <span className="text-paper/85">{children}</span>
    </button>
  );
}

/* -------- Apartment map (top-down floor plan) ---------------------- */

const ROOM_CELLS: Record<Exclude<SceneId, "phone">, { x: number; y: number; w: number; h: number; label: string }> = {
  bedroom:  { x: 4,   y: 4,  w: 62, h: 58, label: "Bedroom" },
  hallway:  { x: 68,  y: 4,  w: 62, h: 58, label: "Hallway" },
  bathroom: { x: 132, y: 4,  w: 62, h: 58, label: "Bath" },
  kitchen:  { x: 68,  y: 64, w: 62, h: 52, label: "Kitchen" },
};

function ApartmentMap({
  current, visited, reachable, onGo,
}: {
  current: SceneId;
  visited: Set<SceneId>;
  reachable: Set<SceneId>;
  onGo: (s: SceneId) => void;
}) {
  const rooms = Object.entries(ROOM_CELLS) as [Exclude<SceneId,"phone">, typeof ROOM_CELLS.bedroom][];
  return (
    <div className="pointer-events-auto flex flex-col items-center gap-0.5 rounded-md border border-paper/15 bg-ink/70 px-2 py-1.5 backdrop-blur-md">
      <div className="font-sans text-[8px] uppercase tracking-[0.28em] text-paper/45">
        {current === "phone" ? "In the phone" : "Apartment"}
      </div>
      <svg viewBox="0 0 200 120" width="140" height="84" className="block">
        <rect x="2" y="2" width="196" height="116" rx="3"
              fill="none" stroke="oklch(0.85 0.02 60 / 0.15)" strokeWidth="1" />
        {rooms.map(([id, cell]) => {
          const isCurrent = id === current;
          const isReachable = reachable.has(id);
          const isVisited = visited.has(id);
          const fill =
            isCurrent    ? "oklch(0.85 0.10 75 / 0.32)" :
            isReachable  ? "oklch(0.85 0.08 75 / 0.14)" :
            isVisited    ? "oklch(0.85 0.05 75 / 0.06)" :
                           "oklch(0.2 0.02 60 / 0.25)";
          const stroke =
            isCurrent    ? "oklch(0.9 0.12 75)" :
            isReachable  ? "oklch(0.85 0.08 75 / 0.6)" :
                           "oklch(0.5 0.02 60 / 0.35)";
          return (
            <g key={id}
               onClick={() => isReachable && onGo(id)}
               style={{ cursor: isReachable && !isCurrent ? "pointer" : "default" }}>
              <rect
                x={cell.x} y={cell.y} width={cell.w} height={cell.h}
                rx="2"
                fill={fill}
                stroke={stroke}
                strokeWidth={isCurrent ? 1.4 : 1}
                style={isCurrent ? { filter: "drop-shadow(0 0 6px oklch(0.85 0.14 75 / 0.7))" } : undefined}
              />
              <text
                x={cell.x + cell.w / 2} y={cell.y + cell.h / 2 + 3}
                textAnchor="middle"
                fontSize="9"
                fontFamily="ui-sans-serif, system-ui"
                letterSpacing="1.2"
                fill={
                  isCurrent   ? "oklch(0.96 0.04 75)" :
                  isReachable ? "oklch(0.88 0.03 75 / 0.85)" :
                                "oklch(0.7 0.02 60 / 0.35)"
                }
                style={{ textTransform: "uppercase", pointerEvents: "none", userSelect: "none" }}
              >
                {cell.label}
              </text>
              {isCurrent && (
                <circle cx={cell.x + cell.w / 2} cy={cell.y + 8} r="1.6"
                        fill="oklch(0.95 0.14 75)">
                  <animate attributeName="opacity" values="0.5;1;0.5" dur="2.4s" repeatCount="indefinite"/>
                </circle>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function HotspotMarker({ hotspot, focused, onFocus }: { hotspot: Hotspot; focused: boolean; onFocus: () => void }) {
  return (
    <button
      aria-label={hotspot.label}
      onMouseEnter={onFocus}
      onFocus={onFocus}
      onClick={hotspot.action}
      className="group absolute -translate-x-1/2 -translate-y-1/2 p-4 sm:p-2"
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
    >
      <span
        className={`block h-3 w-3 rounded-full bg-glow ${focused ? "marker-glow" : ""}`}
        style={{ animation: "pulse-soft 2.2s ease-in-out infinite" }}
      />
      <span
        className={`pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-sm border border-paper/20 bg-ink/80 px-2 py-0.5 font-hand text-sm text-paper/90 transition-opacity ${focused ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
      >
        {hotspot.label}
      </span>
    </button>
  );
}

function VNPanel({
  scene, line, choices, confidence, depth, fuzzCap, onAdvance, onChoice, onConfidence,
}: {
  scene: SceneId;
  line?: Line;
  choices: Choice[];
  confidence: ConfidencePrompt | null;
  depth: number;
  fuzzCap: number;
  onAdvance: () => void;
  onChoice: (c: Choice) => void;
  onConfidence: (opt: string) => void;
}) {
  const t = Math.min((depth / 14) * fuzzCap, 1);
  const eased = t * t * (3 - 2 * t);
  const halo = (eased * 0.7).toFixed(2);
  const bleed = (eased * 2.2).toFixed(2);
  const bleedAlpha = (0.04 + eased * 0.18).toFixed(3);
  const drift = (eased * 0.25).toFixed(2);
  const fuzzStyle = {
    textShadow: `0 0 ${halo}px currentColor, 0 0 ${bleed}px oklch(0.85 0.05 60 / ${bleedAlpha})`,
    letterSpacing: `${drift}px`,
  } as const;

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-20 px-2 pb-2 sm:px-4 sm:pb-4">
      <div className="vn-panel paper-grain mx-auto max-w-[1400px] rounded-md px-4 py-4 sm:px-6 sm:py-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <span className="font-hand text-xl text-ember sm:text-2xl" style={fuzzStyle}>
              {line?.speaker ?? (confidence ? "Self" : choices.length ? "Choose" : sceneLabel(scene))}
            </span>
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-paper/40">
              {sceneLabel(scene)}
            </span>
          </div>
          <ControllerPrompts hasLine={!!line} hasChoices={choices.length > 0} />
        </div>

        {line ? (
          <button
            onClick={onAdvance}
            className="w-full text-left font-serif text-lg leading-relaxed text-paper/95 hover:text-paper sm:text-xl"
            style={{ animation: "fade-in 400ms ease both", ...fuzzStyle }}
          >
            {line.text}
            <span className="ml-2 inline-block animate-pulse text-ember">▸</span>
          </button>
        ) : confidence ? (
          <div>
            <p className="mb-3 font-serif text-base italic text-paper/85 sm:text-lg">{confidence.question}</p>
            <div className="flex flex-wrap gap-2">
              {confidence.options.map((opt) => (
                <button key={opt} onClick={() => onConfidence(opt)} className="choice-btn rounded-sm px-4 py-2 text-sm hover:-translate-y-0.5 hover:border-ember">
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : choices.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {choices.map((c) => (
              <button
                key={c.id}
                onClick={() => onChoice(c)}
                className="choice-btn group rounded-sm px-4 py-3 text-left hover:-translate-y-0.5 hover:border-ember"
              >
                <div className="font-serif text-base text-paper">{c.label}</div>
                {c.hint && <div className="mt-0.5 font-hand text-sm text-paper/60">{c.hint}</div>}
              </button>
            ))}
          </div>
        ) : (
          <p className="font-hand text-base text-paper/55 sm:text-lg">
            Look around. Tap a glow, or use <Kbd>Tab</Kbd> + <Kbd>↵</Kbd>. Move via the map. Swipe left to advance, right to go back.
          </p>
        )}
      </div>
    </div>
  );
}

function ControllerPrompts({ hasLine, hasChoices }: { hasLine: boolean; hasChoices: boolean }) {
  return (
    <div className="hidden items-center gap-3 font-sans text-[10px] uppercase tracking-[0.18em] text-paper/50 md:flex">
      <span><Kbd>↵</Kbd> {hasLine ? "Advance" : hasChoices ? "Confirm" : "Inspect"}</span>
      <span><Kbd>Esc</Kbd> Back</span>
      <span><Kbd>M</Kbd> Book</span>
      <span><Kbd>S</Kbd> Support</span>
      <span><Kbd>,</Kbd> Settings</span>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="mx-0.5 rounded-sm border border-paper/30 bg-ink/60 px-1 py-0.5 font-mono text-[10px] text-paper/80">{children}</kbd>;
}

function sceneLabel(s: SceneId) {
  return s === "bedroom" ? "Bedside" : s === "phone" ? "Phone" : s === "hallway" ? "Hallway" : s === "kitchen" ? "Kitchen" : "Bathroom";
}

/* ------------------------------------------------------------------ */
/* Memory Book                                                         */
/* ------------------------------------------------------------------ */

function MemoryBook({ entries, onClose }: { entries: MemoryEntry[]; onClose: () => void }) {
  const sections: MemoryEntry["section"][] = ["Fragments", "Messages", "Self-Monitoring", "Reflections"];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 sm:p-6" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="paper-grain relative max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-md rough-edge"
        style={{
          background: "linear-gradient(180deg, oklch(0.9 0.04 75), oklch(0.82 0.05 65))",
          color: "oklch(0.2 0.04 30)",
          boxShadow: "0 30px 80px oklch(0 0 0 / 60%)",
          animation: "fade-in 300ms ease both",
        }}
      >
        <div className="flex items-center justify-between border-b border-ink/20 px-6 py-4">
          <div>
            <div className="font-hand text-3xl text-ink">memory book</div>
            <div className="font-sans text-[10px] uppercase tracking-[0.25em] text-ink/50">a scrapbook of the morning</div>
          </div>
          <button onClick={onClose} className="rounded-sm border border-ink/30 px-3 py-1 font-sans text-xs uppercase tracking-widest text-ink/70 hover:bg-ink/10">Close · Esc</button>
        </div>
        <div className="max-h-[70vh] space-y-6 overflow-y-auto px-6 py-6">
          {entries.length === 0 && (
            <p className="font-serif text-sm italic text-ink/60">
              Nothing kept yet. Touch the glowing things — small noticings become entries.
            </p>
          )}
          {sections.map((sec) => {
            const items = entries.filter((e) => e.section === sec);
            if (items.length === 0) return null;
            return (
              <section key={sec}>
                <h3 className="mb-2 font-hand text-2xl text-ink">{sec}</h3>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {items.map((it, i) => (
                    <li key={i} className="rotate-[-0.4deg] border border-ink/20 bg-white/40 px-3 py-2 shadow-sm">
                      <div className="font-serif text-sm font-semibold text-ink">{it.title}</div>
                      <div className="font-serif text-sm text-ink/80">{it.body}</div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Settings Panel                                                      */
/* ------------------------------------------------------------------ */

function SettingsPanel({
  settings, setSettings, onClose,
}: {
  settings: Settings;
  setSettings: (s: Settings) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="paper-grain w-full max-w-md rounded-md rough-edge px-6 py-6"
        style={{
          background: "linear-gradient(180deg, oklch(0.14 0.02 285), oklch(0.09 0.015 280))",
          border: "1px solid oklch(0.7 0.04 65 / 22%)",
          boxShadow: "0 30px 80px oklch(0 0 0 / 60%)",
          animation: "fade-in 250ms ease both",
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="font-hand text-2xl text-paper">settings</div>
            <div className="font-sans text-[10px] uppercase tracking-[0.25em] text-paper/50">accessibility & feel</div>
          </div>
          <button onClick={onClose} className="rounded-sm border border-paper/30 px-3 py-1 font-sans text-xs uppercase tracking-widest text-paper/70 hover:bg-paper/10">Close · Esc</button>
        </div>

        <div className="space-y-5 text-paper">
          <label className="flex items-center justify-between gap-4">
            <div>
              <div className="font-serif">Reduced motion</div>
              <div className="font-sans text-xs text-paper/55">Fades the drift, parallax and breathing overlay.</div>
            </div>
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(e) => setSettings({ ...settings, reducedMotion: e.target.checked })}
              className="h-5 w-5 accent-[oklch(0.85_0.14_75)]"
            />
          </label>

          <div>
            <div className="mb-1 flex items-baseline justify-between">
              <div className="font-serif">Film grain</div>
              <div className="font-mono text-xs text-paper/60">{Math.round(settings.grain * 100)}%</div>
            </div>
            <input
              type="range" min={0} max={1} step={0.05}
              value={settings.grain}
              onChange={(e) => setSettings({ ...settings, grain: parseFloat(e.target.value) })}
              className="w-full accent-[oklch(0.85_0.14_75)]"
            />
          </div>

          <div>
            <div className="mb-1 flex items-baseline justify-between">
              <div className="font-serif">Text fuzz cap</div>
              <div className="font-mono text-xs text-paper/60">{Math.round(settings.fuzzCap * 100)}%</div>
            </div>
            <div className="font-sans text-xs text-paper/55 mb-1">Limits how blurry text gets as the morning deepens.</div>
            <input
              type="range" min={0} max={1} step={0.05}
              value={settings.fuzzCap}
              onChange={(e) => setSettings({ ...settings, fuzzCap: parseFloat(e.target.value) })}
              className="w-full accent-[oklch(0.85_0.14_75)]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Title & Ending                                                      */
/* ------------------------------------------------------------------ */

function TitleScreen({
  hasSave, onNew, onContinue, onSettings, settings, setSettings, showSettings, closeSettings,
}: {
  hasSave: boolean;
  onNew: () => void;
  onContinue: () => void;
  onSettings: () => void;
  settings: Settings;
  setSettings: (s: Settings) => void;
  showSettings: boolean;
  closeSettings: () => void;
}) {
  return (
    <div className="bg-paperfield relative flex h-[100dvh] w-full items-center justify-center overflow-hidden">
      <img src={bedroomImg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/85" />
      <div className="relative z-10 max-w-xl px-6 text-center sm:px-8">
        <div className="font-hand text-base tracking-[0.4em] text-ember/80 uppercase sm:text-lg">a first-person visual novel</div>
        <h1 className="mt-4 font-serif text-5xl italic leading-none text-paper sm:text-7xl" style={{ letterSpacing: "-0.02em" }}>Soft Recall</h1>
        <p className="mx-auto mt-6 max-w-md font-serif text-base leading-relaxed text-paper/80 sm:text-lg">
          A quiet morning that no longer behaves as expected. Look. Touch small things. Move only as far as feels honest.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {hasSave && (
            <button
              onClick={onContinue}
              className="choice-btn rounded-sm px-6 py-3 font-serif text-lg hover:-translate-y-0.5 hover:border-ember"
            >
              Continue the morning
            </button>
          )}
          <button
            onClick={onNew}
            className={`choice-btn rounded-sm px-6 py-3 font-serif text-lg hover:-translate-y-0.5 hover:border-ember ${hasSave ? "opacity-80" : ""}`}
          >
            {hasSave ? "Begin again" : "Begin the morning"}
          </button>
          <button
            onClick={onSettings}
            className="rounded-sm border border-paper/30 bg-ink/40 px-4 py-2 font-sans text-xs uppercase tracking-[0.2em] text-paper/70 hover:bg-ink/60"
          >
            Settings
          </button>
        </div>
        <div className="mt-8 font-sans text-[10px] uppercase tracking-[0.3em] text-paper/40">
          tab · enter · esc · m · s · , · click the map to move
        </div>
      </div>
      {showSettings && (
        <SettingsPanel settings={settings} setSettings={setSettings} onClose={closeSettings} />
      )}
    </div>
  );
}

const ENDINGS: Record<EndingId, { title: string; what: string; helped: string; hard: string; reflect: string }> = {
  supported: {
    title: "Supported Departure",
    what: "You picked up the keys. The door opened at the ordinary time. The street was already the street.",
    helped: "A short sentence you sent. A note in your own hand. One thing, then the next thing.",
    hard: "The moment before the door. The list, when it was still whole.",
    reflect: "What was the smallest thing that made the door reachable?",
  },
  smaller: {
    title: "Smaller Morning",
    what: "You made today one errand wide. You went, and you came home. The room was still the room.",
    helped: "Cold water. A single mug. Permission to do one thing, and to call that today.",
    hard: "Deciding what to leave undone without turning it into evidence about yourself.",
    reflect: "What did you leave undone, and can it stay undone?",
  },
  notalone: {
    title: "Not Alone, Even If Overloaded",
    what: "You asked someone to be on the other end. They stayed. The door was less of a door.",
    helped: "The sentence you finally sent. Someone asking one soft question, not five.",
    hard: "Letting the day be seen in the middle of it, not only after.",
    reflect: "Who did you let in, and what did it cost you — and gain you?",
  },
};

function EndingScreen({ id, memory, onRestart }: { id: EndingId; memory: MemoryEntry[]; onRestart: () => void }) {
  const e = ENDINGS[id];
  const sections: MemoryEntry["section"][] = ["Fragments", "Messages", "Self-Monitoring", "Reflections"];
  const counts = sections.map((s) => ({ s, n: memory.filter((m) => m.section === s).length }));
  const total = memory.length;

  // Which specific noticings appeared? Pull up to 4 highlights the ending can reference.
  const highlights = memory.slice(0, 4);

  return (
    <div className="bg-paperfield relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-y-auto px-4 py-10 sm:px-6">
      <img src={bedroomImg} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black/90" />
      <div className="relative z-10 w-full max-w-2xl">
        <div className="font-hand text-base tracking-[0.4em] text-ember/80 uppercase">the morning, as it was</div>
        <h2 className="mt-3 font-serif text-4xl italic leading-tight text-paper sm:text-5xl">{e.title}</h2>

        <div className="mt-8 space-y-5 font-serif text-lg leading-relaxed text-paper/90">
          <p>{e.what}</p>
          <div>
            <div className="font-sans text-[10px] uppercase tracking-[0.25em] text-paper/40">what helped</div>
            <p className="mt-1">{e.helped}</p>
          </div>
          <div>
            <div className="font-sans text-[10px] uppercase tracking-[0.25em] text-paper/40">what was hard</div>
            <p className="mt-1">{e.hard}</p>
          </div>
          <div className="rounded-sm border border-paper/15 bg-ink/40 px-5 py-4">
            <div className="font-sans text-[10px] uppercase tracking-[0.25em] text-paper/40">a small question</div>
            <p className="mt-1 italic">{e.reflect}</p>
          </div>
        </div>

        {total > 0 && (
          <div className="mt-8 rounded-md border border-paper/15 bg-ink/40 px-5 py-4">
            <div className="mb-2 flex items-baseline justify-between">
              <div className="font-hand text-xl text-paper">what you kept</div>
              <div className="font-mono text-xs text-paper/50">
                {counts.filter((c) => c.n > 0).map((c) => `${c.s.slice(0, 4).toLowerCase()} ${c.n}`).join(" · ")} · {total} total
              </div>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {highlights.map((m, i) => (
                <li key={i} className="rotate-[-0.3deg] border border-paper/15 bg-paper/5 px-3 py-2">
                  <div className="font-serif text-sm text-paper">{m.title}</div>
                  <div className="font-serif text-xs text-paper/70">{m.body}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <button onClick={onRestart} className="choice-btn rounded-sm px-6 py-3 font-serif text-lg hover:-translate-y-0.5 hover:border-ember">
            Begin another morning
          </button>
          <div className="font-sans text-[10px] uppercase tracking-[0.3em] text-paper/40">
            three endings · this was one of them
          </div>
        </div>
      </div>
    </div>
  );
}
