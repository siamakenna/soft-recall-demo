import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { visibleResearchLinks, type ResearchLink } from "@/data/researchLinks";
import { ADJACENCY, ROOM_LABEL, SCENE_IMG, roomEnterLine } from "./data/rooms";
import {
  BATH_MIN,
  BATH_TASKS,
  KITCHEN_MIN,
  KITCHEN_TASKS,
  REVISIT_THOUGHTS,
  TOTAL_TASKS,
} from "./data/interactions";
import { ENDING_COPY, ENDING_ORDER } from "./data/endings";
import {
  GAME_SAVE_VERSION,
  clearGameSave,
  createInitialGameSave,
  hasGameSave,
  loadGameSave,
  writeGameSave,
  type EndingId,
  type MemoryEntry,
  type PackedItems,
  type RoomId,
} from "./state";


/* ------------------------------------------------------------------ */
/* Types & data                                                        */
/* ------------------------------------------------------------------ */

interface Hotspot {
  id: string;
  label: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  onInspect: () => void;
}

interface Settings {
  reducedMotion: boolean;
  grain: number;
  fuzzCap: number;
  markerScale: number;   // 0.5 – 1.5, affects marker visual + hit-area
  debugHotspots: boolean; // toggle with `~`
  foliage: number;       // 0 – 1 Ghibli greenery overlay strength
  subtitleScale: number; // 0.85 – 1.6
  dyslexiaFont: boolean;
  parallax: boolean;
}

interface VNLine { speaker: string; text: string; }
interface VNChoice { id: string; label: string; onPick: () => void; tone?: "neutral" | "wrong" | "kind"; }

function isEditableTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}

const SETTINGS_KEY = "soft-recall.settings.v3";
const HOTSPOT_OVERRIDES_KEY = "soft-recall.hotspots.v1";
const ONBOARD_KEY = "soft-recall.onboarded.v1";
const DEFAULT_SETTINGS: Settings = {
  reducedMotion: false, grain: 0.5, fuzzCap: 1, markerScale: 1.15,
  debugHotspots: false, foliage: 0.8,
  subtitleScale: 1, dyslexiaFont: false, parallax: true,
};

type HotspotOverrides = Record<string, Record<string, { x: number; y: number }>>;
// shape: { [sceneId]: { [hotspotId]: {x,y} } }

/* ------------------------------ mini-games ------------------------- */
type MiniKind = "brush" | "sip" | "knob" | "splash" | "pour" | "combo" | "pairs" | "reflection" | "unscramble" | "slide";
interface MiniSpec {
  kind: MiniKind;
  title: string;
  hint: string;
  onDone: () => void;
  onCancel?: () => void;
  /** puzzle payload — combo: 3-digit code; pairs: item->target map. */
  combo?: number[];
  pairs?: { items: { id: string; label: string; emoji?: string }[]; targets: { id: string; label: string }[]; correctMap: Record<string, string> };
  /** unscramble: target word + optional hint letter positions */
  unscramble?: { word: string; caption: string };
  /** slide: image url + rows/cols grid to reassemble */
  slide?: { image: string; caption: string };
  onMisstep?: () => void;
}

/* ------------------------------ richer interactions ---------------- */
/* These are non-hotspot flows layered on top of the click-hotspot loop.
   Every one of them has at least one wrong branch so a perfect run
   requires real attention, not just clicking through. */
type InteractionSpec =
  | {
      kind: "drag";
      title: string;
      hint: string;
      item: string;
      targets: { id: string; label: string; tone: "correct" | "neutral" | "wrong" }[];
      onPick: (targetId: string, tone: "correct" | "neutral" | "wrong") => void;
      /** if true, wrong-tone picks don't dismiss — they trigger onMisstep and let the player retry */
      retryOnWrong?: boolean;
      onMisstep?: () => void;
      onCancel?: () => void;
    }
  | {
      kind: "sequence";
      title: string;
      hint: string;
      items: { id: string; label: string }[];
      correctOrder: string[];
      onDone: (order: string[], correct: boolean) => void;
      onMisstep?: () => void;
      onCancel?: () => void;
      /** optional soft time limit (ms). When it runs out, current order is submitted and a misstep is logged. */
      timeLimit?: number;
    }
  | {
      kind: "checklist";
      title: string;
      hint: string;
      options: { id: string; label: string; correct: boolean }[];
      onDone: (picked: string[], allCorrect: boolean, wrongCount: number) => void;
      onMisstep?: () => void;
      onCancel?: () => void;
      timeLimit?: number;
      /** optional illustrated preview of what's really there (e.g. fridge shelves) */
      preview?: { title: string; items: { label: string; emoji: string }[] };
    }
  | {
      kind: "confidence";
      title: string;
      hint: string;
      /** what the honest answer should be, given progress */
      honestLevel: 1 | 2 | 3;
      onPick: (level: 1 | 2 | 3, misaligned: boolean) => void;
      onCancel?: () => void;
    };


/* ------------------------------------------------------------------ */
/* Root component                                                      */
/* ------------------------------------------------------------------ */

export default function SoftRecall() {
  const [screen, setScreen] = useState<"title" | "game" | "ending">("title");
  const [room, setRoom] = useState<RoomId>("bedroom");
  const [closeup, setCloseup] = useState<null | "phone">(null);
  const [visited, setVisited] = useState<Set<RoomId>>(new Set(["bedroom"]));
  const [unlocked, setUnlocked] = useState<Set<RoomId>>(new Set(["bedroom"]));
  const [frontDoorUnlocked, setFrontDoorUnlocked] = useState(false);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [memory, setMemory] = useState<MemoryEntry[]>([]);
  const [vnLine, setVnLine] = useState<VNLine | null>(null);
  const [vnChoices, setVnChoices] = useState<VNChoice[]>([]);
  const [showBook, setShowBook] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [ending, setEnding] = useState<EndingId | null>(null);
  const [hasSave, setHasSave] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [hintPulse, setHintPulse] = useState(false);
  const [tutorialActive, setTutorialActive] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [toast, setToast] = useState<{ section: string; title: string; id: number } | null>(null);
  const toastTimer = useRef<number | null>(null);
  const saveTimer = useRef<number | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const [hotspotOverrides, setHotspotOverrides] = useState<HotspotOverrides>({});
  const [dragging, setDragging] = useState<{ scene: string; id: string } | null>(null);
  const [mini, setMini] = useState<MiniSpec | null>(null);
  const startMini = useCallback((spec: MiniSpec) => setMini(spec), []);
  const [interaction, setInteraction] = useState<InteractionSpec | null>(null);
  const startInteraction = useCallback((spec: InteractionSpec) => setInteraction(spec), []);
  /* Pass 2 tracking — richer telemetry the endings will use in Pass 3. */
  const [interactionOrder, setInteractionOrder] = useState<string[]>([]);
  const [confidenceChoices, setConfidenceChoices] = useState<number[]>([]);
  const [supportCueUseCount, setSupportCueUseCount] = useState(0);
  const [packed, setPacked] = useState<PackedItems>({ keys: false, bag: false, phone: false });
  /* Pass 3 — room visit order shapes which of the 5 endings you reach. */
  const [roomVisitOrder, setRoomVisitOrder] = useState<RoomId[]>(["bedroom"]);

  /* New: clarity/dissonance, onboarding, hint cooldown, breathe ritual, parallax, hover thought */
  const [clarity, setClarity] = useState(0);
  const [dissonance, setDissonance] = useState(0);
  const [onboarded, setOnboarded] = useState(true);
  const [hintCooldown, setHintCooldown] = useState(0);
  const [breathing, setBreathing] = useState<null | "in" | "out">(null);
  const [thought, setThought] = useState<{ id: string; text: string } | null>(null);
  const parallaxRef = useRef({ x: 0, y: 0 });
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const rafParallax = useRef<number | null>(null);
  /* Hold-mouse-and-drag to actively pan the scene perspective */
  const [dragPan, setDragPan] = useState({ x: 0, y: 0 });
  const dragPanRef = useRef({ active: false, startX: 0, startY: 0, baseX: 0, baseY: 0 });
  /* Physical room transitions — brief overlay while the scene swaps. */
  const [transition, setTransition] = useState<null | { to: RoomId | "frontdoor"; from: RoomId | null; kind: "doorway" | "threshold" }>(null);
  const transitionTimer = useRef<number | null>(null);



  /* ---------------------- persistence ----------------------------- */
  useEffect(() => {
    try {
      const s = localStorage.getItem(SETTINGS_KEY);
      if (s) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(s) });
      setHasSave(hasGameSave(localStorage));
      const o = localStorage.getItem(HOTSPOT_OVERRIDES_KEY);
      if (o) setHotspotOverrides(JSON.parse(o));
      setOnboarded(!!localStorage.getItem(ONBOARD_KEY));
    } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* Storage can be unavailable in privacy mode. */ }
  }, [settings]);
  useEffect(() => {
    try { localStorage.setItem(HOTSPOT_OVERRIDES_KEY, JSON.stringify(hotspotOverrides)); } catch { /* Storage can be unavailable in privacy mode. */ }
  }, [hotspotOverrides]);
  /* Debounced save — fixes stutter from writing on every state change */
  useEffect(() => {
    if (screen === "title") return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      try {
        writeGameSave(localStorage, {
          schemaVersion: GAME_SAVE_VERSION,
          currentRoom: room,
          visitedRooms: [...visited],
          unlockedRooms: [...unlocked],
          completedInteractions: [...done],
          interactionOrder,
          memoryEntries: memory,
          roomVisitOrder,
          confidenceChoices,
          supportCueUseCount,
          packedItems: packed,
          frontDoorUnlocked,
          wrongCount,
          clarity,
          dissonance,
          endingState: ending,
        });
        setHasSave(true);
      } catch { /* Saving is best-effort when browser storage is unavailable. */ }
    }, 400);
    return () => { if (saveTimer.current) window.clearTimeout(saveTimer.current); };
  }, [screen, room, visited, unlocked, frontDoorUnlocked, done, interactionOrder, memory, wrongCount, clarity, dissonance, roomVisitOrder, confidenceChoices, supportCueUseCount, packed, ending]);

  const remember = useCallback((entry: MemoryEntry) => {
    setMemory((prev) => {
      if (prev.some(e => e.title === entry.title)) return prev;
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
      setToast({ section: entry.section, title: entry.title, id: Date.now() });
      toastTimer.current = window.setTimeout(() => setToast(null), 2800);
      setClarity(c => c + 1);
      const stamped: MemoryEntry = { ...entry, at: entry.at ?? Date.now(), room: entry.room ?? room };
      return [...prev, stamped];
    });
  }, [room]);

  const say = useCallback((speaker: string, text: string) => {
    setVnLine({ speaker, text });
    setVnChoices([]);
  }, []);

  const markDone = useCallback((id: string) => {
    setDone(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev); next.add(id); return next;
    });
  }, []);

  const misstep = useCallback((line?: { speaker: string; text: string }) => {
    setWrongCount(w => Math.min(6, w + 1));
    setDissonance(d => d + 1);
    if (line) setVnLine(line);
  }, []);

  const gotoRoom = useCallback((r: RoomId) => {
    setCloseup(null);
    const applySwap = () => {
      setRoom(r);
      setVisited(prev => {
        if (prev.has(r)) return prev;
        const n = new Set(prev); n.add(r); return n;
      });
      setRoomVisitOrder(prev => prev[prev.length - 1] === r ? prev : [...prev, r]);
      setVnLine({ speaker: ROOM_LABEL[r], text: roomEnterLine(r) });
      setVnChoices([]);
    };
    if (settings.reducedMotion) { applySwap(); return; }
    setTransition({ to: r, from: room, kind: "doorway" });
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
    window.setTimeout(applySwap, 260);
    transitionTimer.current = window.setTimeout(() => setTransition(null), 720);
  }, [room, settings.reducedMotion]);



  /* ---------------------- start / load ---------------------------- */
  const beginNew = useCallback(() => {
    const initial = createInitialGameSave();
    setRoom("bedroom");
    setVisited(new Set(["bedroom"]));
    setUnlocked(new Set(["bedroom"]));
    setFrontDoorUnlocked(false);
    setDone(new Set());
    setMemory([]);
    setEnding(null);
    setCloseup(null);
    setWrongCount(0);
    setClarity(0);
    setDissonance(0);
    setInteraction(null);
    setInteractionOrder([]);
    setConfidenceChoices([]);
    setSupportCueUseCount(0);
    setPacked(initial.packedItems);
    setRoomVisitOrder(["bedroom"]);

    setVnLine({ speaker: "Morning", text: "The room is still deciding what shape to be." });
    setVnChoices([]);
    setTutorialActive(true);
    setScreen("game");
  }, []);
  const continueSave = () => {
    try {
      const s = loadGameSave(localStorage);
      if (!s) { beginNew(); return; }
      setRoom(s.currentRoom);
      setVisited(new Set(s.visitedRooms));
      setUnlocked(new Set(s.unlockedRooms));
      setFrontDoorUnlocked(s.frontDoorUnlocked);
      setDone(new Set(s.completedInteractions));
      setMemory(s.memoryEntries);
      setWrongCount(s.wrongCount);
      setClarity(s.clarity);
      setDissonance(s.dissonance);
      setInteractionOrder(s.interactionOrder);
      setConfidenceChoices(s.confidenceChoices);
      setSupportCueUseCount(s.supportCueUseCount);
      setPacked(s.packedItems);
      setRoomVisitOrder(s.roomVisitOrder);
      setEnding(s.endingState);
      setCloseup(null);
      setTutorialActive(false);
      setVnLine(s.endingState ? null : { speaker: ROOM_LABEL[s.currentRoom], text: "You pick up where you left off." });
      setVnChoices([]);
      setScreen(s.endingState ? "ending" : "game");
    } catch { beginNew(); }
  };
  const restartDemo = useCallback(() => {
    try { clearGameSave(localStorage); } catch { /* A new in-memory run can still begin. */ }
    setHasSave(false);
    beginNew();
  }, [beginNew]);
  const finishOnboarding = () => {
    try { localStorage.setItem(ONBOARD_KEY, "1"); } catch { /* Onboarding can repeat if storage is unavailable. */ }
    setOnboarded(true);
  };


  /* ---------------------- helpers --------------------------------- */

  const kitchenCount = useMemo(() => KITCHEN_TASKS.filter(t => done.has(t)).length, [done]);
  const bathCount    = useMemo(() => BATH_TASKS.filter(t => done.has(t)).length, [done]);

  const maybeUnlockFrontDoor = useCallback(() => {
    setDone(current => {
      const kOk = KITCHEN_TASKS.filter(t => current.has(t)).length >= KITCHEN_MIN;
      const bOk = BATH_TASKS.filter(t => current.has(t)).length >= BATH_MIN;
      if (kOk && bOk && !frontDoorUnlocked) {
        setFrontDoorUnlocked(true);
        setTimeout(() => {
          setVnLine({ speaker: "Front Door", text: "Warm. Clean. Ready. The door will open when you turn to it." });
        }, 900);
      }
      return current;
    });
  }, [frontDoorUnlocked]);

  /* ---------------------- bedroom interactions -------------------- */

  const inspectGlasses = () => {
    markDone("glasses");
    remember({ section: "Fragments", title: "Glasses on the sill", body: "Cold arms. Fingerprints. The world snaps into edges." });
    say("Glasses", "The room sharpens at the edges first.");
  };
  const logInter = (id: string) => setInteractionOrder(o => [...o, id]);

  const inspectNote = () => {
    startInteraction({
      kind: "drag",
      title: "The folded note",
      hint: "Drag it somewhere you'll actually see it later.",
      item: "\"One step. Then the next.\"",
      retryOnWrong: true,
      onMisstep: () => misstep({ speaker: "Note", text: "In the drawer it disappears from you by lunchtime. Try somewhere it'll catch your eye." }),
      targets: [
        { id: "door",   label: "Prop it by the door",  tone: "correct" },
        { id: "pillow", label: "Back on the pillow",   tone: "neutral" },
        { id: "drawer", label: "Tuck it in the drawer", tone: "wrong" },
      ],
      onPick: (id, tone) => {
        setInteraction(null);
        logInter("note:" + id);
        markDone("note");
        if (tone === "correct") {
          setSupportCueUseCount(n => n + 1);
          remember({ section: "Messages", title: "Note by the door", body: "Placed where the coat waits. A cue for the version of you that leaves." });
          say("Note", "One step. Then the next. Where you'll pass it on the way out.");
        } else {
          remember({ section: "Messages", title: "Note on the pillow", body: "Warm from the fold. May or may not follow you into the day." });
          say("Note", "The pillow keeps it warm. It may not follow you out.");
        }
      },
      onCancel: () => { setInteraction(null); say("Note", "You leave it half-lifted. It'll wait."); },
    });
  };

  const inspectAlarm = () => {
    markDone("alarm");
    remember({ section: "Fragments", title: "Alarm clock", body: "7:12. Later than you meant. Not late enough to panic." });
    say("Alarm", "7:12. Not a disaster. A margin, still.");
  };
  const inspectCurtains = () => {
    markDone("curtains");
    remember({ section: "Reflections", title: "Curtains, opened", body: "The room agrees to be seen. Grey light, but honest." });
    say("Curtains", "Light. Grey and honest.");
  };

  /* Optional diegetic seeds record how the player meets an object
     without forcing a single correct reading. */

  /** shared helper — apply a seed's chosen tone to the run state. */
  const applySeedChoice = (
    idKey: string,
    tone: "kind" | "honest" | "dismiss",
    entries: { kind: MemoryEntry; honest: MemoryEntry; dismiss: MemoryEntry },
    speaker: string,
    lines: { kind: string; honest: string; dismiss: string },
  ) => {
    markDone(idKey);
    setVnChoices([]);
    logInter(`seed:${idKey}:${tone}`);
    if (tone === "kind") {
      setConfidenceChoices(c => [...c, 3]);
      setSupportCueUseCount(n => n + 1);
      setClarity(v => v + 1);
      remember(entries.kind);
      say(speaker, lines.kind);
    } else if (tone === "honest") {
      setConfidenceChoices(c => [...c, 2]);
      remember(entries.honest);
      say(speaker, lines.honest);
    } else {
      setConfidenceChoices(c => [...c, 1]);
      remember(entries.dismiss);
      misstep({ speaker, text: lines.dismiss });
    }
  };

  const inspectNightstandBook = () => {
    setVnLine({
      speaker: "Library book",
      text: "Bookmarked at a chapter you keep almost finishing. Three pages have softened at the corner. What do you do with it, right now?",
    });
    setVnChoices([
      {
        id: "read",
        tone: "kind",
        label: "Read a paragraph before you leave.",
        onPick: () => applySeedChoice("night-book", "kind",
          {
            kind:    { section: "Reflections", title: "A paragraph you read",           body: "You made it three sentences in. Enough to know you're not the only one whose Tuesday and Wednesday disagree. Something in the chest loosens by a notch." },
            honest:  { section: "Fragments",   title: "Library book, bookmarked",       body: "Still bookmarked. Still waiting. But you saw it, and you named it." },
            dismiss: { section: "Fragments",   title: "Library book, face down",        body: "You turned it face down. It is easier not to see the title from the door." },
          },
          "Library book",
          {
            kind:    "Three sentences. Enough to remember you are not the only one.",
            honest:  "You touch the cover. Later, then. Not never.",
            dismiss: "Face down on the nightstand. The title stops looking back.",
          },
        ),
      },
      { id: "note",  tone: "neutral", label: "Slide the bookmark forward one page.", onPick: () => applySeedChoice("night-book", "honest",
          { kind:    { section: "Reflections", title: "A paragraph you read",           body: "…" },
            honest:  { section: "Fragments",   title: "Library book, bookmarked",       body: "Still bookmarked. Still waiting. But you saw it, and you named it." },
            dismiss: { section: "Fragments",   title: "Library book, face down",        body: "You turned it face down. It is easier not to see the title from the door." } },
          "Library book",
          { kind: "", honest: "You touch the cover. Later, then. Not never.", dismiss: "" }) },
      { id: "hide",  tone: "wrong",   label: "Turn it face down.", onPick: () => applySeedChoice("night-book", "dismiss",
          { kind:    { section: "Reflections", title: "A paragraph you read",           body: "…" },
            honest:  { section: "Fragments",   title: "Library book, bookmarked",       body: "…" },
            dismiss: { section: "Fragments",   title: "Library book, face down",        body: "You turned it face down. It is easier not to see the title from the door." } },
          "Library book",
          { kind: "", honest: "", dismiss: "Face down. The title stops looking back. Something behind your sternum tightens instead." }) },
    ]);
  };

  const inspectCollegePhoto = () => {
    setVnLine({
      speaker: "Photo",
      text: "You at nineteen, in a stadium jacket. Ana wrote on the back: before everything got complicated. Neither of you knew it would become a before.",
    });
    setVnChoices([
      { id: "own",  tone: "kind",    label: "Say the word out loud: before.",
        onPick: () => applySeedChoice("hall-photo", "kind",
          { kind:    { section: "Reflections", title: "The word before",           body: "You said it out loud, just once. The word takes its shape in the hallway. What comes after is still being written, and you're the one writing it." },
            honest:  { section: "Reflections", title: "Framed photo, hallway",     body: "Nineteen. Stadium jacket. Ana's pencil on the back. You look, and let it be true." },
            dismiss: { section: "Fragments",   title: "Framed photo, turned",      body: "You turned it toward the wall. The hallway is quieter that way. Slightly." } },
          "Photo",
          { kind:    "Before. Said aloud, it is only a word.",
            honest:  "Nineteen. You let the photo look back.",
            dismiss: "" }) },
      { id: "look", tone: "neutral", label: "Look at it a moment longer.",
        onPick: () => applySeedChoice("hall-photo", "honest",
          { kind:    { section: "Reflections", title: "The word before",           body: "…" },
            honest:  { section: "Reflections", title: "Framed photo, hallway",     body: "Nineteen. Stadium jacket. Ana's pencil on the back. You look, and let it be true." },
            dismiss: { section: "Fragments",   title: "Framed photo, turned",      body: "…" } },
          "Photo",
          { kind: "", honest: "Nineteen. You let the photo look back.", dismiss: "" }) },
      { id: "flip", tone: "wrong",   label: "Turn it to the wall.",
        onPick: () => applySeedChoice("hall-photo", "dismiss",
          { kind:    { section: "Reflections", title: "The word before",           body: "…" },
            honest:  { section: "Reflections", title: "Framed photo, hallway",     body: "…" },
            dismiss: { section: "Fragments",   title: "Framed photo, turned",      body: "You turned it toward the wall. The hallway is quieter that way. Slightly." } },
          "Photo",
          { kind: "", honest: "", dismiss: "The photo faces the wall now. The hallway is quieter. Slightly." }) },
    ]);
  };

  const inspectFridgeMagnet = () => {
    setVnLine({
      speaker: "Magnet",
      text: "Appointment · Thursday 2pm · bring the blue folder. A transit note is clipped underneath, still unopened. What now?",
    });
    setVnChoices([
      { id: "open", tone: "kind",    label: "Open the envelope. Read it properly.",
        onPick: () => applySeedChoice("k-magnet", "kind",
          { kind:    { section: "Routines", title: "Route, unfolded",         body: "You opened it. A date, a floor, a bus stop. The unknown got one page smaller." },
            honest:  { section: "Routines", title: "Thursday reminder",       body: "Thursday, 2pm. You touched the magnet. You know what today is. That is a form of showing up." },
            dismiss: { section: "Fragments", title: "Envelope, unopened",     body: "Still clipped, still sealed. It waits in the same place it always waits." } },
          "Magnet",
          { kind:    "Approved. A date. A floor number. The unknown loses a page.",
            honest:  "Thursday. Two o'clock. You know what day it is.",
            dismiss: "" }) },
      { id: "ack",  tone: "neutral", label: "Just touch the magnet. Acknowledge.",
        onPick: () => applySeedChoice("k-magnet", "honest",
          { kind:    { section: "Routines", title: "Route, unfolded",         body: "…" },
            honest:  { section: "Routines", title: "Thursday reminder",       body: "Thursday, 2pm. You touched the magnet. You know what today is. That is a form of showing up." },
            dismiss: { section: "Fragments", title: "Envelope, unopened",     body: "…" } },
          "Magnet",
          { kind: "", honest: "Thursday. Two o'clock. You know what day it is.", dismiss: "" }) },
      { id: "skip", tone: "wrong",   label: "Cover it with the takeout menu.",
        onPick: () => applySeedChoice("k-magnet", "dismiss",
          { kind:    { section: "Routines", title: "Route, unfolded",         body: "…" },
            honest:  { section: "Routines", title: "Thursday reminder",       body: "…" },
            dismiss: { section: "Fragments", title: "Envelope, unopened",     body: "You slid the takeout menu over the magnet. Out of sight is a fragile kind of quiet." } },
          "Magnet",
          { kind: "", honest: "", dismiss: "Takeout menu over the top. Out of sight is a fragile kind of quiet." }) },
    ]);
  };

  const inspectMirrorJournal = () => {
    setVnLine({
      speaker: "Journal",
      text: "Tuesday: word-finding, tired. Wednesday: clear. Thursday: — the entry stops mid-line. Do you finish it?",
    });
    setVnChoices([
      { id: "write", tone: "kind",   label: "Write today's line, honestly.",
        onPick: () => applySeedChoice("b-journal", "kind",
          { kind:    { section: "Reflections", title: "Thursday's line",       body: "You wrote it. 'Thursday: slow start, coffee helps, appointment at 2.' Just a pattern, tracked in your own hand." },
            honest:  { section: "Reflections", title: "Journal, held",         body: "You held the journal. You saw the pattern. You did not fix it. That is enough for now." },
            dismiss: { section: "Fragments",   title: "Journal, shut",         body: "You closed it before finishing the Thursday line. You will remember, or you will not." } },
          "Journal",
          { kind:    "Slow start. Coffee helps. Appointment at 2. Tracked in your own hand.",
            honest:  "You held it. You saw the pattern. You did not fix it.",
            dismiss: "" }) },
      { id: "read",  tone: "neutral", label: "Read the last week without adding.",
        onPick: () => applySeedChoice("b-journal", "honest",
          { kind:    { section: "Reflections", title: "Thursday's line",       body: "…" },
            honest:  { section: "Reflections", title: "Journal, held",         body: "You held the journal. You saw the pattern. You did not fix it. That is enough for now." },
            dismiss: { section: "Fragments",   title: "Journal, shut",         body: "…" } },
          "Journal",
          { kind: "", honest: "You held it. You saw the pattern. You did not fix it.", dismiss: "" }) },
      { id: "shut",  tone: "wrong",   label: "Close it. Not today.",
        onPick: () => applySeedChoice("b-journal", "dismiss",
          { kind:    { section: "Reflections", title: "Thursday's line",       body: "…" },
            honest:  { section: "Reflections", title: "Journal, held",         body: "…" },
            dismiss: { section: "Fragments",   title: "Journal, shut",         body: "You closed it before finishing the Thursday line. You will remember, or you will not." } },
          "Journal",
          { kind: "", honest: "", dismiss: "Closed. Not today. You will remember, or you will not." }) },
    ]);
  };
  const openPhone = () => {
    setCloseup("phone");
    // Unlock screen: drag the six letter tiles into order to spell today's
    // name. Wrong reads still let you through eventually, but leave a mark.
    startMini({
      kind: "unscramble",
      title: "Phone · unlock",
      hint: "Six tiles. Slide them until the word feels right — today's name.",
      unscramble: { word: "THURSDAY", caption: "The hint on the lock screen: today." },
      onMisstep: () => misstep({ speaker: "Phone", text: "Wrong word. The screen shivers, then waits." }),
      onDone: () => {
        setMini(null);
        remember({ section: "Fragments", title: "The lock word", body: "THURSDAY. You almost missed the day. The phone opens." });
        setVnLine({ speaker: "Phone", text: "The screen wakes. A message is half-typed, from you to someone who is waiting." });
        setVnChoices([
          { id: "send",   label: "Send: \"I'm slow this morning. On my way.\"",   onPick: phoneSend, tone: "kind" },
          { id: "later",  label: "Put the phone down for now.",                    onPick: phoneLater, tone: "neutral" },
          { id: "ignore", label: "Delete it. She'll figure it out.",               onPick: phoneIgnore, tone: "wrong" },
        ]);
      },
      onCancel: () => { setMini(null); setCloseup(null); say("Phone", "You put it face-down. The word is still there, waiting."); },
    });
  };
  const phoneSend = () => {
    markDone("phone");
    setPacked(p => ({ ...p, phone: true }));
    remember({ section: "Messages", title: "Sent to Ana", body: "\"I'm slow this morning. On my way.\" — delivered." });
    unlockHallwayFromPhone("The sentence is still hard, but the morning has heard you.");
  };
  const phoneLater = () => {
    markDone("phone");
    setPacked(p => ({ ...p, phone: true }));
    remember({ section: "Reflections", title: "Put it down", body: "The message can wait a minute longer. The morning still moved." });
    unlockHallwayFromPhone("You set it down. The hallway is waiting.");
  };
  const phoneIgnore = () => {
    markDone("phone");
    setPacked(p => ({ ...p, phone: true }));
    misstep({ speaker: "Phone", text: "Deleted. The room dims a shade. Something small tilts out of place." });
    setWrongCount(w => Math.min(6, w + 1));
    setTimeout(() => unlockHallwayFromPhone("You leave the room without answering. The hallway feels further than it is."), 1200);
  };
  const unlockHallwayFromPhone = (line: string) => {
    setUnlocked(prev => {
      const n = new Set(prev);
      n.add("hallway"); n.add("kitchen"); n.add("bathroom");
      return n;
    });
    setCloseup(null);
    setVnLine({ speaker: "Morning", text: line });
    setVnChoices([
      { id: "hall", label: "Step into the Hallway.", onPick: () => gotoRoom("hallway") },
      { id: "stay", label: "Stay in the bedroom a moment.", onPick: () => say("Bedroom", "The light shifts a little. You can leave when you're ready.") },
    ]);
  };

  /* ---------------------- hallway interactions -------------------- */

  const inspectCoat = () => {
    markDone("coat");
    remember({ section: "Fragments", title: "Coat on the hook", body: "The sleeve remembers the shape of an arm." });
    say("Coat", "It's where it always is. That helps.");
  };
  const inspectKeys = () => {
    startInteraction({
      kind: "drag",
      title: "The keys",
      hint: "Where do they belong before the door?",
      item: "House keys · 2 on the ring",
      retryOnWrong: true,
      onMisstep: () => misstep({ speaker: "Keys", text: "Loose in a pocket, they'll ride down between coins. Try somewhere they'll stay with you." }),
      targets: [
        { id: "bag",    label: "Into the bag",         tone: "correct" },
        { id: "bowl",   label: "Back in the bowl",     tone: "neutral" },
        { id: "pocket", label: "Loose in a pocket",    tone: "wrong" },
      ],
      onPick: (id, tone) => {
        setInteraction(null);
        logInter("keys:" + id);
        markDone("keys");
        if (id === "bag") {
          setPacked(p => ({ ...p, keys: true, bag: true }));
          remember({ section: "Routines", title: "Keys packed", body: "Two on the ring, zipped into the bag. They'll travel together." });
          say("Keys", "Zipped in with the bag. Both there.");
        } else {
          remember({ section: "Routines", title: "Keys, checked", body: "Two on the ring, back in the bowl. You'll double-check at the door." });
          say("Keys", "In the bowl, where they always are. Double-check at the door.");
        }
        void tone;
      },
      onCancel: () => { setInteraction(null); say("Keys", "You set them down again. They aren't going anywhere."); },
    });
  };

  const inspectMail = () => {
    // The card in the bowl was torn along old creases. Reassemble the
    // four quadrants to make out the handwriting.
    startMini({
      kind: "slide",
      title: "The card in the bowl",
      hint: "Four pieces. Drag them into the right corners.",
      slide: { image: "postcard", caption: "A card in handwriting you almost place." },
      onMisstep: () => misstep({ speaker: "Post", text: "The pieces don't quite meet. Try another arrangement." }),
      onDone: () => {
        setMini(null);
        markDone("mail");
        remember({ section: "Messages", title: "Yesterday's card, reassembled", body: "Ana's handwriting: 'Warmth to you today. Small things count. — A.' You almost placed her before you saw the initial." });
        say("Post", "Warmth to you today. — A.");
      },
      onCancel: () => {
        setMini(null);
        markDone("mail");
        remember({ section: "Fragments", title: "Yesterday's post, unopened", body: "A bill, a flyer, a torn card you didn't quite piece together." });
        say("Post", "Nothing urgent. Nothing to open now.");
      },
    });
  };
  const openFrontDoorChoices = () => {
    setVnLine({ speaker: "Front Door", text: "Keys. Coat. Phone. Or close enough. The door is still willing." });
    setVnChoices([
      {
        id: "go",
        label: "Turn the knob and open the door.",
        tone: "kind",
        onPick: () => {
          setVnChoices([]);
          startMini({
            kind: "combo",
            title: "The deadbolt",
            hint: "Three dials. The numbers pencilled inside the frame read 4 · 7 · 3.",
            combo: [4, 7, 3],
            onMisstep: () => misstep({ speaker: "Deadbolt", text: "The dial clicks past. Something's off — check the numbers again." }),
            onDone: () => {
              setMini(null);
              startMini({
                kind: "knob",
                title: "Open the door",
                hint: "Press and hold, then turn the knob a full quarter.",
                onDone: () => { setMini(null); resolveEnding("leave"); },
                onCancel: () => { setMini(null); say("Front Door", "Your hand slips off. Try again when you're ready."); },
              });
            },
            onCancel: () => { setMini(null); say("Deadbolt", "You let go of the dials. The bolt stays home."); },
          });
        },
      },
      {
        id: "smaller",
        label: "Make the morning smaller. One errand, then home.",
        tone: "neutral",
        onPick: () => resolveEnding("smaller"),
      },
      {
        id: "support",
        label: "Message Ana before stepping through.",
        tone: "kind",
        onPick: () => {
          setSupportCueUseCount(n => n + 1);
          resolveEnding("support");
        },
      },
      { id: "wait", label: "Wait a moment longer.", onPick: () => say("Hallway", "The door isn't going anywhere.") },
    ]);
  };

  const inspectFrontDoor = () => {
    if (!frontDoorUnlocked) {
      say("Front Door", "Not yet — you'd walk out empty. Warm something in the kitchen and wash up in the bathroom first.");
      return;
    }
    /* Memory-book gate: the door will not open on someone who hasn't
       actually held any of the morning. This turns the book from a
       collectible into a required tool — you have to have paid
       attention to the objects you found. */
    const MIN_MEMORIES = 8;
    if (memory.length < MIN_MEMORIES) {
      misstep({
        speaker: "Front Door",
        text: `You'd forget the morning the moment it closed behind you. Open the Memory Book (M) and hold what you've found so far — you've kept ${memory.length} of ${MIN_MEMORIES}. Revisit a room and notice one more thing.`,
      });
      setShowBook(true);
      return;
    }

    /* Recall check: pull real entries the player wrote down and mix in
       one plausible decoy that was never seen. */
    const kept = memory.slice(-6);
    const decoyPool = [
      "Neighbour's dog in the hallway",
      "Voicemail from the pharmacy",
      "Broken tile by the tap",
      "A shopping receipt on the counter",
      "Ana's voice on the intercom",
      "A missed call from Mum",
    ];
    const decoy = decoyPool[Math.floor(Math.random() * decoyPool.length)];
    const recallOptions = [
      ...kept.map(m => ({ id: `k:${m.title}`, label: m.title, correct: true })),
      { id: `d:${decoy}`, label: decoy, correct: false },
    ]
      // shuffle so the fake isn't always last
      .map(o => ({ o, r: Math.random() }))
      .sort((a, b) => a.r - b.r)
      .map(x => x.o);

    startInteraction({
      kind: "checklist",
      title: "Before you go — what do you actually remember?",
      hint: "Tick only the things you kept in the Memory Book this morning. One of these was never real. Guessing counts against you.",
      options: recallOptions,
      onMisstep: () => misstep({ speaker: "Front Door", text: "That one wasn't yours. The morning isn't quite gathered." }),
      onDone: (picked, _allCorrect, wrongPicks) => {
        setInteraction(null);
        logInter("door-recall:" + picked.length + "/" + wrongPicks);
        /* Now the physical readiness check — same as before. */
        const readiness: { id: string; label: string; correct: boolean }[] = [
          { id: "keys",  label: "Keys",  correct: packed.keys },
          { id: "phone", label: "Phone", correct: done.has("phone") },
          { id: "bag",   label: "Bag",   correct: packed.bag },
        ];
        if (done.has("k-kettle")) readiness.push({ id: "kettle", label: "Kettle switched off", correct: true });
        if (interactionOrder.includes("note:door")) readiness.push({ id: "note", label: "The note by the door", correct: true });
        if (done.has("b-meds")) readiness.push({ id: "meds", label: "Organizer checked", correct: true });
        readiness.push({ id: "wallet", label: "Wallet — you never touched it this morning", correct: false });

        setTimeout(() => startInteraction({
          kind: "checklist",
          title: "Readiness — what comes with you?",
          hint: "Only check things you actually have on you. Guessing extras counts against a clean morning.",
          options: readiness,
          onMisstep: () => misstep({ speaker: "Front Door", text: "You pat your pockets. Something you named isn't there." }),
          onDone: (picked2, _all2, wrong2) => {
            setInteraction(null);
            logInter("door-ready:" + picked2.length + "/" + wrong2);
            if (picked2.length === 0) {
              misstep({ speaker: "Front Door", text: "Nothing checked. You'd step out carrying only your hands." });
            }
            setTimeout(openFrontDoorChoices, 400);
          },
          onCancel: () => { setInteraction(null); say("Front Door", "You step back from it. There's still time."); },
        }), 400);
      },
      onCancel: () => { setInteraction(null); say("Front Door", "You step back. Not everything is held yet."); },
    });
  };

  /* ---------------------- kitchen interactions -------------------- */

  const inspectFridge = () => {
    /* Visual sort — you actually see what's on the shelf and drag each item
       into "It's there" or "Not there". No imagined contents; everything
       the interaction names is shown as a card you can look at. */
    startInteraction({
      kind: "checklist",
      title: "The fridge — sort what's actually on the shelf",
      hint: "Look inside first. Then drag each card into 'It's there' or 'Not there'. 28 seconds — before the door drifts shut and the cold escapes.",
      timeLimit: 28000,
      preview: {
        title: "You open the fridge:",
        items: [
          { label: "Carton of milk",   emoji: "🥛" },
          { label: "Half a lemon",     emoji: "🍋" },
          { label: "Sunday's note",    emoji: "📝" },
        ],
      },
      options: [
        { id: "milk",       label: "A carton of milk",         correct: true  },
        { id: "lemon",      label: "Half a lemon",             correct: true  },
        { id: "sunote",     label: "Sunday-you's note",        correct: true  },
        { id: "leftovers",  label: "Someone else's leftovers", correct: false },
        { id: "eggs",       label: "A dozen eggs",             correct: false },
        { id: "wine",       label: "An open bottle of wine",   correct: false },
      ],
      onMisstep: () => misstep({ speaker: "Fridge", text: "That doesn't match what's on the shelf. Look again." }),
      onDone: (picked, allCorrect, wrongPicks) => {
        setInteraction(null);
        logInter("fridge:" + picked.length + "/" + wrongPicks);
        markDone("k-fridge");
        if (wrongPicks > 0) {
          remember({ section: "Routines", title: "Fridge, misremembered", body: "You reached for things that weren't there. The shelf holds less than you thought." });
        } else {
          remember({ section: "Routines", title: "Fridge, opened", body: "Milk, half a lemon, a note from a version of you that shopped on Sunday." });
        }
        say("Fridge", allCorrect ? "Only what's there. A kind of clear." : "Something to eat. Something to hold.");
        maybeUnlockFrontDoor();
      },
      onCancel: () => { setInteraction(null); say("Fridge", "You close the door on the cold. Maybe later."); },
    });
  };
  const inspectKettle = () => {
    say("Kettle", "Steam rising. Pour, then sip until the cup is warm in your hand.");
    startMini({
      kind: "sip",
      title: "Drink your tea",
      hint: "Hold to sip. Keep holding until the cup empties.",
      onDone: () => {
        setMini(null);
        markDone("k-kettle");
        remember({ section: "Routines", title: "Tea, sipped slowly", body: "Steam. A small warm sound. The cup empties by degrees and the morning behaves." });
        say("Tea", "Warm. Held. A minute the morning couldn't take.");
        maybeUnlockFrontDoor();
      },
      onCancel: () => { setMini(null); say("Kettle", "You put the cup down half-full. That's fine too."); },
    });
  };
  const inspectToast = () => {
    startInteraction({
      kind: "sequence",
      title: "Make the toast",
      hint: "Drag the steps into the order that will actually work — 22 seconds before the butter cools.",
      timeLimit: 22000,
      items: [
        { id: "bread",   label: "Slice the bread" },
        { id: "toaster", label: "Into the toaster" },
        { id: "butter",  label: "Butter it" },
        { id: "plate",   label: "Onto the plate" },
      ],
      correctOrder: ["bread", "toaster", "butter", "plate"],
      onMisstep: () => misstep({ speaker: "Toast", text: "Out of order. Butter melts crooked. Try again." }),
      onDone: (order, correct) => {
        setInteraction(null);
        logInter("toast:" + (correct ? "ok" : order.join(">")));
        markDone("k-toast");
        if (correct) {
          remember({ section: "Routines", title: "Toast, buttered", body: "Two slices. The knife knows the jar." });
          say("Toast", "Bread. Butter. A small pleasure that keeps.");
        } else {
          remember({ section: "Routines", title: "Toast, out of order", body: "The butter melted crooked. Still edible. Still yours." });
          say("Toast", "The morning bends around it. Still edible, still yours.");
        }
        maybeUnlockFrontDoor();
      },
      onCancel: () => { setInteraction(null); say("Toast", "You leave the bread on the board. Later, maybe."); },
    });
  };

  /* ---------------------- bathroom interactions ------------------- */

  const inspectMirror = () => {
    markDone("b-mirror");
    // Old-demo mirror moment: a painterly reflection panel, then the
    // confidence question. The reflection itself is the memory; the
    // choice below is only how honestly you can name it.
    startMini({
      kind: "reflection",
      title: "The mirror",
      hint: "Look for a moment. There you are — mostly.",
      onDone: () => {
        setMini(null);
        remember({ section: "Reflections", title: "The face in the mirror", body: "Warm brown skin. Curly hair, still slept-in. Cream sleep shirt. Eyes that recognise you back, even on the mornings you don't." });
        const honest: 1 | 2 | 3 = wrongCount <= 1 ? 3 : wrongCount <= 3 ? 2 : 1;
        startInteraction({
          kind: "confidence",
          title: "How clear does the morning feel?",
          hint: "Honestly. Not brave, not small. Just where you are.",
          honestLevel: honest,
          onPick: (level, misaligned) => {
            setInteraction(null);
            setConfidenceChoices(c => [...c, level]);
            logInter("mirror-conf:" + level);
            if (misaligned && level > honest) {
              misstep({ speaker: "Mirror", text: "The mouth in the mirror doesn't quite believe you. That's information too." });
            } else if (misaligned && level < honest) {
              say("Mirror", "Gentler than the morning deserves. You can name a little more.");
            } else {
              say("Mirror", "There you are. Hello. Good morning, you.");
            }
            maybeUnlockFrontDoor();
          },
          onCancel: () => { setInteraction(null); say("Mirror", "You look away. Later, then."); },
        });
      },
      onCancel: () => { setMini(null); say("Mirror", "You turn away without looking. That's a choice too."); },
    });
  };
  const inspectMeds = () => {
    startMini({
      kind: "pairs",
      title: "The weekly pill organiser",
      hint: "Three pills. Three days. Drag each pill to the day it belongs to — the labels are on the caddy.",
      pairs: {
        items: [
          { id: "blue",  label: "Blue oval — morning", emoji: "💊" },
          { id: "white", label: "White round — with food", emoji: "⚪" },
          { id: "amber", label: "Amber capsule — night", emoji: "🟠" },
        ],
        targets: [
          { id: "wed", label: "Wed" },
          { id: "thu", label: "Thu · today" },
          { id: "fri", label: "Fri" },
        ],
        // today is Thursday — only the "today" pairing counts; decoys are the previous/next day
        correctMap: { blue: "thu", white: "thu", amber: "thu" },
      },
      onMisstep: () => misstep({ speaker: "Cabinet", text: "Wrong day. The pill goes back. Look at the label again." }),
      onDone: () => {
        setMini(null);
        logInter("meds:paired");
        markDone("b-meds");
        remember({ section: "Routines", title: "Morning pills", body: "Thursday. Three compartments empty by the time you close the lid." });
        say("Cabinet", "Thursday. Done.");
        maybeUnlockFrontDoor();
      },
      onCancel: () => { setMini(null); say("Cabinet", "You close the lid without choosing. Later."); },
    });
  };

  const inspectTap = () => {
    say("Tap", "Cold water in the basin. Splash — twice, three times.");
    startMini({
      kind: "splash",
      title: "Wash your face",
      hint: "Tap the water where it lands. Four handfuls.",
      onDone: () => {
        setMini(null);
        markDone("b-tap");
        remember({ section: "Routines", title: "Cold water", body: "Two handfuls on the face. The day starts here, if it starts anywhere." });
        say("Tap", "Cold. Then colder. Awake, mostly.");
        maybeUnlockFrontDoor();
      },
      onCancel: () => { setMini(null); say("Tap", "You leave the tap running a beat, then close it."); },
    });
  };
  const inspectTeeth = () => {
    say("Toothbrush", "Bristles, mint. Left side, then right — a small rhythm.");
    startMini({
      kind: "brush",
      title: "Brush your teeth",
      hint: "Alternate ← and → (or tap the arrows). Eight strokes.",
      onDone: () => {
        setMini(null);
        markDone("b-teeth");
        remember({ section: "Routines", title: "Teeth, brushed", body: "Left, right, left. The mint stays on your tongue for a while after." });
        say("Toothbrush", "Rinse. Spit. The mouth remembers itself.");
        maybeUnlockFrontDoor();
      },
      onCancel: () => { setMini(null); say("Toothbrush", "Half a job. Enough for now."); },
    });
  };


  /* ---------------------- ending resolution ----------------------- */

  const resolveEnding = (via: "leave" | "smaller" | "support") => {
    const avgConf = confidenceChoices.length
      ? confidenceChoices.reduce((s, v) => s + v, 0) / confidenceChoices.length
      : 2;
    const score = clarity - dissonance * 2;
    const strained = wrongCount >= 4 || score <= -2 || avgConf <= 1.4;
    const id: EndingId = via === "smaller"
      ? "smaller"
      : via === "support" || strained
        ? "overloaded"
        : "supported";

    const commit = () => { setEnding(id); setScreen("ending"); };
    if (settings.reducedMotion) { commit(); return; }
    setTransition({ to: "frontdoor", from: room, kind: "threshold" });
    if (transitionTimer.current) window.clearTimeout(transitionTimer.current);
    window.setTimeout(commit, 620);
    transitionTimer.current = window.setTimeout(() => setTransition(null), 900);
  };



  /* ---------------------- hotspots per scene ---------------------- */

  const sceneKey: string = closeup ?? room;

  const hotspots: Hotspot[] = useMemo(() => {
    let base: Hotspot[];
    if (closeup === "phone") {
      base = [
        { id: "phone-screen", label: "Phone screen", x: 50, y: 50, w: 32, h: 46, onInspect: () => {} },
      ];
    } else {
      switch (room) {
        case "bedroom":
          base = [
            { id: "curtains", label: "Window & curtains", x: 36, y: 28, onInspect: inspectCurtains },
            { id: "glasses",  label: "Glasses on the sill", x: 48, y: 56, onInspect: inspectGlasses },
            { id: "alarm",    label: "Bedside lamp", x: 92, y: 55, onInspect: inspectAlarm },
            { id: "note",     label: "Note on the bed", x: 62, y: 78, onInspect: inspectNote },
            { id: "phone",    label: "Phone on the nightstand", x: 92, y: 70, onInspect: openPhone },
            { id: "night-book", label: "Library book on the nightstand", x: 84, y: 62, onInspect: inspectNightstandBook },
          ]; break;
        case "hallway":
          base = [
            { id: "coat",      label: "Coat on the hook", x: 90, y: 22, onInspect: inspectCoat },
            { id: "keys",      label: "Keys on the hook", x: 87, y: 32, onInspect: inspectKeys },
            { id: "mail",      label: "Bowl on the side table", x: 14, y: 72, onInspect: inspectMail },
            { id: "hall-photo", label: "Framed photo on the wall", x: 32, y: 26, onInspect: inspectCollegePhoto },
            { id: "frontdoor", label: frontDoorUnlocked ? "Front Door" : "Front Door (not yet)", x: 63, y: 46, onInspect: inspectFrontDoor },
          ]; break;
        case "kitchen":
          base = [
            { id: "k-fridge", label: "Shelves & pantry",  x: 40, y: 34, onInspect: inspectFridge },
            { id: "k-kettle", label: "Kettle on the stove",  x: 15, y: 55, onInspect: inspectKettle },
            { id: "k-toast",  label: "Cutting board", x: 78, y: 68, onInspect: inspectToast },
            { id: "k-magnet", label: "Fridge magnet & clipped letter", x: 46, y: 46, onInspect: inspectFridgeMagnet },
          ]; break;
        case "bathroom":
          base = [
            { id: "b-tap",    label: "Tap",              x: 60, y: 60, onInspect: inspectTap },
            { id: "b-mirror", label: "You, in the mirror", x: 56, y: 22, onInspect: inspectMirror },
            { id: "b-meds",   label: "Shelf jar & bottle", x: 27, y: 28, onInspect: inspectMeds },
            { id: "b-teeth",  label: "Toothbrush by the basin", x: 55, y: 50, onInspect: inspectTeeth },
            { id: "b-journal", label: "Small journal by the sink", x: 74, y: 62, onInspect: inspectMirrorJournal },
          ]; break;
        default: base = [];
      }
    }
    const ov = hotspotOverrides[sceneKey] ?? {};
    return base.map(h => ov[h.id] ? { ...h, x: ov[h.id].x, y: ov[h.id].y } : h);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, closeup, frontDoorUnlocked, hotspotOverrides, sceneKey]);

  const availableExits: RoomId[] = useMemo(
    () => ADJACENCY[room].filter(r => unlocked.has(r)),
    [room, unlocked]
  );

  /* ---------------------- keyboard controls ----------------------- */

  const [focusIdx, setFocusIdx] = useState(0);
  useEffect(() => { setFocusIdx(0); }, [room, closeup]);

  /* Hint cooldown timer */
  useEffect(() => {
    if (hintCooldown <= 0) return;
    const t = window.setInterval(() => setHintCooldown(c => Math.max(0, c - 1)), 1000);
    return () => window.clearInterval(t);
  }, [hintCooldown]);

  /* Suggest a target for the next task (used by 'N' key) */
  const nextTaskId = useMemo(() => {
    if (room === "bedroom" && !done.has("phone")) return "phone";
    if (room === "hallway" && frontDoorUnlocked) return "frontdoor";
    if (room === "kitchen") return KITCHEN_TASKS.find(t => !done.has(t));
    if (room === "bathroom") return BATH_TASKS.find(t => !done.has(t));
    return undefined;
  }, [room, done, frontDoorUnlocked]);

  const requestHint = useCallback(() => {
    if (hintCooldown > 0) {
      setVnLine({ speaker: "Hint", text: `A breath — try again in ${hintCooldown}s.` });
      return;
    }
    setHintPulse(true);
    setHintCooldown(15);
    window.setTimeout(() => setHintPulse(false), 4000);
    const target = nextTaskId ?? (availableExits[0] ? `→ ${ROOM_LABEL[availableExits[0]]}` : "look around");
    setVnLine({ speaker: "Hint", text: `Try: ${target}.` });
  }, [hintCooldown, nextTaskId, availableExits]);

  /* Breathe ritual — hold 'B' to inhale/exhale; each full cycle removes 1 wrongCount/dissonance */
  useEffect(() => {
    if (screen !== "game") return;
    let downAt = 0;
    let phase: "in" | "out" | null = null;
    let raf = 0;
    const cycle = () => {
      if (!phase) return;
      const elapsed = performance.now() - downAt;
      if (phase === "in" && elapsed >= 3600) {
        phase = "out"; downAt = performance.now(); setBreathing("out");
      } else if (phase === "out" && elapsed >= 3600) {
        setWrongCount(w => Math.max(0, w - 1));
        setDissonance(d => Math.max(0, d - 1));
        phase = "in"; downAt = performance.now(); setBreathing("in");
      }
      raf = requestAnimationFrame(cycle);
    };
    const down = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "b" || phase) return;
      if (showHelp || showBook || showSettings || mini) return;
      phase = "in"; downAt = performance.now(); setBreathing("in");
      raf = requestAnimationFrame(cycle);
    };
    const up = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "b") return;
      phase = null; setBreathing(null); cancelAnimationFrame(raf);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      cancelAnimationFrame(raf);
    };
  }, [screen, showHelp, showBook, showSettings, mini]);

  /* Parallax — track mouse over the scene, rAF-throttled. Hold + drag to actively pan. */
  useEffect(() => {
    if (!settings.parallax || settings.reducedMotion || screen !== "game") return;
    const el = sceneRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      parallaxRef.current = {
        x: ((e.clientX - r.left) / r.width - 0.5) * 2,
        y: ((e.clientY - r.top) / r.height - 0.5) * 2,
      };
      if (dragPanRef.current.active) {
        const dx = ((e.clientX - dragPanRef.current.startX) / r.width) * 100;
        const dy = ((e.clientY - dragPanRef.current.startY) / r.height) * 100;
        // Clamp so we can't push the image completely off-frame
        const nx = Math.max(-8, Math.min(8, dragPanRef.current.baseX + dx * 0.6));
        const ny = Math.max(-6, Math.min(6, dragPanRef.current.baseY + dy * 0.5));
        setDragPan({ x: nx, y: ny });
      }
      if (rafParallax.current == null) {
        rafParallax.current = requestAnimationFrame(() => {
          rafParallax.current = null;
          setParallax({ ...parallaxRef.current });
        });
      }
    };
    const onDown = (e: MouseEvent) => {
      // Only left-button drag on the scene backdrop (not on markers/UI)
      if (e.button !== 0) return;
      const target = e.target as HTMLElement | null;
      if (target && target.closest("[data-hotspot], [data-ui]")) return;
      dragPanRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        baseX: dragPan.x,
        baseY: dragPan.y,
      };
      el.style.cursor = "grabbing";
    };
    const onUp = () => {
      if (!dragPanRef.current.active) return;
      dragPanRef.current.active = false;
      el.style.cursor = "";
      // Ease back toward center so the room settles
      setDragPan(p => ({ x: p.x * 0.4, y: p.y * 0.4 }));
      window.setTimeout(() => setDragPan({ x: 0, y: 0 }), 260);
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      if (rafParallax.current) cancelAnimationFrame(rafParallax.current);
      rafParallax.current = null;
    };
  }, [settings.parallax, settings.reducedMotion, screen, room, closeup, dragPan.x, dragPan.y]);

  useEffect(() => {

    if (screen !== "game") return;
    const totalTargets = hotspots.length + availableExits.length;

    const onKey = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return;
      const k = e.key.toLowerCase();
      if (k === "escape" || k === "backspace") {
        if (mini) { mini.onCancel?.(); return; }
        if (interaction) { interaction.onCancel?.(); return; }
        if (showHelp) { setShowHelp(false); return; }
        if (showBook) { setShowBook(false); return; }
        if (showSettings) { setShowSettings(false); return; }
        if (closeup) { setCloseup(null); setVnChoices([]); return; }
        return;
      }
      if (k === "h") { setShowHelp(v => !v); return; }
      if (k === "m") { setShowBook(v => !v); return; }
      if (k === ",") { setShowSettings(v => !v); return; }
      if (k === "r") { restartDemo(); return; }
      if (k === "n") { requestHint(); return; }
      if (e.key === "`" || e.key === "~") { setSettings(s => ({ ...s, debugHotspots: !s.debugHotspots })); return; }

      if (mini || interaction || showHelp || showBook || showSettings) return;
      if (vnChoices.length > 0) {
        if (k === "arrowdown" || k === "arrowright" || k === "s" || k === "d") {
          e.preventDefault();
          setFocusIdx(i => (i + 1) % vnChoices.length);
        } else if (k === "arrowup" || k === "arrowleft" || k === "w" || k === "a") {
          e.preventDefault();
          setFocusIdx(i => (i - 1 + vnChoices.length) % vnChoices.length);
        } else if (k === "enter" || k === " ") {
          e.preventDefault();
          vnChoices[focusIdx]?.onPick();
        }
        return;
      }
      if (k === "arrowright" || k === "d" || k === "arrowdown" || k === "s") {
        e.preventDefault();
        setFocusIdx(i => (i + 1) % Math.max(1, totalTargets));
      } else if (k === "arrowleft" || k === "a" || k === "arrowup" || k === "w") {
        e.preventDefault();
        setFocusIdx(i => (i - 1 + Math.max(1, totalTargets)) % Math.max(1, totalTargets));
      } else if (k === "enter" || k === " ") {
        e.preventDefault();
        if (focusIdx < hotspots.length) hotspots[focusIdx]?.onInspect();
        else {
          const exit = availableExits[focusIdx - hotspots.length];
          if (exit) gotoRoom(exit);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, hotspots, availableExits, vnChoices, focusIdx, closeup, showHelp, showBook, showSettings, mini, interaction, gotoRoom, requestHint, restartDemo]);

  /* ---------------------- soft hint if stuck ---------------------- */
  useEffect(() => {
    if (screen !== "game" || room !== "bedroom" || done.has("phone")) return;
    const t = window.setTimeout(() => {
      if (!done.has("phone")) {
        setHintPulse(true);
        setVnLine(v => v ?? { speaker: "Hint", text: "The phone can make the hallway available." });
      }
    }, 45000);
    return () => window.clearTimeout(t);
  }, [screen, room, done]);

  useEffect(() => {
    if (tutorialActive && frontDoorUnlocked) setTutorialActive(false);
  }, [tutorialActive, frontDoorUnlocked]);

  /* Drag-to-remap hotspots in debug mode */
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const el = sceneRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100));
      setHotspotOverrides(prev => ({
        ...prev,
        [dragging.scene]: { ...(prev[dragging.scene] ?? {}), [dragging.id]: { x, y } },
      }));
    };
    const onUp = () => setDragging(null);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [dragging]);

  const resetOverridesForScene = useCallback(() => {
    setHotspotOverrides(prev => { const n = { ...prev }; delete n[sceneKey]; return n; });
  }, [sceneKey]);
  const copyOverrides = useCallback(() => {
    try { navigator.clipboard.writeText(JSON.stringify(hotspotOverrides, null, 2)); } catch { /* Clipboard access is optional debug behavior. */ }
  }, [hotspotOverrides]);

  /* ================================================================ */
  /* Render                                                            */
  /* ================================================================ */

  if (screen === "title") {
    return <TitleScreen hasSave={hasSave} onBegin={beginNew} onContinue={continueSave} onHelp={() => setShowHelp(true)} showHelp={showHelp} closeHelp={() => setShowHelp(false)} />;
  }
  if (screen === "ending" && ending) {
    return <EndingScreen id={ending} memory={memory} wrongCount={wrongCount} roomVisitOrder={roomVisitOrder} confidenceChoices={confidenceChoices} packed={packed} clarity={clarity} dissonance={dissonance} supportCueUseCount={supportCueUseCount} interactionOrder={interactionOrder} onRestart={restartDemo} />;
  }

  const sceneImg = SCENE_IMG[closeup ?? room];

  /* ---------------------- guided walkthrough ---------------------- */
  const tutorialStep: null | { room: RoomId; hotspotId?: string; doorwayTo?: RoomId; prompt: string } = (() => {
    if (!tutorialActive) return null;
    if (!done.has("glasses"))          return { room: "bedroom", hotspotId: "glasses", prompt: "Your glasses are on the sill — the room needs edges before you can trust it." };
    if (!done.has("note"))             return { room: "bedroom", hotspotId: "note",    prompt: "There's a note by the bed in your own handwriting. Read it." };
    if (!done.has("phone"))            return { room: "bedroom", hotspotId: "phone",   prompt: "Ana is waiting on a message. Pick up the phone." };
    if (room === "bedroom")            return { room: "bedroom", doorwayTo: "hallway", prompt: "Step into the hallway — the day is on the other side of the door." };
    if (kitchenCount < KITCHEN_MIN && room === "hallway") return { room: "hallway", doorwayTo: "kitchen", prompt: "Head to the kitchen. Something warm first." };
    if (kitchenCount < KITCHEN_MIN && room === "kitchen") return { room: "kitchen", hotspotId: "k-kettle", prompt: `Two small kitchen things (${kitchenCount}/${KITCHEN_MIN}). Kettle, fridge, toast — pick any two.` };
    if (bathCount < BATH_MIN && room === "kitchen") return { room: "kitchen", doorwayTo: "hallway", prompt: "Back to the hallway, then across to the bathroom." };
    if (bathCount < BATH_MIN && room === "hallway") return { room: "hallway", doorwayTo: "bathroom", prompt: "The bathroom now — meet the mirror before you leave." };
    if (bathCount < BATH_MIN && room === "bathroom") return { room: "bathroom", hotspotId: "b-mirror", prompt: `Two small bathroom things (${bathCount}/${BATH_MIN}). Mirror, meds, tap, toothbrush — pick any two.` };
    if (frontDoorUnlocked && room !== "hallway") return { room, doorwayTo: "hallway", prompt: "Back to the hallway. The front door is ready for you." };
    if (frontDoorUnlocked && room === "hallway") return { room: "hallway", hotspotId: "frontdoor", prompt: "You have what you need. The front door." };
    return null;
  })();
  const pulseId = tutorialStep?.hotspotId;

  /* Progressive clarity — the further along the player is, the more the world
     comes into focus and saturation. Wrong choices still smear it back. */
  const progress = Math.min(1, done.size / TOTAL_TASKS);
  const rawBlur = Math.min(6, wrongCount * 1.3);
  const rawDesat = Math.max(0.55, 1 - wrongCount * 0.09);
  /* Baseline 0.6px blur simulates slightly-below-average acuity (~20/40) even
     at full progress — the world never becomes hyper-sharp. */
  const blurPx = 0.6 + Math.max(0, rawBlur * (1 - progress * 0.75));
  const desat  = Math.min(1.1, rawDesat + progress * 0.4);
  const warmth = progress; // 0 → 1 warm color wash near the end

  /* Distortion driven by dissonance — chromatic aberration + subtle screen tear */
  const aber = Math.min(0.7, dissonance * 0.15);
  const tear = Math.min(0.55, Math.max(0, dissonance - 2) * 0.2);

  const px = settings.parallax && !settings.reducedMotion ? parallax : { x: 0, y: 0 };

  return (
    <div data-testid="game-screen" data-room={room} className={`fixed inset-0 bg-black text-foreground select-none overflow-hidden cursor-open ${settings.dyslexiaFont ? "dyslexia-font" : ""}`}>
      {/* Full-bleed scene (ref used for hotspot drag coordinate mapping) */}
      <div ref={sceneRef} className="absolute inset-0">
        <img
          src={sceneImg}
          alt={closeup === "phone" ? "Phone close-up" : ROOM_LABEL[room]}
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            animation: settings.reducedMotion ? undefined : "drift 24s ease-in-out infinite",
            filter: `blur(${blurPx}px) saturate(${desat.toFixed(2)}) brightness(${(0.42 + progress * 0.6).toFixed(3)})`,
            transition: dragPanRef.current.active
              ? "filter 700ms ease-out"
              : "filter 700ms ease-out, transform 380ms ease-out",
            transform: `scale(1.08) translate(${(-px.x * 1.2 + dragPan.x).toFixed(2)}%, ${(-px.y * 0.8 + dragPan.y).toFixed(2)}%)`,
            willChange: "transform, filter",
          }}
          draggable={false}
        />
        <div className="ink-drips absolute inset-0" style={{ opacity: room === "bedroom" ? 0.7 : 1 }} />
        {room === "bedroom" && !closeup && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 42% 34% at 74% 26%, oklch(0.85 0.10 78 / 10%), transparent 78%)",
              mixBlendMode: "soft-light",
            }}
          />
        )}
        {settings.foliage > 0 && (
          <div
            className="ghibli-foliage ghibli-foliage-sway absolute inset-0 pointer-events-none"
            style={{
              opacity: settings.foliage,
              transform: `translate(${(-px.x * 0.3).toFixed(2)}%, ${(-px.y * 0.2).toFixed(2)}%)`,
            }}
          />
        )}
        {/* Progressive warm color wash — grows as the player nears the end */}
        {warmth > 0 && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 80% 60% at 50% 55%, oklch(0.78 0.12 70 / 22%), transparent 75%), linear-gradient(180deg, oklch(0.55 0.10 145 / 8%), oklch(0.70 0.09 60 / 10%))",
              opacity: warmth,
              mixBlendMode: "soft-light",
              transition: "opacity 900ms ease-out",
            }}
          />
        )}
        {/* Dust motes drifting through the room */}
        {!settings.reducedMotion && !closeup && <div className="dust-motes" />}
        {/* Kettle steam plume */}
        {room === "kitchen" && !closeup && (
          <>
            <div className="steam-plume" style={{ left: "17%", top: "44%" }} />
            <div className="ambient-curtain" style={{ left: "42%", top: "18%", width: "18%", height: "34%" }} />
          </>
        )}
        {/* Bedroom curtain billow + window light shimmer */}
        {room === "bedroom" && !closeup && !settings.reducedMotion && (
          <>
            <div className="ambient-curtain" style={{ left: "18%", top: "10%", width: "22%", height: "48%" }} />
            <div className="ambient-curtain ambient-curtain-delay" style={{ left: "36%", top: "12%", width: "18%", height: "44%" }} />
            <div className="ambient-light-shaft" style={{ left: "20%", top: "8%", width: "38%", height: "70%" }} />
          </>
        )}
        {/* Hallway: front-door light breathes, hanging plant sways */}
        {room === "hallway" && !closeup && !settings.reducedMotion && (
          <>
            <div className="ambient-door-glow" style={{ left: "58%", top: "22%", width: "18%", height: "38%" }} />
            <div className="ambient-sway" style={{ left: "8%", top: "6%", width: "14%", height: "22%" }} />
            <div className="ambient-sway ambient-sway-delay" style={{ right: "6%", top: "8%", width: "14%", height: "22%" }} />
          </>
        )}
        {/* Bathroom: window shimmer + fern sway */}
        {room === "bathroom" && !closeup && !settings.reducedMotion && (
          <>
            <div className="ambient-light-shaft" style={{ left: "2%", top: "6%", width: "26%", height: "60%" }} />
            <div className="ambient-sway" style={{ left: "0%", bottom: "10%", width: "16%", height: "36%" }} />
          </>
        )}
        {settings.grain > 0 && <div className="film-grain" style={{ opacity: 0.18 * settings.grain * (1 - progress * 0.5) }} />}
        {/* Chromatic aberration + screen tear on dissonance */}
        <div className="chromatic-aberration" style={{ ["--aber" as string]: aber }} />
        <div className="screen-tear" style={{ ["--tear" as string]: tear }} />
        <div className="pointer-events-none absolute inset-0 vision-mask" />
        <div className="pointer-events-none absolute inset-0 ink-vignette" />
      </div>


      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 z-40 flex items-center justify-between px-4 py-2 bg-black/50 backdrop-blur-sm border-b border-white/10">
        <div className="font-serif text-sm opacity-80">
          Soft Recall · <span className="opacity-70">{ROOM_LABEL[room]}</span>
          {wrongCount > 0 && <span className="ml-3 text-[11px] text-rose-300/80 italic">the morning feels blurred</span>}
        </div>
        <div className="flex gap-2 text-xs">
          <TopBtn onClick={() => setShowBook(v => !v)} label="Memory Book" hint="M" testId="memory-book-button" />
          
          <TopBtn onClick={() => setShowHelp(v => !v)} label="Help" hint="H" />
          <TopBtn onClick={() => setShowSettings(v => !v)} label="Settings" hint="," />
        </div>
      </div>

      {/* Tutorial banner */}
      {tutorialStep && (
        <div className="absolute top-11 left-1/2 -translate-x-1/2 z-30 max-w-2xl w-[min(92%,720px)]">
          <div className="flex items-start gap-3 rounded-md border border-[color:var(--color-glow)]/40 bg-black/70 px-3 py-2 text-sm shadow-lg">
            <span className="font-hand text-[color:var(--color-glow)] text-base leading-none pt-0.5">guide</span>
            <span className="font-serif opacity-90 leading-snug">{tutorialStep.prompt}</span>
            <button
              onClick={() => setTutorialActive(false)}
              className="ml-auto text-[11px] opacity-60 hover:opacity-100 underline underline-offset-2"
              title="Turn off the guide"
            >
              I've got it
            </button>
          </div>
        </div>
      )}

      {/* Memory toast */}
      {toast && (
        <div key={toast.id} className="absolute right-4 top-14 z-40 max-w-xs animate-[fade-in_0.4s_ease-out] rounded border border-[color:var(--color-glow)]/40 bg-black/75 backdrop-blur px-3 py-2 shadow-lg">
          <div className="font-hand text-xs text-[color:var(--color-glow)]/90">+ Memory Book · {toast.section}</div>
          <div className="font-serif text-sm mt-0.5">{toast.title}</div>
          <button onClick={() => { setShowBook(true); setToast(null); }} className="mt-1 text-[11px] opacity-70 hover:opacity-100 underline underline-offset-2">Open (M)</button>
        </div>
      )}

      {/* Hotspot layer */}
      <div className="pointer-events-none absolute inset-0 z-30">
        {hotspots.map((h, i) => {
          const isDone = done.has(h.id);
          return (
            <HotspotMarker
              key={h.id}
              hotspot={h}
              scale={settings.markerScale}
              focused={focusIdx === i}
              done={isDone}
              pulse={pulseId === h.id || (hintPulse && (h.id === nextTaskId || h.id === "phone"))}
              debug={settings.debugHotspots}
              onInspect={h.onInspect}
              onDebugMouseDown={(e) => { e.preventDefault(); setDragging({ scene: sceneKey, id: h.id }); }}
              onHoverThought={isDone ? (() => {
                const pool = REVISIT_THOUGHTS[h.id];
                if (!pool || pool.length === 0) return;
                setThought({ id: h.id, text: pool[Math.floor(Math.random() * pool.length)] });
              }) : undefined}
              onLeaveThought={() => setThought(t => (t && t.id === h.id ? null : t))}
            />
          );
        })}
        {thought && (
          <div className="pointer-events-none absolute left-1/2 top-20 -translate-x-1/2 z-30 rounded bg-black/70 backdrop-blur px-3 py-1 text-sm italic font-serif text-[color:var(--color-glow)]/90 animate-[fade-in_0.3s_ease-out]">
            {thought.text}
          </div>
        )}

        {settings.debugHotspots && (
          <div className="pointer-events-auto absolute top-14 left-3 z-40 rounded border border-emerald-400/60 bg-black/80 px-3 py-2 text-xs text-emerald-200 font-mono max-w-xs">
            <div className="flex items-center gap-2">
              <span className="font-serif not-italic">Hotspot debug ({sceneKey})</span>
              <span className="opacity-60">[~]</span>
            </div>
            <div className="mt-1 opacity-80">Drag any marker to remap. Overrides saved to localStorage.</div>
            <div className="mt-2 flex gap-2">
              <button onClick={copyOverrides} className="rounded bg-emerald-500/20 px-2 py-0.5 hover:bg-emerald-500/40">Copy JSON</button>
              <button onClick={resetOverridesForScene} className="rounded bg-rose-500/20 px-2 py-0.5 hover:bg-rose-500/40">Reset scene</button>
              <button onClick={() => setHotspotOverrides({})} className="rounded bg-rose-500/20 px-2 py-0.5 hover:bg-rose-500/40">Reset all</button>
            </div>
          </div>
        )}
      </div>


      {/* Close-up back button */}
      {closeup && (
        <button
          onClick={() => { setCloseup(null); setVnChoices([]); }}
          className="absolute left-3 top-12 z-30 rounded bg-black/70 px-3 py-1 text-xs text-white hover:bg-black/90"
        >
          ← Back to room (Esc)
        </button>
      )}

      {/* Bottom UI stack: doorways + VN + mini map */}
      <div className="absolute inset-x-0 bottom-0 z-20 px-3 pb-3 pt-2 bg-gradient-to-t from-black/85 via-black/60 to-transparent">
        <div className="mx-auto max-w-5xl">
          {/* Doorways */}
          {!closeup && (
            <div className="mb-2 flex flex-wrap items-center gap-2 rounded-md border border-white/10 bg-black/55 px-3 py-2 text-sm">
              <span className="font-hand text-base opacity-70 mr-2">Doorways —</span>
              {availableExits.length === 0 ? (
                <span className="opacity-60 italic">No exits yet. Look around.</span>
              ) : availableExits.map((r, i) => (
                <button
                  key={r}
                  onClick={() => gotoRoom(r)}
                  data-testid={`doorway-${r}`}
                  aria-current={room === r ? "location" : undefined}
                  className={`choice-btn rounded px-3 py-1 text-sm hover:brightness-110 ${
                    focusIdx === hotspots.length + i ? "ring-2 ring-[color:var(--color-glow)]" : ""
                  } ${tutorialStep?.doorwayTo === r ? `ring-2 ring-[color:var(--color-glow)] ${settings.reducedMotion ? "" : "animate-[pulse-soft_1.6s_ease-in-out_infinite]"}` : ""}`}
                >
                  → {ROOM_LABEL[r]} {visited.has(r) ? "" : <span className="opacity-60 text-[11px]">(new)</span>}
                </button>
              ))}
              {room === "hallway" && !frontDoorUnlocked && (
                <span className="ml-auto text-xs opacity-60 italic">
                  Kitchen {kitchenCount}/{KITCHEN_MIN} · Bathroom {bathCount}/{BATH_MIN}
                </span>
              )}
            </div>
          )}

          {/* VN panel */}
          <div className="vn-panel rounded-md px-4 py-3 min-h-[110px]" style={{ fontSize: `${settings.subtitleScale}em` }}>
            {vnLine ? (
              <div>
                <div className="font-hand text-[color:var(--color-glow)] text-lg leading-none">{vnLine.speaker}</div>
                <div className="mt-1 font-serif text-[15px] leading-snug">{vnLine.text}</div>
              </div>
            ) : (
              <div className="opacity-60 italic text-sm">Click a glowing object, or use a Doorway.</div>

            )}
            {vnChoices.length > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                {vnChoices.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={c.onPick}
                    data-testid={`choice-${c.id}`}
                    className={`choice-btn rounded px-3 py-2 text-left text-sm ${
                      focusIdx === i ? "ring-2 ring-[color:var(--color-glow)]" : ""
                    } ${c.tone === "wrong" ? "opacity-80" : ""}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mini map */}
          <MiniMap current={room} visited={visited} unlocked={unlocked} onJump={(r) => availableExits.includes(r) && gotoRoom(r)} />
        </div>
      </div>

      {transition && (
        (() => {
          const TINT: Record<RoomId | "frontdoor", string> = {
            bedroom:  "radial-gradient(ellipse 60% 90% at 50% 55%, rgba(255,205,140,0.95), rgba(180,120,70,0.3) 60%, rgba(0,0,0,0) 78%)",
            hallway:  "radial-gradient(ellipse 60% 90% at 50% 55%, rgba(230,220,200,0.9),  rgba(120,110,100,0.3) 60%, rgba(0,0,0,0) 78%)",
            kitchen:  "radial-gradient(ellipse 60% 90% at 50% 55%, rgba(255,220,150,1),    rgba(200,140,80,0.35) 60%, rgba(0,0,0,0) 78%)",
            bathroom: "radial-gradient(ellipse 60% 90% at 50% 55%, rgba(220,235,255,0.95), rgba(140,170,200,0.3) 60%, rgba(0,0,0,0) 78%)",
            frontdoor:"radial-gradient(ellipse 70% 100% at 50% 50%, rgba(255,240,200,1),   rgba(255,210,150,0.5) 55%, rgba(0,0,0,0) 82%)",
          };
          const isThresh = transition.kind === "threshold";
          return (
            <div className="pointer-events-none absolute inset-0 z-50" aria-hidden>
              <div
                className="absolute inset-0 bg-black"
                style={{ animation: `room-swap ${isThresh ? 880 : 700}ms ease-in-out forwards` }}
              />
              <div
                className="absolute left-1/2 top-1/2"
                style={{
                  width: "120%", height: "140%",
                  background: TINT[transition.to],
                  mixBlendMode: "screen",
                  animation: `doorway-open ${isThresh ? 860 : 680}ms cubic-bezier(.2,.7,.2,1) forwards`,
                }}
              />
              {isThresh && (
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(180deg, rgba(255,240,200,0.0), rgba(255,240,200,0.35) 50%, rgba(255,240,200,0.0))",
                    animation: "threshold-flare 880ms ease-out forwards",
                    mixBlendMode: "screen",
                  }}
                />
              )}
            </div>
          );
        })()
      )}

      {showBook && <MemoryBook memory={memory} onClose={() => setShowBook(false)} />}

      
      {showHelp && <HelpOverlay onClose={() => setShowHelp(false)} onRestart={restartDemo} />}
      {showSettings && <SettingsOverlay settings={settings} onChange={setSettings} onClose={() => setShowSettings(false)} onRestart={restartDemo} />}
      {mini && <MiniGameOverlay spec={mini} />}
      {interaction && <InteractionOverlay spec={interaction} confusionLevel={wrongCount} />}

      {!onboarded && <OnboardingOverlay onDone={finishOnboarding} />}
      {breathing && <BreatheOverlay phase={breathing} />}
      {dissonance >= 2 && !breathing && (
        <div className="absolute left-1/2 bottom-[calc(100%-70px)] -translate-x-1/2 z-30 pointer-events-none text-[11px] text-rose-200/80 italic animate-[fade-in_0.4s_ease-out]" style={{ top: 44 }}>
          hold <kbd className="not-italic px-1 rounded bg-white/10">B</kbd> to breathe · steady the room
        </div>
      )}
      {hintCooldown > 0 && (
        <div className="absolute right-4 bottom-[210px] z-30 pointer-events-none text-[10px] opacity-50 font-mono">hint {hintCooldown}s</div>
      )}
    </div>
  );
}


/* ------------------------------------------------------------------ */
/* Screens                                                             */
/* ------------------------------------------------------------------ */

function TitleScreen({ hasSave, onBegin, onContinue, onHelp, showHelp, closeHelp }:{
  hasSave: boolean; onBegin: () => void; onContinue: () => void; onHelp: () => void;
  showHelp: boolean; closeHelp: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-paperfield flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-xl">
        <div className="font-hand text-2xl opacity-70">a first-person visual novel</div>
        <h1 className="font-serif text-6xl md:text-7xl tracking-tight mt-2">Soft Recall</h1>
        <p className="mt-6 font-serif text-lg opacity-80 leading-snug">
          A quiet morning. A room that has to be re-learned, gently. This is a short PC demo.
        </p>
        <div className="mt-8 flex flex-col gap-3 items-center">
          <button data-testid="begin-button" onClick={onBegin} className="choice-btn rounded px-6 py-3 text-lg w-64">Begin</button>
          {hasSave && (
            <button data-testid="continue-button" onClick={onContinue} className="choice-btn rounded px-6 py-3 w-64">Continue the morning</button>
          )}
          <button onClick={onHelp} className="choice-btn rounded px-6 py-2 w-64 text-sm opacity-80">Controls</button>
        </div>
        <p className="mt-6 text-xs opacity-50">PC-only demo · mouse + keyboard</p>
      </div>
      {/* Content & care — small boxed note, pinned lower */}
      <div className="fixed bottom-2 inset-x-0 mx-auto max-w-sm px-4">
        <div className="rounded border border-[color:var(--color-ember)]/35 bg-black/25 px-2.5 py-1.5 text-center">
          <div className="text-[13px] uppercase tracking-widest opacity-55">Content &amp; care</div>
          <p className="text-[12px] opacity-75 leading-snug mt-0.5">
            A fictional morning about memory, uncertainty, and accepting support. Optional context lives in the Memory Book.
          </p>
        </div>
      </div>
      {showHelp && <HelpOverlay onClose={closeHelp} />}
    </div>
  );
}

function EndingScreen({ id, memory, wrongCount, roomVisitOrder, confidenceChoices, packed, clarity, dissonance, supportCueUseCount, interactionOrder, onRestart }:{
  id: EndingId;
  memory: MemoryEntry[];
  wrongCount: number;
  roomVisitOrder: RoomId[];
  confidenceChoices: number[];
  packed: PackedItems;
  clarity: number;
  dissonance: number;
  supportCueUseCount: number;
  interactionOrder: string[];
  onRestart: () => void;
}) {
  const copy = ENDING_COPY[id];
  const num = ENDING_ORDER.indexOf(id) + 1;
  const avgConf = confidenceChoices.length
    ? (confidenceChoices.reduce((s, v) => s + v, 0) / confidenceChoices.length).toFixed(1)
    : "—";
  const packedList = [packed.keys && "keys", packed.bag && "bag", packed.phone && "phone"].filter(Boolean).join(", ") || "nothing";

  const downloadTelemetry = () => {
    const payload = {
      schema: "soft-recall.telemetry.v1",
      exportedAt: new Date().toISOString(),
      ending: { id, index: num, of: ENDING_ORDER.length, title: copy.title },
      scores: {
        memoriesKept: memory.length,
        missteps: wrongCount,
        clarity,
        dissonance,
        supportCueUseCount,
        confidenceChoices,
        avgConfidence: confidenceChoices.length ? confidenceChoices.reduce((s, v) => s + v, 0) / confidenceChoices.length : null,
      },
      packed,
      roomVisitOrder,
      interactionOrder,
      memories: memory.map((m) => ({
        at: m.at, room: m.room, section: m.section, title: m.title, body: m.body,
      })),
      notes: "Local-only run log. No network calls, no identifiers. Intended for personal replay analysis or classroom/research discussion of decision patterns.",
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    a.href = url;
    a.download = `soft-recall_run_${id}_${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <div data-testid="ending-screen" className="fixed inset-0 bg-paperfield flex items-center justify-center px-6 overflow-auto">
      <div className="max-w-2xl text-center py-10">
        <div className="font-hand text-2xl opacity-70">ending {num} / {ENDING_ORDER.length}</div>
        <h2 className="font-serif text-5xl mt-1">{copy.title}</h2>
        <p className="mt-2 text-sm italic opacity-70">{copy.tone}</p>
        <p className="mt-6 font-serif text-lg opacity-85 leading-snug">{copy.body}</p>

        <div className="mt-6 grid grid-cols-2 gap-2 text-xs opacity-75 max-w-md mx-auto">
          <div className="rounded border border-white/15 p-2"><b>{memory.length}</b> memories kept</div>
          <div className="rounded border border-white/15 p-2"><b>{wrongCount}</b> missteps</div>
          <div className="rounded border border-white/15 p-2">Avg confidence: <b>{avgConf}</b> / 3</div>
          <div className="rounded border border-white/15 p-2">Packed: <b>{packedList}</b></div>
        </div>

        <div className="mt-6 max-w-md mx-auto">
          <div className="text-xs opacity-60 uppercase tracking-wide mb-1">The path you took</div>
          <div className="font-serif text-sm opacity-85 flex flex-wrap justify-center gap-1">
            {roomVisitOrder.map((r, i) => (
              <span key={i}>
                {ROOM_LABEL[r]}{i < roomVisitOrder.length - 1 && <span className="mx-1 opacity-50">→</span>}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 text-left max-w-md mx-auto">
          <h3 className="font-serif text-xl mb-2">Kept from this morning</h3>
          <ul className="space-y-1 text-sm opacity-85">
            {memory.length === 0 ? <li className="italic opacity-60">Nothing kept.</li> :
              memory.map((m, i) => <li key={i}>· <b>{m.title}</b> <span className="opacity-60">— {m.section}</span></li>)}
          </ul>
        </div>

        <div className="mt-6 text-xs opacity-60 max-w-md mx-auto">
          Three endings exist. The final choice changes what the threshold asks of you.
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <button onClick={onRestart} className="choice-btn rounded px-5 py-2">Play again</button>
          <button
            onClick={downloadTelemetry}
            className="choice-btn rounded px-5 py-2"
            title="Download a local JSON log of every choice, score, and memory from this run. No network calls."
          >
            Download run log
          </button>
        </div>
        <p className="mt-2 text-[11px] opacity-55 max-w-md mx-auto">
          The run log is a local JSON file saved by your browser. Nothing is uploaded or synced.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Overlays & bits                                                     */
/* ------------------------------------------------------------------ */

function TopBtn({ onClick, label, hint, testId }:{ onClick: () => void; label: string; hint: string; testId?: string; }) {
  return (
    <button data-testid={testId} onClick={onClick} className="rounded border border-white/15 bg-white/5 px-2 py-1 hover:bg-white/10">
      {label} <span className="opacity-50 ml-1">[{hint}]</span>
    </button>
  );
}

/* Hotspot marker with hover-wobble + press-and-hold to inspect. A quick tap
   still works as a fallback so the interaction feels tactile without being
   punishing. The hit target is a tight circle in the visual center. */
const HOLD_MS = 260;
const HotspotMarker = memo(function HotspotMarker({ hotspot, scale, focused, done, pulse, debug, onInspect, onDebugMouseDown, onHoverThought, onLeaveThought }:{
  hotspot: Hotspot;
  scale: number;
  focused: boolean;
  done: boolean;
  pulse: boolean;
  debug: boolean;
  onInspect: () => void;
  onDebugMouseDown: (e: React.MouseEvent) => void;
  onHoverThought?: () => void;
  onLeaveThought?: () => void;
}) {
  const [hover, setHover] = useState(false);
  const [holding, setHolding] = useState(false);
  const holdRef = useRef<{ start: number; timer: number | null; fired: boolean }>({ start: 0, timer: null, fired: false });

  const size = Math.round(36 * scale);                       // visual glow diameter
  const hit  = Math.max(18, Math.round(size * 0.62));         // click target — larger than before

  const cancelHold = () => {
    if (holdRef.current.timer) { window.clearTimeout(holdRef.current.timer); holdRef.current.timer = null; }
    setHolding(false);
  };

  const startHold = (e: React.PointerEvent) => {
    if (debug) return;
    e.preventDefault();
    holdRef.current.fired = false;
    holdRef.current.start = performance.now();
    setHolding(true);
    holdRef.current.timer = window.setTimeout(() => {
      holdRef.current.fired = true;
      setHolding(false);
      onInspect();
    }, HOLD_MS);
  };

  const endHold = () => {
    if (debug) return;
    if (holdRef.current.fired) { cancelHold(); return; }
    // Quick tap fallback: released before hold completed → still inspect.
    cancelHold();
    onInspect();
  };

  useEffect(() => () => cancelHold(), []);

  return (
    <div
      data-hotspot
      className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 cursor-inspect"
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%`, width: size, height: size, zIndex: debug ? 30 : undefined }}
      onMouseEnter={() => { setHover(true); onHoverThought?.(); }}
      onMouseLeave={() => { setHover(false); cancelHold(); onLeaveThought?.(); }}
    >

      {/* decorative glow — no pointer events, so the player must aim at center */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 rounded-full marker-glow ${pulse ? "animate-[pulse-soft_1.4s_ease-in-out_infinite]" : ""} ${done ? "opacity-40" : "opacity-100"}`}
        style={{
          background: pulse
            ? "radial-gradient(circle, rgba(255,230,170,0.55), rgba(0,0,0,0) 70%)"
            : "radial-gradient(circle, rgba(255,220,150,0.22), rgba(0,0,0,0) 70%)",
          transform: hover ? "scale(1.15)" : "scale(1)",
          transition: "transform 220ms cubic-bezier(.2,.7,.2,1.4)",
          animation: hover && !pulse ? "wobble 900ms ease-in-out infinite" : undefined,
        }}
      />
      {/* Decorative per-hotspot arrows removed in Pass 1 — the marker glow is the sole cue. */}

      {/* progress ring while holding */}
      {holding && (
        <svg aria-hidden className="pointer-events-none absolute inset-0" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,230,170,0.9)" strokeWidth="2.5"
                  strokeDasharray="94.25" strokeDashoffset="94.25" strokeLinecap="round"
                  style={{ transformOrigin: "center", transform: "rotate(-90deg)",
                           animation: `hs-fill ${HOLD_MS}ms linear forwards` }} />
        </svg>
      )}
      {/* tight center hit-target */}
      <button
        data-testid={`hotspot-${hotspot.id}`}
        onPointerDown={debug ? undefined : startHold}
        onPointerUp={debug ? undefined : endHold}
        onPointerCancel={debug ? undefined : cancelHold}
        onMouseDown={debug ? onDebugMouseDown : undefined}
        aria-label={hotspot.label}
        className={`group absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ${focused ? "ring-2 ring-[color:var(--color-glow)]" : ""} ${debug ? "cursor-move ring-2 ring-emerald-300/80" : "cursor-pointer"}`}
        style={{
          width: hit, height: hit,
          clipPath: "circle(50% at 50% 50%)",
          background: debug ? "rgba(16,185,129,0.35)" : "transparent",
          transform: `translate(-50%, -50%) scale(${holding ? 0.9 : hover ? 1.05 : 1})`,
          transition: "transform 140ms ease-out",
        }}
      >
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[color:var(--color-glow)] text-sm font-serif drop-shadow">
          {done ? "·" : "◎"}
        </span>
        <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-0.5 text-[11px] text-white opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition">
          {hotspot.label} <span className="opacity-60">— hold</span>{debug ? ` — ${hotspot.x.toFixed(1)}, ${hotspot.y.toFixed(1)}` : ""}
        </span>
      </button>
      {debug && (
        <span className="pointer-events-none absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap rounded bg-emerald-500/90 px-1.5 py-0.5 text-[10px] font-mono text-black">
          {hotspot.id} · {hotspot.x.toFixed(1)},{hotspot.y.toFixed(1)}
        </span>
      )}
    </div>
  );
});


function MiniMap({ current, visited, unlocked, onJump }:{
  current: RoomId; visited: Set<RoomId>; unlocked: Set<RoomId>; onJump: (r: RoomId) => void;
}) {
  const rooms: RoomId[] = ["bedroom", "hallway", "kitchen", "bathroom"];
  return (
    <div className="mt-2 mx-auto max-w-md rounded-md border border-white/10 bg-black/50 px-3 py-1.5">
      <div className="grid grid-cols-4 gap-1">
        {rooms.map(r => {
          const isCur = r === current;
          const isVis = visited.has(r);
          const isUnl = unlocked.has(r);
          return (
            <button
              key={r}
              onClick={() => onJump(r)}
              disabled={!isUnl || isCur}
              aria-current={isCur ? "location" : undefined}
              className={`rounded px-2 py-0.5 text-[11px] border transition
                ${isCur ? "border-[color:var(--color-glow)] bg-white/10" : "border-white/10"}
                ${!isUnl ? "opacity-30 cursor-not-allowed" : "hover:bg-white/10"}
                ${isVis && !isCur ? "opacity-80" : ""}`}
            >
              {ROOM_LABEL[r]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MemoryBook({ memory, onClose }:{ memory: MemoryEntry[]; onClose: () => void; }) {
  const sections: MemoryEntry["section"][] = ["Fragments", "Messages", "Routines", "Reflections"];
  const tabs = ["All", ...sections, "Learn More"] as const;
  const [filter, setFilter] = useState<(typeof tabs)[number]>("All");
  const [search, setSearch] = useState("");
  const latestAt = useMemo(() => memory.reduce((m, e) => Math.max(m, e.at ?? 0), 0), [memory]);
  const bySection = (s: MemoryEntry["section"]) =>
    memory
      .filter(m => m.section === s)
      .filter(m => search.trim() === "" || `${m.title} ${m.body}`.toLowerCase().includes(search.toLowerCase()));
  const total = memory.length;
  const relTime = (at?: number) => {
    if (!at) return null;
    const diff = Date.now() - at;
    if (diff < 60_000)   return "just now";
    if (diff < 3_600_000) return `${Math.round(diff / 60_000)}m ago`;
    return `${Math.round(diff / 3_600_000)}h ago`;
  };
  return (
    <Overlay onClose={onClose} title={`Memory Book · ${total}`} hint="M">
      <div data-testid="memory-book">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {tabs.map(s => {
          const count = s === "All"
            ? total
            : s === "Learn More"
              ? visibleResearchLinks.length
              : memory.filter(m => m.section === s).length;
          const active = filter === s;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              data-testid={s === "Learn More" ? "memory-tab-learn-more" : undefined}
              className={`text-xs rounded-full px-3 py-1 border transition ${active ? "bg-[color:var(--color-glow)]/20 border-[color:var(--color-glow)] text-[color:var(--color-glow)]" : "border-white/20 opacity-70 hover:opacity-100"}`}
            >
              {s} <span className="opacity-60">{count}</span>
            </button>
          );
        })}
        {filter !== "Learn More" && (
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search entries…"
            aria-label="Search Memory Book entries"
            className="ml-auto text-xs bg-black/30 border border-white/15 rounded px-2 py-1 outline-none focus:border-[color:var(--color-glow)]"
          />
        )}
      </div>
      {sections
        .filter(s => filter === "All" || filter === s)
        .map(s => {
          const items = bySection(s);
          if (items.length === 0) return null;
          return (
            <div key={s} className="mb-4">
              <div className="font-hand text-lg opacity-70 flex items-baseline gap-2">
                <span>{s}</span>
                <span className="text-xs opacity-50">{items.length}</span>
              </div>
              <ul className="mt-1 space-y-3">
                {items.map((m, i) => {
                  const isFresh = m.at != null && m.at === latestAt;
                  return (
                    <li
                      key={i}
                      className={`rounded p-2 -mx-2 transition ${isFresh ? "bg-[color:var(--color-glow)]/10 ring-1 ring-[color:var(--color-glow)]/40 animate-[fade-in_0.4s_ease-out]" : ""}`}
                    >
                      <div className="flex items-baseline gap-2">
                        <div className="font-serif font-semibold">{m.title}</div>
                        {isFresh && <span className="text-[10px] uppercase tracking-wide text-[color:var(--color-glow)]">new</span>}
                        <span className="ml-auto text-[10px] opacity-50">
                          {m.room && <span className="italic mr-1">· {m.room}</span>}
                          {relTime(m.at)}
                        </span>
                      </div>
                      <div className="text-sm opacity-80 mt-0.5">{m.body}</div>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      {filter !== "Learn More" && total === 0 && <p className="italic opacity-60">Empty for now. Inspect things to keep them.</p>}
      {filter !== "Learn More" && total > 0 && search.trim() !== "" && sections.every(s => bySection(s).length === 0) && (
        <p className="italic opacity-60 text-sm">Nothing matches "{search}".</p>
      )}
      {filter === "Learn More" && <ResearchSection />}
      </div>
    </Overlay>
  );
}

function ResearchSection() {
  const [filter, setFilter] = useState<ResearchLink["category"] | "All">("All");
  const cats: (ResearchLink["category"] | "All")[] = useMemo(() => {
    const set = new Set<ResearchLink["category"]>();
    visibleResearchLinks.forEach(e => set.add(e.category));
    return ["All", ...Array.from(set)];
  }, []);
  const visible = filter === "All"
    ? visibleResearchLinks
    : visibleResearchLinks.filter(e => e.category === filter);

  return (
    <section className="mt-2" aria-labelledby="research-heading" data-testid="research-notes">
      <h2 id="research-heading" className="font-hand text-xl text-[color:var(--color-glow)]">
        Notes behind the story
      </h2>
      <p className="mt-1 text-sm opacity-80">
        Optional reading on ideas that informed a few mechanics. These sources are informational,
        not medical advice, diagnosis, screening, or treatment.
      </p>

      <div
        role="group"
        aria-label="Filter research by mechanic"
        className="mt-3 flex flex-wrap gap-1.5"
      >
        {cats.map(c => {
          const active = c === filter;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              aria-pressed={active}
              className={`px-2.5 py-1 rounded-full text-xs border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-glow)] ${
                active
                  ? "bg-[color:var(--color-ember)]/25 border-[color:var(--color-ember)]/70 text-[color:var(--color-glow)]"
                  : "border-white/20 opacity-70 hover:opacity-100"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      <ul id="research-list" className="mt-4 space-y-5" aria-live="polite">
        {visible.map(e => (
          <li key={e.id} className="border-l-2 border-[color:var(--color-ember)]/50 pl-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-white/8 border border-white/15 opacity-80">
                {e.category}
              </span>
              <span className="font-hand text-[color:var(--color-glow)]/90 text-base">
                {e.relatedMechanic}
              </span>
            </div>
            <p className="mt-1 text-sm opacity-90">{e.plainLanguageRelevance}</p>
            <a
              href={e.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block font-serif font-semibold leading-snug underline decoration-dotted underline-offset-2 hover:text-[color:var(--color-glow)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-glow)] rounded-sm"
              aria-label={`${e.title} - opens in a new tab`}
            >
              {e.title}
            </a>
            <div className="text-xs opacity-70 italic">
              {e.authorsOrAgency} · {e.sourceName}, {e.year} · {e.sourceType}
            </div>
            <p className="mt-1 text-xs opacity-65">Boundary: {e.claimBoundary}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}





function HelpOverlay({ onClose, onRestart }:{ onClose: () => void; onRestart?: () => void; }) {
  return (
    <Overlay onClose={onClose} title="How it plays" hint="H">
      <Section title="Inspecting objects">
        Click any glowing marker (◎) on the scene. The text box tells you what you found and what you feel about it. Faded dots (·) mean you've already looked.
      </Section>
      <Section title="Moving rooms">
        Use the <b>Doorways</b> strip. Only unlocked exits appear. The map is a guide.
      </Section>
      <Section title="If the scene blurs">
        Rushed or unkind choices smear the morning. Slow down; the next kind choice steadies things.
      </Section>
      <Section title="Memory Book">
        Press <b>M</b>. New entries pop up briefly in the corner.
      </Section>
      <Section title="Keyboard controls">
        <ul className="text-sm space-y-0.5">
          <li>Arrows / WASD — cycle objects & doorways (or choices)</li>
          <li>Enter / Space — inspect / confirm</li>
          <li>Esc / Backspace — close overlay / leave close-up</li>
          <li>H — Help · M — Memory Book · , — Settings · R — Restart</li>
          <li>N — Nudge / hint (15s cooldown)</li>
          <li>Hold B — Breathe to steady the room</li>
        </ul>
      </Section>

      {onRestart && (
        <button onClick={onRestart} className="mt-2 choice-btn rounded px-3 py-1 text-sm">Restart Demo</button>
      )}
    </Overlay>
  );
}

function SettingsOverlay({ settings, onChange, onClose, onRestart }:{
  settings: Settings; onChange: (s: Settings) => void; onClose: () => void; onRestart: () => void;
}) {
  return (
    <Overlay onClose={onClose} title="Settings" hint=",">
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={settings.reducedMotion} onChange={(e) => onChange({ ...settings, reducedMotion: e.target.checked })} />
        Reduced motion
      </label>
      <div className="mt-3 text-sm">
        <div>Film grain: {Math.round(settings.grain * 100)}%</div>
        <input type="range" min={0} max={1} step={0.05} value={settings.grain} onChange={(e) => onChange({ ...settings, grain: parseFloat(e.target.value) })} className="w-full" />
      </div>
      <div className="mt-3 text-sm">
        <div>Text softness cap: {Math.round(settings.fuzzCap * 100)}%</div>
        <input type="range" min={0} max={1} step={0.05} value={settings.fuzzCap} onChange={(e) => onChange({ ...settings, fuzzCap: parseFloat(e.target.value) })} className="w-full" />
      </div>
      <div className="mt-3 text-sm">
        <div>Marker scale: {Math.round(settings.markerScale * 100)}%</div>
        <input type="range" min={0.5} max={1.5} step={0.05} value={settings.markerScale} onChange={(e) => onChange({ ...settings, markerScale: parseFloat(e.target.value) })} className="w-full" />
        <div className="text-xs opacity-60 mt-0.5">Smaller markers make the click target tighter (aim for the center).</div>
      </div>
      <div className="mt-3 text-sm">
        <div>Foliage overlay: {Math.round(settings.foliage * 100)}%</div>
        <input type="range" min={0} max={1} step={0.05} value={settings.foliage} onChange={(e) => onChange({ ...settings, foliage: parseFloat(e.target.value) })} className="w-full" />
      </div>
      <div className="mt-4 border-t border-black/10 pt-3">
        <div className="font-hand text-base opacity-70">Accessibility</div>
        <div className="mt-2 text-sm">
          <div>Subtitle size: {Math.round(settings.subtitleScale * 100)}%</div>
          <input type="range" min={0.85} max={1.6} step={0.05} value={settings.subtitleScale} onChange={(e) => onChange({ ...settings, subtitleScale: parseFloat(e.target.value) })} className="w-full" />
        </div>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={settings.dyslexiaFont} onChange={(e) => onChange({ ...settings, dyslexiaFont: e.target.checked })} />
          Dyslexia-friendly font
        </label>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={settings.parallax} onChange={(e) => onChange({ ...settings, parallax: e.target.checked })} />
          Parallax on cursor
        </label>
      </div>
      <label className="mt-4 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={settings.debugHotspots} onChange={(e) => onChange({ ...settings, debugHotspots: e.target.checked })} />
        Hotspot debug overlay (drag to remap) — toggle with <kbd className="px-1 rounded bg-black/10">~</kbd>
      </label>
      <button onClick={onRestart} className="mt-4 choice-btn rounded px-3 py-1 text-sm">Restart Demo</button>
    </Overlay>
  );
}


function Overlay({ children, onClose, title, hint }:{
  children: React.ReactNode; onClose: () => void; title: string; hint?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="max-w-lg w-full max-h-[85vh] overflow-auto rounded-md bg-[color:var(--color-paper)] text-[color:var(--color-ink)] p-6 shadow-2xl paper-grain relative" onClick={(e) => e.stopPropagation()}>
        <div className="paper-grain-after" />
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif text-2xl">{title}</h3>
          <button onClick={onClose} className="text-sm opacity-70 hover:opacity-100">Close {hint ? `[${hint}/Esc]` : "[Esc]"}</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Section({ title, children }:{ title: string; children: React.ReactNode; }) {
  return (
    <div className="mb-3">
      <div className="font-hand text-lg opacity-70">{title}</div>
      <div className="text-sm opacity-90">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mini-games                                                          */
/* ------------------------------------------------------------------ */

function MiniGameOverlay({ spec }: { spec: MiniSpec }) {
  return (
    <div data-testid={`mini-${spec.kind}`} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-[fade-in_0.25s_ease-out]">
      <div className="vn-panel rounded-lg px-6 py-5 w-[min(92vw,440px)] text-center">
        <div className="font-hand text-[color:var(--color-glow)] text-xl leading-none">{spec.title}</div>
        <div className="mt-1 font-serif text-sm opacity-80">{spec.hint}</div>
        <div className="mt-4">
          {spec.kind === "brush" && <BrushMini onDone={spec.onDone} />}
          {spec.kind === "sip"   && <HoldMini label="Sip" durationMs={2800} onDone={spec.onDone} />}
          {spec.kind === "pour"  && <HoldMini label="Pour" durationMs={1800} onDone={spec.onDone} />}
          {spec.kind === "knob"  && <KnobMini onDone={spec.onDone} />}
          {spec.kind === "splash" && <TapMini target={4} onDone={spec.onDone} />}
          {spec.kind === "combo" && spec.combo && <ComboMini code={spec.combo} onDone={spec.onDone} onMisstep={spec.onMisstep} />}
          {spec.kind === "pairs" && spec.pairs && <PairsMini data={spec.pairs} onDone={spec.onDone} onMisstep={spec.onMisstep} />}
          {spec.kind === "reflection" && <ReflectionMini onDone={spec.onDone} />}
          {spec.kind === "unscramble" && spec.unscramble && <UnscrambleMini data={spec.unscramble} onDone={spec.onDone} onMisstep={spec.onMisstep} />}
          {spec.kind === "slide" && spec.slide && <SlideMini data={spec.slide} onDone={spec.onDone} onMisstep={spec.onMisstep} />}
        </div>
        {spec.onCancel && (
          <button
            onClick={spec.onCancel}
            className="mt-4 text-xs opacity-60 hover:opacity-100 underline underline-offset-2"
          >
            step away
          </button>
        )}
      </div>
    </div>
  );
}

function BrushMini({ onDone }: { onDone: () => void }) {
  const TARGET = 8;
  const [count, setCount] = useState(0);
  const [side, setSide] = useState<"L" | "R">("L");
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && side === "L") press("L");
      if (e.key === "ArrowRight" && side === "R") press("R");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [side]);
  const press = (s: "L" | "R") => {
    if (s !== side) return;
    const next = count + 1;
    setCount(next);
    setSide(s === "L" ? "R" : "L");
    if (next >= TARGET) setTimeout(onDone, 220);
  };
  const pct = Math.min(100, (count / TARGET) * 100);
  return (
    <div>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => press("L")}
          className={`choice-btn rounded px-6 py-3 text-lg ${side === "L" ? "ring-2 ring-[color:var(--color-glow)] brightness-110" : "opacity-40"}`}
          disabled={side !== "L"}
        >← Left</button>
        <button
          onClick={() => press("R")}
          className={`choice-btn rounded px-6 py-3 text-lg ${side === "R" ? "ring-2 ring-[color:var(--color-glow)] brightness-110" : "opacity-40"}`}
          disabled={side !== "R"}
        >Right →</button>
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded bg-white/10">
        <div className="h-full bg-[color:var(--color-glow)] transition-all duration-200" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-xs opacity-60">{count}/{TARGET} strokes</div>
    </div>
  );
}

function HoldMini({ label, durationMs, onDone }: { label: string; durationMs: number; onDone: () => void }) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const startRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const accumRef = useRef(0);
  const tick = () => {
    const now = performance.now();
    const p = Math.min(1, (accumRef.current + (now - startRef.current)) / durationMs);
    setProgress(p);
    if (p >= 1) { onDone(); return; }
    rafRef.current = requestAnimationFrame(tick);
  };
  const start = () => {
    setHolding(true);
    startRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  };
  const stop = () => {
    setHolding(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    accumRef.current += performance.now() - startRef.current;
  };
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);
  return (
    <div>
      <button
        data-testid="hold-action"
        onPointerDown={start}
        onPointerUp={stop}
        onPointerLeave={() => holding && stop()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !e.repeat) start();
        }}
        onKeyUp={(e) => {
          if (e.key === "Enter" || e.key === " ") stop();
        }}
        className={`choice-btn w-full rounded px-6 py-4 text-lg select-none ${holding ? "brightness-125" : ""}`}
      >{holding ? `${label}ing…` : `Hold to ${label}`}</button>
      <div className="mt-4 h-2 w-full overflow-hidden rounded bg-white/10">
        <div className="h-full bg-[color:var(--color-glow)]" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
}

function KnobMini({ onDone }: { onDone: () => void }) {
  const [angle, setAngle] = useState(0);
  const [holding, setHolding] = useState(false);
  const startRef = useRef<{ cx: number; cy: number; a0: number; base: number } | null>(null);
  const onDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const a0 = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
    startRef.current = { cx, cy, a0, base: angle };
    setHolding(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!holding || !startRef.current) return;
    const { cx, cy, a0, base } = startRef.current;
    const a = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
    const next = Math.max(0, Math.min(90, base + (a - a0)));
    setAngle(next);
    if (next >= 90) { setHolding(false); setTimeout(onDone, 250); }
  };
  const onUp = () => setHolding(false);
  const turnBy = (amount: number) => {
    setAngle(current => {
      const next = Math.max(0, Math.min(90, current + amount));
      if (next >= 90) setTimeout(onDone, 250);
      return next;
    });
  };
  const pct = (angle / 90) * 100;
  return (
    <div>
      <div className="mx-auto relative" style={{ width: 140, height: 140 }}>
        <div
          data-testid="door-knob"
          role="slider"
          tabIndex={0}
          aria-label="Turn the door knob"
          aria-valuemin={0}
          aria-valuemax={90}
          aria-valuenow={Math.round(angle)}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); turnBy(15); }
          }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-300/80 to-amber-700/80 shadow-inner cursor-grab active:cursor-grabbing touch-none"
          style={{ transform: `rotate(${angle}deg)`, transition: holding ? undefined : "transform 200ms ease-out" }}
        >
          <div className="absolute left-1/2 top-2 h-6 w-1.5 -translate-x-1/2 rounded bg-black/60" />
        </div>
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded bg-white/10">
        <div className="h-full bg-[color:var(--color-glow)]" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-xs opacity-60">Grab and turn a quarter clockwise</div>
    </div>
  );
}

function TapMini({ target, onDone }: { target: number; onDone: () => void }) {
  const [count, setCount] = useState(0);
  const [drop, setDrop] = useState<{ id: number; x: number }>({ id: 0, x: 25 + Math.random() * 50 });
  const [overFace, setOverFace] = useState(false);
  const catchDrop = () => {
    const next = count + 1;
    setCount(next);
    if (next >= target) { setTimeout(onDone, 220); return; }
    setDrop({ id: next, x: 15 + Math.random() * 70 });
  };
  return (
    <div>
      <div className="relative mx-auto rounded bg-gradient-to-b from-sky-900/50 to-sky-700/30 border border-white/10 overflow-hidden" style={{ width: "100%", height: 200 }}>
        <div className="absolute left-1/2 top-0 h-3 w-24 -translate-x-1/2 rounded-b bg-zinc-400/70" />
        <div
          key={drop.id}
          draggable
          onDragStart={(e) => { e.dataTransfer.setData("text/plain", "drop"); e.dataTransfer.effectAllowed = "move"; }}
          aria-label="water droplet — drag onto your face"
          className="absolute -translate-x-1/2 cursor-grab active:cursor-grabbing bg-sky-200/90 shadow-[0_0_14px_rgba(150,220,255,0.7)] animate-[pulse-soft_1.4s_ease-in-out_infinite]"
          style={{ left: `${drop.x}%`, top: 12, width: 30, height: 40, borderRadius: "40% 40% 50% 50%" }}
        />
        <div
          data-testid="water-target"
          role="button"
          tabIndex={0}
          aria-label="Catch a handful of water"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") { e.preventDefault(); catchDrop(); }
          }}
          onDragOver={(e) => { e.preventDefault(); setOverFace(true); }}
          onDragLeave={() => setOverFace(false)}
          onDrop={(e) => { e.preventDefault(); setOverFace(false); catchDrop(); }}
          onClick={catchDrop}
          className={`absolute left-1/2 -translate-x-1/2 rounded-full border-2 border-dashed flex items-center justify-center select-none cursor-pointer overflow-hidden ${overFace ? "border-[color:var(--color-glow)] bg-white/10" : "border-white/40 bg-black/20"}`}
          style={{ bottom: 12, width: 120, height: 120 }}
          title="drop water here"
        >
          <FaceSilhouette />
        </div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded bg-white/10">
        <div className="h-full bg-[color:var(--color-glow)]" style={{ width: `${(count / target) * 100}%` }} />
      </div>
      <div className="mt-1 text-xs opacity-60">{count}/{target} handfuls — drag each droplet onto your face</div>
    </div>
  );
}

/* Painterly silhouette — matches the original prototype's warm-tone,
   three-quarter portrait: brown skin, curly hair, calm expression. */
function FaceSilhouette() {
  return (
    <svg viewBox="0 0 120 120" className="w-full h-full">
      <defs>
        <radialGradient id="skinGrad" cx="50%" cy="55%" r="60%">
          <stop offset="0%" stopColor="#b47a53" />
          <stop offset="70%" stopColor="#8a5638" />
          <stop offset="100%" stopColor="#5c3720" />
        </radialGradient>
        <radialGradient id="hairGrad" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#3a2418" />
          <stop offset="100%" stopColor="#1a0e08" />
        </radialGradient>
      </defs>
      {/* neck */}
      <path d="M45 96 Q60 108 75 96 L78 120 L42 120 Z" fill="url(#skinGrad)" opacity="0.9" />
      {/* face oval */}
      <ellipse cx="60" cy="62" rx="28" ry="34" fill="url(#skinGrad)" />
      {/* curly hair cloud */}
      <g fill="url(#hairGrad)">
        <circle cx="42" cy="38" r="12" />
        <circle cx="55" cy="30" r="13" />
        <circle cx="70" cy="30" r="12" />
        <circle cx="82" cy="40" r="11" />
        <circle cx="36" cy="52" r="9" />
        <circle cx="86" cy="54" r="9" />
        <circle cx="48" cy="26" r="8" />
        <circle cx="76" cy="24" r="7" />
      </g>
      {/* soft cheek warmth */}
      <ellipse cx="46" cy="72" rx="6" ry="4" fill="#a86348" opacity="0.5" />
      <ellipse cx="74" cy="72" rx="6" ry="4" fill="#a86348" opacity="0.5" />
      {/* closed calm eyes */}
      <path d="M46 64 Q50 61 55 64" stroke="#2a170d" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <path d="M65 64 Q70 61 74 64" stroke="#2a170d" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* gentle mouth */}
      <path d="M53 82 Q60 85 67 82" stroke="#3a1e12" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      {/* nose hint */}
      <path d="M60 66 Q58 74 61 78" stroke="#5c3720" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

/* Combination lock — three dials, each 0–9. Player drags each dial (or clicks
   ▲ / ▼). Submitting a wrong code triggers a misstep; correct opens the bolt. */
function ComboMini({ code, onDone, onMisstep }: { code: number[]; onDone: () => void; onMisstep?: () => void }) {
  const [dials, setDials] = useState<number[]>(code.map(() => 0));
  const [wrong, setWrong] = useState(0);
  const [shake, setShake] = useState(false);
  const bump = (i: number, d: number) => setDials(prev => prev.map((v, idx) => idx === i ? (v + d + 10) % 10 : v));
  const submit = () => {
    if (dials.every((v, i) => v === code[i])) {
      setTimeout(onDone, 260);
    } else {
      onMisstep?.();
      setWrong(w => w + 1);
      setShake(true); setTimeout(() => setShake(false), 350);
    }
  };
  return (
    <div>
      <div className={`flex justify-center gap-3 ${shake ? "animate-[pulse-soft_0.35s_ease-out]" : ""}`}>
        {dials.map((v, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <button data-testid={`combo-up-${i}`} aria-label={`Increase dial ${i + 1}`} onClick={() => bump(i, +1)} className="choice-btn rounded px-3 py-1 text-sm">▲</button>
            <div
              draggable
              onDragStart={(e) => { e.dataTransfer.setData("text/plain", "d"+i); }}
              onWheel={(e) => { e.preventDefault(); bump(i, e.deltaY > 0 ? +1 : -1); }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => bump(i, +1)}
              className="w-14 h-16 rounded bg-black/60 border border-white/25 flex items-center justify-center font-mono text-3xl text-[color:var(--color-glow)] cursor-grab select-none"
              title="scroll, drag, or use arrows"
            >
              {v}
            </div>
            <button aria-label={`Decrease dial ${i + 1}`} onClick={() => bump(i, -1)} className="choice-btn rounded px-3 py-1 text-sm">▼</button>
          </div>
        ))}
      </div>
      <button data-testid="combo-submit" onClick={submit} className="mt-4 choice-btn rounded px-5 py-2">Try the bolt</button>
      {wrong >= 2 && (
        <div className="mt-3 text-xs text-[color:var(--color-glow)]/90 italic">
          hint: the pencilled numbers are {code.join(" · ")}.
        </div>
      )}
      <div className="mt-1 text-xs opacity-60">scroll · drag · or ▲▼ each dial · {wrong} wrong</div>
    </div>
  );
}

/* Pairs matching — drag each item onto a target. All items must land on their
   correct target to complete. Wrong drops snap back and log a misstep. */
function PairsMini({
  data, onDone, onMisstep,
}: {
  data: { items: { id: string; label: string; emoji?: string }[]; targets: { id: string; label: string }[]; correctMap: Record<string, string> };
  onDone: () => void;
  onMisstep?: () => void;
}) {
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [wrong, setWrong] = useState(0);
  const [dragId, setDragId] = useState<string | null>(null);
  const handleDrop = (targetId: string) => {
    if (!dragId) return;
    if (data.correctMap[dragId] === targetId) {
      setPlaced(p => {
        const next = { ...p, [dragId]: targetId };
        if (Object.keys(next).length === data.items.length) setTimeout(onDone, 300);
        return next;
      });
    } else {
      onMisstep?.();
      setWrong(w => w + 1);
    }
    setDragId(null);
  };
  const remaining = data.items.filter(it => !placed[it.id]);
  return (
    <div>
      <div className="flex justify-center gap-2 flex-wrap min-h-[70px] p-2 rounded bg-black/20 border border-white/10">
        {remaining.length === 0 && <div className="text-xs opacity-60">all placed…</div>}
        {remaining.map(it => (
          <div
            key={it.id}
            draggable
            onDragStart={() => setDragId(it.id)}
            onDragEnd={() => setDragId(null)}
            className="cursor-grab active:cursor-grabbing choice-btn rounded px-3 py-2 text-sm flex items-center gap-2"
          >
            <span className="text-lg">{it.emoji ?? "•"}</span>
            <span>{it.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {data.targets.map(t => {
          const landed = Object.entries(placed).filter(([, tid]) => tid === t.id).map(([iid]) => data.items.find(i => i.id === iid)?.emoji ?? "•");
          return (
            <div
              key={t.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(t.id)}
              className="rounded border-2 border-dashed border-white/30 bg-black/30 p-2 min-h-[70px] text-center hover:border-[color:var(--color-glow)] transition-colors"
            >
              <div className="text-xs opacity-70">{t.label}</div>
              <div className="mt-1 text-2xl leading-none">{landed.join(" ")}</div>
            </div>
          );
        })}
      </div>
      {wrong >= 2 && (
        <div className="mt-3 text-xs text-[color:var(--color-glow)]/90 italic">
          hint: today is the only column that should end up with pills. The other days are decoys.
        </div>
      )}
      <div className="mt-1 text-xs opacity-60">drag each pill onto a day · {Object.keys(placed).length}/{data.items.length} placed · {wrong} wrong</div>
    </div>
  );
}

/* -------- Mirror reflection — the old-demo painterly portrait ------ */
/* A framed, lit reflection of the character: warm brown skin, curly
   hair, cream sleep shirt. Player clicks "There you are" to advance. */
function ReflectionMini({ onDone }: { onDone: () => void }) {
  return (
    <div>
      <div
        className="relative mx-auto rounded-md overflow-hidden"
        style={{
          width: "100%", height: 260,
          background: "radial-gradient(ellipse at 50% 40%, #d9c8b3 0%, #a08a70 55%, #4a3a2a 100%)",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.55), 0 0 0 6px #5c412a, 0 0 0 8px #2b1c11",
        }}
      >
        {/* soft mirror bloom */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,240,220,0.35),transparent_55%)]" />
        {/* reflection portrait — bust in a cream sleep shirt */}
        <svg viewBox="0 0 200 260" className="absolute inset-0 w-full h-full">
          <defs>
            <radialGradient id="mSkin" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#c48a63" />
              <stop offset="70%" stopColor="#8a5638" />
              <stop offset="100%" stopColor="#4d2f1f" />
            </radialGradient>
            <radialGradient id="mHair" cx="50%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#3a2418" />
              <stop offset="100%" stopColor="#150b06" />
            </radialGradient>
            <linearGradient id="mShirt" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#f4e7cf" />
              <stop offset="100%" stopColor="#b8a184" />
            </linearGradient>
          </defs>
          {/* sleep shirt / shoulders */}
          <path d="M20 260 Q30 200 70 190 Q100 210 130 190 Q170 200 180 260 Z" fill="url(#mShirt)" />
          <path d="M70 190 Q100 200 130 190 L128 205 Q100 215 72 205 Z" fill="#e8d6b5" opacity="0.7" />
          {/* neck */}
          <path d="M82 190 Q100 200 118 190 L120 170 L80 170 Z" fill="url(#mSkin)" />
          {/* face */}
          <ellipse cx="100" cy="120" rx="46" ry="56" fill="url(#mSkin)" />
          {/* curly hair — bigger cloud */}
          <g fill="url(#mHair)">
            <circle cx="70" cy="80" r="20" />
            <circle cx="92" cy="65" r="22" />
            <circle cx="115" cy="65" r="22" />
            <circle cx="138" cy="82" r="20" />
            <circle cx="60" cy="100" r="15" />
            <circle cx="146" cy="102" r="15" />
            <circle cx="82" cy="58" r="14" />
            <circle cx="125" cy="55" r="12" />
            <circle cx="105" cy="52" r="14" />
          </g>
          {/* cheek warmth */}
          <ellipse cx="76" cy="138" rx="11" ry="7" fill="#b0654a" opacity="0.45" />
          <ellipse cx="124" cy="138" rx="11" ry="7" fill="#b0654a" opacity="0.45" />
          {/* eyes — soft open, warm */}
          <ellipse cx="82" cy="122" rx="4.5" ry="3" fill="#1b0e07" />
          <ellipse cx="118" cy="122" rx="4.5" ry="3" fill="#1b0e07" />
          <path d="M74 118 Q82 112 90 118" stroke="#2a170d" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M110 118 Q118 112 126 118" stroke="#2a170d" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          {/* nose */}
          <path d="M100 128 Q97 145 101 152" stroke="#4d2f1f" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.7" />
          {/* mouth */}
          <path d="M88 162 Q100 168 112 162" stroke="#3a1e12" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          {/* light streak on the mirror */}
          <rect x="150" y="10" width="8" height="240" fill="rgba(255,255,255,0.18)" transform="rotate(12 150 130)" />
        </svg>
      </div>
      <button onClick={onDone} className="mt-4 choice-btn rounded px-5 py-2">There you are.</button>
      <div className="mt-1 text-xs opacity-60">The old mirror — same face, same morning.</div>
    </div>
  );
}

/* -------- Unscramble — letter-tile drag puzzle -------------------- */
function UnscrambleMini({
  data, onDone, onMisstep,
}: {
  data: { word: string; caption: string };
  onDone: () => void;
  onMisstep?: () => void;
}) {
  const target = data.word.toUpperCase();
  const initial = useMemo(() => {
    const arr = target.split("");
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // guarantee it starts scrambled
    if (arr.join("") === target && arr.length > 1) { [arr[0], arr[1]] = [arr[1], arr[0]]; }
    return arr;
  }, [target]);
  const [tiles, setTiles] = useState<string[]>(initial);
  const [wrong, setWrong] = useState(0);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const swap = (i: number, j: number) => {
    setTiles(prev => {
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };
  const submit = () => {
    if (tiles.join("") === target) setTimeout(onDone, 250);
    else { onMisstep?.(); setWrong(w => w + 1); }
  };
  return (
    <div>
      <div className="text-xs opacity-70 italic mb-2">{data.caption}</div>
      <div className="flex justify-center gap-2 flex-wrap">
        {tiles.map((t, i) => (
          <button
            key={i}
            type="button"
            data-testid={`phone-tile-${i}`}
            draggable
            onDragStart={() => setDragIdx(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { if (dragIdx !== null && dragIdx !== i) swap(dragIdx, i); setDragIdx(null); }}
            onClick={() => {
              if (selectedIdx === null) { setSelectedIdx(i); return; }
              if (selectedIdx !== i) swap(selectedIdx, i);
              setSelectedIdx(null);
            }}
            aria-label={`Letter ${t}, position ${i + 1}`}
            aria-pressed={selectedIdx === i}
            className={`w-10 h-12 rounded bg-black/60 border flex items-center justify-center font-mono text-2xl text-[color:var(--color-glow)] cursor-grab select-none ${selectedIdx === i ? "border-[color:var(--color-glow)] ring-2 ring-[color:var(--color-glow)]/50" : "border-white/25"}`}
          >
            {t}
          </button>
        ))}
      </div>
      <button data-testid="phone-word-submit" onClick={submit} className="mt-4 choice-btn rounded px-5 py-2">Read the word</button>
      {wrong >= 2 && (
        <div className="mt-3 text-xs text-[color:var(--color-glow)]/90 italic">
          hint: it starts with <b>{target[0]}</b> and ends with <b>{target[target.length - 1]}</b> — {target.length} letters.
        </div>
      )}
      <div className="mt-1 text-xs opacity-60">drag tiles to swap · {wrong} wrong</div>
    </div>
  );
}

/* -------- Slide — 4-tile card reassembly puzzle ------------------- */
function SlideMini({
  data, onDone, onMisstep,
}: {
  data: { image: string; caption: string };
  onDone: () => void;
  onMisstep?: () => void;
}) {
  // 4 quadrants labelled 0-3. Player must land each on its home slot.
  const initial = useMemo(() => {
    const arr = [0, 1, 2, 3];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    if (arr.every((v, i) => v === i)) { [arr[0], arr[1]] = [arr[1], arr[0]]; }
    return arr;
  }, []);
  const [tiles, setTiles] = useState<number[]>(initial); // tiles[slotIdx] = pieceId
  const [wrong, setWrong] = useState(0);
  const [dragSlot, setDragSlot] = useState<number | null>(null);
  const swap = (i: number, j: number) => {
    setTiles(prev => {
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };
  useEffect(() => {
    if (tiles.every((piece, slot) => piece === slot)) {
      setTimeout(onDone, 300);
    }
  }, [tiles, onDone]);
  // Piece renderer — hand-painted "torn card" quadrants with cursive ink.
  const piece = (id: number) => {
    const bg = ["#e8d9b5", "#dcc99a", "#d1bc85", "#c6ae70"][id];
    const inks: Record<number, React.ReactElement> = {
      0: <text x="10" y="55" fontFamily="cursive" fontSize="26" fill="#3a2818">War</text>,
      1: <text x="0" y="55" fontFamily="cursive" fontSize="26" fill="#3a2818">mth</text>,
      2: <text x="10" y="45" fontFamily="cursive" fontSize="22" fill="#3a2818">to yo</text>,
      3: <text x="0" y="45" fontFamily="cursive" fontSize="22" fill="#3a2818">u — A.</text>,
    };
    return (
      <svg viewBox="0 0 100 80" className="w-full h-full" preserveAspectRatio="none">
        <rect width="100" height="80" fill={bg} />
        <path d="M0 0 L100 0 L100 80 L0 80 Z" fill="none" stroke="#8a7458" strokeWidth="1" strokeDasharray="2 3" opacity="0.5" />
        {inks[id]}
      </svg>
    );
  };
  return (
    <div>
      <div className="text-xs opacity-70 italic mb-2">{data.caption}</div>
      <div
        className="mx-auto grid grid-cols-2 gap-1 p-1 bg-[#5c412a] rounded"
        style={{ width: 220, height: 176 }}
      >
        {tiles.map((pieceId, slot) => {
          const correct = pieceId === slot;
          return (
            <div
              key={slot}
              draggable
              onDragStart={() => setDragSlot(slot)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragSlot === null || dragSlot === slot) { setDragSlot(null); return; }
                const wasRight = tiles[dragSlot] === dragSlot && tiles[slot] === slot;
                swap(dragSlot, slot);
                // only log a misstep if the player broke a correct pair
                if (wasRight) { onMisstep?.(); setWrong(w => w + 1); }
                setDragSlot(null);
              }}
              className={`overflow-hidden cursor-grab active:cursor-grabbing rounded-sm ${correct ? "ring-2 ring-[color:var(--color-glow)]/60" : ""}`}
            >
              {piece(pieceId)}
            </div>
          );
        })}
      </div>
      {wrong >= 2 && (
        <div className="mt-3 text-xs text-[color:var(--color-glow)]/90 italic">
          hint: the top-left reads "War", top-right "mth", bottom-left "to yo", bottom-right "u — A."
        </div>
      )}
      <div className="mt-2 text-xs opacity-60">drag tiles to swap · {tiles.filter((p, s) => p === s).length}/4 in place</div>
    </div>
  );
}


/* Onboarding & Breathe overlays                                       */

/* ------------------------------------------------------------------ */

function OnboardingOverlay({ onDone }: { onDone: () => void }) {
  const steps = [
    { title: "Look around", body: "Move your cursor across the scene. Painterly leaves shift gently — you're inside the room." },
    { title: "Inspect an object", body: "Glowing markers (◎) show what you can touch. Press and hold at the center to inspect. Faded (·) means you've already looked." },
    { title: "Steady the morning", body: "Rushed choices smear the world. Hold B to breathe and let it settle. Press H for help, M for the Memory Book, N for a soft hint." },
  ];
  const [i, setI] = useState(0);
  const s = steps[i];
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-[fade-in_0.3s_ease-out] p-6">
      <div className="vn-panel rounded-lg px-6 py-6 w-[min(92vw,500px)] text-center">
        <div className="font-hand text-[color:var(--color-glow)] text-xl">welcome</div>
        <h3 className="font-serif text-2xl mt-1">{s.title}</h3>
        <p className="mt-3 font-serif text-[15px] leading-snug opacity-85">{s.body}</p>
        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs opacity-50">{i + 1} / {steps.length}</span>
          <div className="flex gap-2">
            <button data-testid="tutorial-skip" onClick={onDone} className="choice-btn rounded px-3 py-1 text-xs opacity-70">Skip</button>
            {i < steps.length - 1 ? (
              <button onClick={() => setI(i + 1)} className="choice-btn rounded px-4 py-1.5 text-sm">Next</button>
            ) : (
              <button onClick={onDone} className="choice-btn rounded px-4 py-1.5 text-sm">Begin the morning</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BreatheOverlay({ phase }: { phase: "in" | "out" }) {
  return (
    <div className="fixed inset-0 z-[55] pointer-events-none flex items-center justify-center">
      <div
        className="rounded-full border-2 border-[color:var(--color-glow)]/40"
        style={{
          width: phase === "in" ? 260 : 120,
          height: phase === "in" ? 260 : 120,
          transition: "all 3600ms ease-in-out",
          background: "radial-gradient(circle, rgba(255,230,170,0.18), transparent 70%)",
        }}
      />
      <div className="absolute bottom-24 font-hand text-2xl text-[color:var(--color-glow)]/90">
        {phase === "in" ? "inhale…" : "exhale…"}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* InteractionOverlay — drag / sequence / checklist / confidence      */
/* Rules the pickers honor:                                            */
/*   - Every activity supports drag & drop (click stays as fallback)   */
/*   - Wrong answers do NOT dismiss — they call onMisstep and let      */
/*     the player retry                                                */
/*   - After the 2nd local misstep in an interaction, a hint appears   */
/*     showing what fits where                                         */
/*   - When global wrongCount >= 3, labels get "confused" (fuzzier     */
/*     synonyms) to simulate word-finding drift                        */
/* ------------------------------------------------------------------ */

const CONFUSE_SWAPS: Array<[RegExp, string]> = [
  [/A carton of milk/gi, "carton (something white?)"],
  [/Half a lemon/gi, "half a bright thing"],
  [/Sunday-you's note/gi, "a note from a Sunday you"],
  [/Someone else's leftovers/gi, "a covered plate (whose?)"],
  [/A dozen eggs/gi, "a box that might rattle"],
  [/An open bottle of wine/gi, "a dark bottle"],
  [/\bKeys\b/g, "the jangling ring"],
  [/\bPhone\b/g, "the glass rectangle"],
  [/\bBag\b/g, "the sag on the hook"],
  [/note by the door/gi, "the folded paper"],
  [/Kettle switched off/gi, "the metal thing, quieted"],
  [/Morning pill taken/gi, "the small round thing, swallowed"],
  [/Wallet — you never touched it this morning/gi, "the small folded thing"],
  [/Slice the bread/gi, "cut the loaf"],
  [/Into the toaster/gi, "into the slotted box"],
  [/Butter it/gi, "spread the yellow"],
  [/Onto the plate/gi, "onto the round dish"],
  [/Prop it by the door/gi, "leave it near the way out"],
  [/Back on the pillow/gi, "back where you slept"],
  [/Tuck it in the drawer/gi, "hide it in the box that slides"],
  [/Into the bag/gi, "into the sag"],
  [/Back in the bowl/gi, "into the little dish"],
  [/Loose in a pocket/gi, "somewhere on your body"],
  [/\bWed\b/g, "day before"],
  [/\bThu\b/g, "today (?)"],
  [/\bFri\b/g, "day after"],
  [/\bBlurred\b/g, "not-there"],
  [/\bUneven\b/g, "half-there"],
  [/\bClear enough\b/g, "here-enough"],
];
function confuseLabel(label: string, level: number): string {
  if (level < 3) return label;
  let out = label;
  for (const [re, v] of CONFUSE_SWAPS) out = out.replace(re, v);
  return level >= 4 ? out + " — maybe" : out;
}

function InteractionOverlay({ spec, confusionLevel }: { spec: InteractionSpec; confusionLevel: number }) {
  return (
    <div data-testid={`interaction-${spec.kind}`} className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm animate-[fade-in_0.25s_ease-out]">
      <div className="vn-panel rounded-lg px-6 py-5 w-[min(94vw,580px)]">
        <div className="font-hand text-[color:var(--color-glow)] text-xl leading-none">{spec.title}</div>
        <div className="mt-1 font-serif text-sm opacity-80">{spec.hint}</div>
        {confusionLevel >= 3 && (
          <div className="mt-1 text-[11px] italic opacity-60">Words go soft when the morning's crowded. Take your time.</div>
        )}
        <div className="mt-4">
          {spec.kind === "drag"       && <DragToTarget spec={spec} confusionLevel={confusionLevel} />}
          {spec.kind === "sequence"   && <SequenceDrag spec={spec} confusionLevel={confusionLevel} />}
          {spec.kind === "checklist"  && <ChecklistDrag spec={spec} confusionLevel={confusionLevel} />}
          {spec.kind === "confidence" && <ConfidenceDrag spec={spec} confusionLevel={confusionLevel} />}
        </div>
        {spec.onCancel && (
          <button
            onClick={spec.onCancel}
            className="mt-4 text-xs opacity-60 hover:opacity-100 underline underline-offset-2"
          >
            step away
          </button>
        )}
      </div>
    </div>
  );
}

function HintBanner({ show, text }: { show: boolean; text: string }) {
  if (!show) return null;
  return (
    <div className="mb-3 rounded border border-[color:var(--color-glow)]/60 bg-[color:var(--color-glow)]/10 px-3 py-2 text-xs font-serif text-[color:var(--color-glow)] animate-[fade-in_0.3s_ease-out]">
      <span className="font-hand text-base mr-2">Hint:</span>{text}
    </div>
  );
}

function TimerBar({ limitMs, onExpire, paused }: { limitMs: number; onExpire: () => void; paused?: boolean }) {
  const [left, setLeft] = useState(limitMs);
  const startRef = useRef(performance.now());
  const firedRef = useRef(false);
  useEffect(() => {
    if (paused) return;
    let raf = 0;
    const tick = () => {
      const remaining = Math.max(0, limitMs - (performance.now() - startRef.current));
      setLeft(remaining);
      if (remaining <= 0 && !firedRef.current) { firedRef.current = true; onExpire(); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limitMs, paused]);
  const pct = (left / limitMs) * 100;
  const secs = Math.ceil(left / 1000);
  const warn = pct < 30;
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between text-[11px] opacity-70 mb-1">
        <span>Time</span><span className={warn ? "text-rose-300" : ""}>{secs}s</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded bg-white/10">
        <div className={`h-full transition-[width] duration-100 ${warn ? "bg-rose-400" : "bg-[color:var(--color-glow)]"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function DragToTarget({ spec, confusionLevel }: { spec: Extract<InteractionSpec, { kind: "drag" }>; confusionLevel: number }) {
  const [over, setOver] = useState<string | null>(null);
  const [wrong, setWrong] = useState(0);
  const [shake, setShake] = useState(false);
  const correctId = spec.targets.find(t => t.tone === "correct")?.id ?? null;
  const correctLabel = spec.targets.find(t => t.tone === "correct")?.label ?? "";
  const showHint = wrong >= 2;
  const handlePick = (id: string, tone: "correct" | "neutral" | "wrong") => {
    if (tone === "wrong" && spec.retryOnWrong) {
      spec.onMisstep?.();
      setWrong(w => w + 1);
      setShake(true); window.setTimeout(() => setShake(false), 380);
      return;
    }
    spec.onPick(id, tone);
  };
  return (
    <div>
      <HintBanner show={showHint} text={`Try "${confuseLabel(correctLabel, confusionLevel)}" — the glowing target is the fit.`} />
      <div
        draggable
        onDragStart={(e) => { e.dataTransfer.setData("text/plain", "item"); e.dataTransfer.effectAllowed = "move"; }}
        className={`mx-auto mb-4 select-none cursor-grab active:cursor-grabbing rounded border border-[color:var(--color-glow)]/40 bg-black/40 px-3 py-2 text-center font-serif text-sm ${shake ? "animate-[wobble_0.4s_ease]" : ""}`}
      >
        {confuseLabel(spec.item, confusionLevel)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {spec.targets.map(t => {
          const isHint = showHint && t.id === correctId;
          return (
            <button
              key={t.id}
              data-testid={`interaction-target-${t.id}`}
              onDragOver={(e) => { e.preventDefault(); setOver(t.id); }}
              onDragLeave={() => setOver(o => (o === t.id ? null : o))}
              onDrop={(e) => { e.preventDefault(); setOver(null); handlePick(t.id, t.tone); }}
              onClick={() => handlePick(t.id, t.tone)}
              className={`choice-btn rounded px-3 py-3 text-sm text-left transition ${over === t.id ? "ring-2 ring-[color:var(--color-glow)]" : ""} ${isHint ? "marker-glow" : ""}`}
            >
              {confuseLabel(t.label, confusionLevel)}
            </button>
          );
        })}
      </div>
      <div className="mt-3 text-[11px] opacity-60 italic">Drag the card into a target — or click one.</div>
    </div>
  );
}

function SequenceDrag({ spec, confusionLevel }: { spec: Extract<InteractionSpec, { kind: "sequence" }>; confusionLevel: number }) {
  const [order, setOrder] = useState<(string | null)[]>(() => Array(spec.items.length).fill(null));
  const [dragId, setDragId] = useState<string | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [wrong, setWrong] = useState(0);
  const [shake, setShake] = useState(false);
  const showHint = wrong >= 2;
  const placedIds = new Set(order.filter(Boolean) as string[]);
  const remaining = spec.items.filter(i => !placedIds.has(i.id));
  const filledCount = order.filter(x => x !== null).length;
  const done = filledCount === spec.items.length;
  const dropAt = (idx: number, id: string) => {
    setOrder(o => {
      const n = [...o];
      const existingIdx = n.indexOf(id);
      if (existingIdx >= 0) n[existingIdx] = null;
      n[idx] = id;
      return n;
    });
    setDragId(null); setOverIdx(null);
  };
  const check = () => {
    const arr = order as string[];
    const correct = arr.every((id, i) => id === spec.correctOrder[i]);
    if (!correct) {
      spec.onMisstep?.();
      setWrong(w => w + 1);
      setShake(true); window.setTimeout(() => setShake(false), 380);
      // After 3 wrong tries, accept the current order and move on so the player isn't stuck.
      if (wrong + 1 >= 3) spec.onDone(arr, false);
      return;
    }
    spec.onDone(arr, true);
  };
  const onExpire = () => {
    const arr = order as string[];
    spec.onMisstep?.();
    spec.onDone(arr, false);
  };
  return (
    <div>
      {spec.timeLimit && <TimerBar limitMs={spec.timeLimit} onExpire={onExpire} />}
      <HintBanner show={showHint} text={`Correct order: ${spec.correctOrder.map(id => confuseLabel(spec.items.find(i => i.id === id)?.label || id, confusionLevel)).join(" → ")}.`} />
      <div className={`mb-3 grid grid-cols-4 gap-2 ${shake ? "animate-[wobble_0.4s_ease]" : ""}`}>
        {order.map((id, idx) => {
          const item = spec.items.find(x => x.id === id) || null;
          const correctItem = spec.items.find(x => x.id === spec.correctOrder[idx]);
          const hintLabel = showHint && !item ? correctItem?.label : null;
          const misplaced = showHint && item && item.id !== spec.correctOrder[idx];
          return (
            <div
              key={idx}
              data-testid={`sequence-slot-${idx}`}
              role="button"
              tabIndex={0}
              aria-label={`Sequence position ${idx + 1}`}
              onDragOver={(e) => { e.preventDefault(); setOverIdx(idx); }}
              onDragLeave={() => setOverIdx(o => o === idx ? null : o)}
              onDrop={(e) => { e.preventDefault(); if (dragId) dropAt(idx, dragId); }}
              onClick={() => { if (dragId) dropAt(idx, dragId); }}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && dragId) { e.preventDefault(); dropAt(idx, dragId); }
              }}
              className={`min-h-[64px] rounded border-2 border-dashed p-1.5 text-xs text-center flex flex-col items-center justify-center ${overIdx === idx ? "border-[color:var(--color-glow)] bg-white/5" : "border-white/20"} ${misplaced ? "border-rose-400/60" : ""}`}
            >
              <div className="opacity-50 text-[10px]">{idx + 1}</div>
              {item ? (
                <button
                  onClick={(e) => { e.stopPropagation(); setOrder(o => { const n = [...o]; n[idx] = null; return n; }); }}
                  className="mt-1 rounded bg-black/40 px-1.5 py-0.5 text-xs"
                  title="click to remove"
                >
                  {confuseLabel(item.label, confusionLevel)}
                </button>
              ) : hintLabel ? (
                <div className="mt-1 text-[10px] italic opacity-40">hint: {confuseLabel(hintLabel, confusionLevel)}</div>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="mb-2 text-[11px] opacity-60 italic">Drag steps into slots (or tap a step, then tap a slot).</div>
      <div className="grid grid-cols-2 gap-2">
        {remaining.map(i => (
          <button
            key={i.id}
            type="button"
            data-testid={`sequence-item-${i.id}`}
            aria-pressed={dragId === i.id}
            draggable
            onDragStart={() => setDragId(i.id)}
            onDragEnd={() => setDragId(null)}
            onClick={() => setDragId(prev => prev === i.id ? null : i.id)}
            className={`cursor-grab active:cursor-grabbing rounded px-3 py-2 text-sm text-left border select-none ${dragId === i.id ? "border-[color:var(--color-glow)] bg-white/10" : "border-white/20 bg-black/40"}`}
          >
            {confuseLabel(i.label, confusionLevel)}
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          disabled={!done}
          onClick={check}
          className={`choice-btn rounded px-3 py-2 text-sm ${done ? "" : "opacity-40 cursor-not-allowed"}`}
        >
          {done ? "That's the order" : `fill ${spec.items.length - filledCount} more`}
        </button>
        {filledCount > 0 && (
          <button onClick={() => setOrder(Array(spec.items.length).fill(null))} className="text-xs opacity-70 hover:opacity-100 underline underline-offset-2">
            start over
          </button>
        )}
      </div>
    </div>
  );
}

function ChecklistDrag({ spec, confusionLevel }: { spec: Extract<InteractionSpec, { kind: "checklist" }>; confusionLevel: number }) {
  const [placement, setPlacement] = useState<Record<string, "yes" | "no" | null>>(
    () => Object.fromEntries(spec.options.map(o => [o.id, null]))
  );
  const [dragId, setDragId] = useState<string | null>(null);
  const [overBin, setOverBin] = useState<"yes" | "no" | null>(null);
  const [wrong, setWrong] = useState(0);
  const [shake, setShake] = useState(false);
  const showHint = wrong >= 2;
  const unplaced = spec.options.filter(o => placement[o.id] === null);
  const allPlaced = unplaced.length === 0;
  const place = (id: string, bin: "yes" | "no") => setPlacement(p => ({ ...p, [id]: bin }));
  const finish = () => {
    const picked = Object.entries(placement).filter(([, v]) => v === "yes").map(([k]) => k);
    const wrongPicks = picked.filter(id => !spec.options.find(o => o.id === id)?.correct).length;
    const missedCorrect = spec.options.filter(o => o.correct && placement[o.id] !== "yes").length;
    const allCorrect = wrongPicks === 0 && missedCorrect === 0;
    if (!allCorrect) {
      spec.onMisstep?.();
      setWrong(w => w + 1);
      setShake(true); window.setTimeout(() => setShake(false), 380);
      if (wrong + 1 >= 3) spec.onDone(picked, allCorrect, wrongPicks);
      return;
    }
    spec.onDone(picked, true, 0);
  };
  const onExpire = () => {
    const picked = Object.entries(placement).filter(([, v]) => v === "yes").map(([k]) => k);
    const wrongPicks = picked.filter(id => !spec.options.find(o => o.id === id)?.correct).length;
    spec.onMisstep?.();
    spec.onDone(picked, wrongPicks === 0 && spec.options.filter(o => o.correct && placement[o.id] !== "yes").length === 0, wrongPicks);
  };
  const correctIds = spec.options.filter(o => o.correct).map(o => confuseLabel(o.label, confusionLevel));
  return (
    <div className={shake ? "animate-[wobble_0.4s_ease]" : ""}>
      {spec.timeLimit && <TimerBar limitMs={spec.timeLimit} onExpire={onExpire} />}
      {spec.preview && (
        <div className="mb-3 rounded-lg border border-white/15 bg-gradient-to-b from-sky-100/10 to-sky-950/40 p-2">
          <div className="text-[11px] uppercase tracking-wide opacity-70 mb-1">{spec.preview.title}</div>
          <div className="grid grid-cols-3 gap-1.5">
            {spec.preview.items.map((it, i) => (
              <div key={i} className="rounded border border-white/15 bg-black/40 px-2 py-2 text-center">
                <div className="text-2xl leading-none">{it.emoji}</div>
                <div className="mt-1 text-[10px] font-serif opacity-80">{it.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-1 text-[10px] italic opacity-50">This is what you can see on the shelf.</div>
        </div>
      )}
      <HintBanner show={showHint} text={`Only these belong in "It's there": ${correctIds.join(", ")}.`} />
      <div className="mb-3 flex flex-wrap gap-2 min-h-[52px] rounded border border-white/10 bg-black/30 p-2">
        {unplaced.length === 0 && <span className="italic text-xs opacity-50">all sorted — press "That's the list"</span>}
        {unplaced.map(o => (
          <button
            key={o.id}
            type="button"
            data-testid={`check-item-${o.id}`}
            aria-pressed={dragId === o.id}
            draggable
            onDragStart={() => setDragId(o.id)}
            onDragEnd={() => setDragId(null)}
            onClick={() => setDragId(prev => prev === o.id ? null : o.id)}
            className={`cursor-grab active:cursor-grabbing rounded border px-2 py-1 text-xs font-serif select-none ${dragId === o.id ? "border-[color:var(--color-glow)] bg-white/10" : "border-[color:var(--color-glow)]/30 bg-black/40"}`}
          >
            {confuseLabel(o.label, confusionLevel)}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {(["yes", "no"] as const).map(bin => (
          <div
            key={bin}
            data-testid={`check-bin-${bin}`}
            role="button"
            tabIndex={0}
            aria-label={bin === "yes" ? "Place selected item in It's there" : "Place selected item in Not there"}
            onDragOver={(e) => { e.preventDefault(); setOverBin(bin); }}
            onDragLeave={() => setOverBin(b => b === bin ? null : b)}
            onDrop={(e) => { e.preventDefault(); if (dragId) place(dragId, bin); setOverBin(null); setDragId(null); }}
            onClick={() => { if (dragId) { place(dragId, bin); setDragId(null); } }}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && dragId) {
                e.preventDefault();
                place(dragId, bin);
                setDragId(null);
              }
            }}
            className={`min-h-[110px] rounded border-2 border-dashed p-2 ${overBin === bin ? "border-[color:var(--color-glow)] bg-white/5" : "border-white/15"}`}
          >
            <div className="text-[11px] uppercase tracking-wide opacity-70 mb-1">
              {bin === "yes" ? "It's there" : "Not there"}
            </div>
            <div className="flex flex-wrap gap-1">
              {spec.options.filter(o => placement[o.id] === bin).map(o => {
                const isMisplaced = showHint && ((bin === "yes" && !o.correct) || (bin === "no" && o.correct));
                return (
                  <button
                    key={o.id}
                    onClick={() => setPlacement(p => ({ ...p, [o.id]: null }))}
                    className={`rounded border px-2 py-1 text-xs font-serif ${isMisplaced ? "border-rose-400/70 text-rose-200" : "border-white/20"}`}
                    title="click to move back"
                  >
                    {confuseLabel(o.label, confusionLevel)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          data-testid="check-submit"
          data-remaining={unplaced.length}
          disabled={!allPlaced}
          onClick={finish}
          className={`choice-btn rounded px-3 py-2 text-sm ${allPlaced ? "" : "opacity-40 cursor-not-allowed"}`}
        >
          That's the list
        </button>
        {showHint && <span className="text-[11px] italic opacity-70">Rose outlines mark misplaced items.</span>}
      </div>
    </div>
  );
}

function ConfidenceDrag({ spec, confusionLevel }: { spec: Extract<InteractionSpec, { kind: "confidence" }>; confusionLevel: number }) {
  const opts: { level: 1 | 2 | 3; label: string; sub: string }[] = [
    { level: 1, label: "Blurred",     sub: "the day hasn't come into shape" },
    { level: 2, label: "Uneven",      sub: "some things are here, some aren't" },
    { level: 3, label: "Clear enough", sub: "not perfect, but enough to move" },
  ];
  const [dragging, setDragging] = useState(false);
  const [over, setOver] = useState<1 | 2 | 3 | null>(null);
  const drop = (level: 1 | 2 | 3) => spec.onPick(level, level !== spec.honestLevel);
  return (
    <div>
      <div className="mb-4 flex items-center justify-center gap-3">
        <div
          draggable
          onDragStart={() => setDragging(true)}
          onDragEnd={() => setDragging(false)}
          className={`cursor-grab active:cursor-grabbing h-10 w-10 rounded-full bg-[color:var(--color-glow)]/30 border-2 border-[color:var(--color-glow)] shadow-[0_0_18px_rgba(255,220,150,0.4)] ${dragging ? "opacity-60" : ""}`}
          title="drag this onto a bar"
        />
        <div className="text-[11px] italic opacity-70">Drag this token onto the bar that feels honest.</div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {opts.map(o => (
          <button
            key={o.level}
            onDragOver={(e) => { e.preventDefault(); setOver(o.level); }}
            onDragLeave={() => setOver(x => x === o.level ? null : x)}
            onDrop={(e) => { e.preventDefault(); setOver(null); drop(o.level); }}
            onClick={() => drop(o.level)}
            className={`choice-btn rounded px-3 py-2 text-left ${over === o.level ? "ring-2 ring-[color:var(--color-glow)]" : ""}`}
          >
            <div className="font-serif text-sm">{confuseLabel(o.label, confusionLevel)}</div>
            <div className="text-[11px] opacity-60 italic">{o.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
