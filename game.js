const SAVE_KEY = "softRecallFiveRoomsSave";
const HISTORY_KEY = "softRecallMorningHistory";

const itemData = {
  glasses: { name: "glasses", icon: "GL" },
  phone: { name: "phone", icon: "PH" },
  pill_organizer: { name: "pill organizer", icon: "PO" },
  appointment_card: { name: "appointment card", icon: "AP" },
  sticky_note: { name: "sticky note", icon: "NO" },
  keys: { name: "keys", icon: "KY" },
  wallet: { name: "wallet", icon: "WA" },
  mug: { name: "mug", icon: "MG" },
  tea_bag: { name: "tea bag", icon: "TB" },
  photo: { name: "photo", icon: "IM" }
};

const checklist = [
  { id: "glasses", label: "See the room clearly" },
  { id: "tea", label: "Make the morning gentle" },
  { id: "medication", label: "Confirm what matters" },
  { id: "photo", label: "Reconnect the memory" },
  { id: "phone", label: "Choose how to be supported" },
  { id: "leave", label: "Decide what today can be" }
];

const memoryFragments = {
  mango: {
    title: "Mango tea",
    room: "Kitchen",
    text: "The tea tin smells like mango. The scent reaches the memory before the date does."
  },
  blue_towel: {
    title: "Blue towel",
    room: "Living Room",
    text: "A postcard shows the beach towel: bright blue, sandy at one corner, folded over a chair."
  },
  wind: {
    title: "Wind in her hair",
    room: "Bedroom",
    text: "Morning air moves the curtain. The photo memory finds wind before it finds the year."
  },
  handwriting: {
    title: "Handwriting",
    room: "Hallway",
    text: "The sticky note is written in your own hand. It does not argue. It simply waits."
  },
  voice: {
    title: "Familiar voice",
    room: "Living Room",
    text: "The voice on the phone is patient. It gives the room a second center."
  }
};

const memoryPuzzle = {
  required: { person: "Mom", place: "Beach", anchor: "Mango tea", detail: "Blue towel and wind" },
  slots: {
    person: ["Mom", "Neighbor", "Nurse"],
    place: ["Beach", "Clinic", "Kitchen"],
    anchor: ["Mango tea", "Black coffee", "Raincoat"],
    detail: ["Blue towel and wind", "Red umbrella", "White hallway"]
  },
  hintByFragment: {
    mango: "The smell points toward mango tea.",
    blue_towel: "The postcard keeps the towel blue.",
    wind: "The curtain remembers wind before the year.",
    voice: "The voice makes the person feel less distant."
  }
};

const careNotes = [
  {
    title: "Cues reduce load",
    text: "The sticky note does not solve memory loss. It moves one task out of working memory and into the room."
  },
  {
    title: "Support protects autonomy",
    text: "The phone call helps most when it stays specific, calm, and optional instead of taking over the morning."
  },
  {
    title: "Sensory details matter",
    text: "Mango, wind, and color are not trivia. Sensory anchors can make a memory easier to approach."
  },
  {
    title: "A pause can be progress",
    text: "The Not Today ending treats rescheduling as dignity-centered decision-making, not failure."
  }
];

const rooms = {
  bedroom: {
    name: "Bedroom",
    nav: "Bedroom",
    descriptions: {
      clear: "A soft quilt, slippers, and pale morning light. The room knows the first step: glasses.",
      softened: "The room is familiar, but its edges arrive late. The bed is a shape, the table a maybe-place.",
      supported: "The bedside label and steady light make the first step easier to hold."
    },
    decor: ["bed", "window", "blanket", "slippers", "small lamp"],
    objects: [
      {
        id: "bedside_glasses",
        item: "glasses",
        kind: "collect",
        x: 28,
        y: 35,
        labels: { clear: "glasses", softened: "small lenses", supported: "glasses - bedside" },
        text: "The frames are cool at first, then familiar against your face.",
        after: "With the glasses on, the room becomes less guesswork.",
        fragment: "wind"
      },
      {
        id: "bedroom_window",
        kind: "inspect",
        x: 72,
        y: 20,
        labels: { clear: "window", softened: "bright square", supported: "window - morning air" },
        text: "A little wind moves the curtain. Something about the beach photo begins to return.",
        fragment: "wind"
      },
      {
        id: "bedroom_note",
        item: "sticky_note",
        kind: "collect",
        x: 47,
        y: 66,
        labels: { clear: "sticky note", softened: "yellow paper", supported: "note - morning list" },
        text: "The note says: glasses, tea, medicine, phone, appointment.",
        after: "The paper remembers without asking you to apologize."
      }
    ]
  },
  bathroom: {
    name: "Bathroom",
    nav: "Bathroom",
    descriptions: {
      clear: "The sink is clean, the mirror is fogged at the edges, and the pill organizer waits by the towel.",
      softened: "White tile, reflected light, small containers. The labels are close, then farther away.",
      supported: "A plain label near the organizer gives the medication step a gentle order."
    },
    decor: ["mirror", "sink", "towel", "tile"],
    objects: [
      {
        id: "mirror",
        kind: "inspect",
        x: 33,
        y: 26,
        labels: { clear: "mirror", softened: "face glass", supported: "mirror - pause" },
        text: "The mirror offers a pause, not a judgment. You breathe until the room steadies."
      },
      {
        id: "pill_organizer",
        item: "pill_organizer",
        kind: "organizer",
        x: 62,
        y: 52,
        labels: { clear: "pill organizer", softened: "small boxes", supported: "organizer - today" },
        text: "The Tuesday compartment is full. The organizer confirms what the bottle alone cannot hold."
      },
      {
        id: "bathroom_cabinet",
        kind: "inspect",
        x: 78,
        y: 26,
        labels: { clear: "cabinet", softened: "white door", supported: "cabinet - towels" },
        text: "Towels, soap, spare toothpaste. Nothing urgent here. The checklist can stay small."
      }
    ]
  },
  kitchen: {
    name: "Kitchen",
    nav: "Kitchen",
    descriptions: {
      clear: "Warm counters, a kettle, a mug, and the tea tin. This room remembers sequence.",
      softened: "The counter is crowded by small decisions. Cup, water, packet, switch: the order slips.",
      supported: "The kettle label and checklist hold the order outside of memory."
    },
    decor: ["counter", "window", "plant", "calendar", "warm light"],
    objects: [
      {
        id: "mug",
        item: "mug",
        kind: "collect",
        x: 28,
        y: 55,
        labels: { clear: "mug", softened: "warm cup", supported: "mug - first" },
        text: "The mug fits your hand. The body recognizes it quickly."
      },
      {
        id: "tea_tin",
        item: "tea_bag",
        kind: "collect",
        x: 48,
        y: 38,
        labels: { clear: "tea tin", softened: "sweet tin", supported: "mango tea tin" },
        text: "Mango tea. The smell points toward the photo before the photo is in your hand.",
        fragment: "mango"
      },
      {
        id: "kettle",
        kind: "tea",
        x: 69,
        y: 50,
        labels: { clear: "kettle", softened: "steam thing", supported: "kettle - mug + tea" },
        text: "Water, tea bag, switch. The kettle clicks, and the room feels named again."
      },
      {
        id: "medication_bottle",
        kind: "medication",
        x: 78,
        y: 25,
        labels: { clear: "medication", softened: "morning bottle", supported: "medicine - after tea" },
        text: "The organizer confirms today. One tablet after tea."
      },
      {
        id: "calendar",
        kind: "inspect",
        x: 14,
        y: 26,
        labels: { clear: "calendar", softened: "date paper", supported: "calendar - appointment day" },
        text: "Today has a small circle around it. Appointment, 9:30."
      }
    ]
  },
  living: {
    name: "Living Room",
    nav: "Living",
    descriptions: {
      clear: "A couch, low table, photo frame, phone, and postcards. The room holds relationship.",
      softened: "Faces feel close but unnamed. The room is tender, not empty.",
      supported: "Labels and the phone contact make the room easier to ask for help in."
    },
    decor: ["couch", "rug", "bookshelf", "radio", "photo wall"],
    objects: [
      {
        id: "photo_frame",
        item: "photo",
        kind: "photo",
        x: 44,
        y: 35,
        labels: { clear: "photo", softened: "someone loved", supported: "Mom - beach photo" },
        text: "The photo is familiar before the name arrives."
      },
      {
        id: "postcard",
        kind: "inspect",
        x: 25,
        y: 62,
        labels: { clear: "postcard", softened: "blue paper", supported: "postcard - blue towel" },
        text: "A blue towel on a beach chair. The picture in your hand gains another piece.",
        fragment: "blue_towel"
      },
      {
        id: "phone",
        item: "phone",
        kind: "phone",
        x: 66,
        y: 55,
        labels: { clear: "phone", softened: "voice box", supported: "phone - call Mom" },
        text: "The contact photo helps. You can call, or simply hold the option for a moment."
      },
      {
        id: "wallet",
        item: "wallet",
        kind: "collect",
        x: 76,
        y: 28,
        labels: { clear: "wallet", softened: "brown fold", supported: "wallet - essentials" },
        text: "The wallet is under a folded receipt. Into the pocket it goes."
      }
    ]
  },
  hallway: {
    name: "Hallway/Doorway",
    nav: "Doorway",
    descriptions: {
      clear: "Keys, shoes, appointment card, and the door. The outside begins here.",
      softened: "The hall narrows into objects with jobs. Some are named, some are only important.",
      supported: "The door label, note, and checklist make leaving feel possible without rushing."
    },
    decor: ["coat hook", "shoe mat", "door", "letters", "small table"],
    objects: [
      {
        id: "keys",
        item: "keys",
        kind: "collect",
        x: 28,
        y: 52,
        labels: { clear: "keys", softened: "metal sound", supported: "keys - by door" },
        text: "The keys make a small bright sound. The hall becomes more definite."
      },
      {
        id: "appointment_card",
        item: "appointment_card",
        kind: "collect",
        x: 48,
        y: 32,
        labels: { clear: "appointment card", softened: "small card", supported: "appointment - 9:30" },
        text: "The card gives the morning a destination without turning it into a test."
      },
      {
        id: "hall_note",
        kind: "inspect",
        x: 66,
        y: 36,
        labels: { clear: "door note", softened: "yellow square", supported: "note - keys wallet phone" },
        text: "Keys. Wallet. Phone. Card. The list is plain and kind.",
        fragment: "handwriting"
      },
      {
        id: "front_door",
        kind: "leave",
        x: 79,
        y: 58,
        labels: { clear: "door", softened: "outside", supported: "door - leave when ready" },
        text: "The hallway is only a hallway. The morning can continue."
      }
    ]
  }
};

const supportTargets = [
  { id: "medication", label: "Medication", room: "kitchen", text: "A medication label appears: after tea, check organizer." },
  { id: "door", label: "Door", room: "hallway", text: "A door note appears: keys, wallet, phone, appointment card." },
  { id: "phone", label: "Phone", room: "living", text: "The phone contact becomes easier to read." },
  { id: "kettle", label: "Kettle", room: "kitchen", text: "A kettle cue appears: mug, tea bag, water, switch." },
  { id: "calendar", label: "Calendar", room: "kitchen", text: "The appointment day is marked in large print." }
];

const roomDetailLayers = {
  bedroom: [
    { type: "wallpaper floral", label: "faded floral wallpaper", x: 4, y: 4, w: 28, h: 33 },
    { type: "arched-window ivy", label: "arched window with ivy", x: 66, y: 6, w: 24, h: 25 },
    { type: "quilt patchwork", label: "patchwork quilt", x: 11, y: 50, w: 30, h: 17 },
    { type: "poster moon", label: "moon print", x: 45, y: 9, w: 12, h: 17 },
    { type: "stack books", label: "bedside books", x: 42, y: 44, w: 13, h: 10 },
    { type: "ink-shadow corner", label: "soft corner shadow", x: 0, y: 68, w: 23, h: 25 },
    { type: "floor-lines soft", label: "old floorboards", x: 48, y: 70, w: 36, h: 20 }
  ],
  bathroom: [
    { type: "tile-grid blue", label: "soft blue tile", x: 4, y: 4, w: 35, h: 38 },
    { type: "mirror glow", label: "fogged mirror glow", x: 24, y: 9, w: 28, h: 27 },
    { type: "counter tray", label: "small tray", x: 54, y: 48, w: 26, h: 12 },
    { type: "towel rail peach", label: "peach towel", x: 64, y: 18, w: 18, h: 11 },
    { type: "fern small", label: "small fern", x: 12, y: 60, w: 12, h: 18 },
    { type: "water reflection", label: "sink reflection", x: 36, y: 58, w: 22, h: 14 },
    { type: "cabinet lines", label: "cabinet seams", x: 73, y: 6, w: 18, h: 32 }
  ],
  kitchen: [
    { type: "backsplash checker", label: "checker backsplash", x: 5, y: 6, w: 38, h: 24 },
    { type: "koi cloth", label: "koi tea towel", x: 10, y: 55, w: 20, h: 16 },
    { type: "herbs hanging", label: "hanging herbs", x: 50, y: 5, w: 18, h: 22 },
    { type: "yellow poster", label: "yellow tea poster", x: 69, y: 7, w: 18, h: 22 },
    { type: "sink dishes", label: "quiet dishes", x: 31, y: 63, w: 24, h: 13 },
    { type: "steam curls", label: "steam curls", x: 65, y: 31, w: 18, h: 23 },
    { type: "calendar bold", label: "circled date", x: 8, y: 31, w: 17, h: 12 }
  ],
  living: [
    { type: "comic panels", label: "small comic panels", x: 5, y: 7, w: 28, h: 28 },
    { type: "couch shadow", label: "deep couch shadow", x: 9, y: 58, w: 36, h: 18 },
    { type: "record sleeves", label: "record sleeves", x: 68, y: 8, w: 22, h: 22 },
    { type: "postcard spread", label: "postcard spread", x: 18, y: 38, w: 22, h: 13 },
    { type: "moon lamp", label: "moon lamp", x: 55, y: 21, w: 13, h: 17 },
    { type: "plant shelf", label: "plant shelf", x: 72, y: 60, w: 18, h: 17 },
    { type: "radio glow", label: "radio glow", x: 43, y: 61, w: 19, h: 12 }
  ],
  hallway: [
    { type: "blue arch", label: "blue hallway arch", x: 4, y: 4, w: 31, h: 54 },
    { type: "coat silhouette", label: "coat silhouette", x: 20, y: 18, w: 17, h: 32 },
    { type: "key hooks", label: "key hooks", x: 25, y: 45, w: 19, h: 10 },
    { type: "door chain", label: "door chain", x: 70, y: 29, w: 16, h: 10 },
    { type: "notice board", label: "notice board", x: 46, y: 9, w: 20, h: 23 },
    { type: "letter stack", label: "letter stack", x: 42, y: 58, w: 24, h: 13 },
    { type: "ink curve", label: "soft ink shadow", x: 63, y: 62, w: 31, h: 22 }
  ]
};

const phoneChoices = [
  {
    id: "ask_help",
    label: "Ask for help",
    line: "Could you help me walk through the last few things?",
    reply: "Of course. We can do one thing at a time.",
    effect: { support: 1.2, clarity: 1, flag: "askedHelp" }
  },
  {
    id: "deny_help",
    label: "Say you are okay",
    line: "I think I can do it myself.",
    reply: "I believe you. I will keep my phone nearby.",
    effect: { support: 0.2, clarity: -0.4, flag: "deniedHelp" }
  },
  {
    id: "stay_phone",
    label: "Ask them to stay on the phone",
    line: "Can you stay on the phone while I get to the door?",
    reply: "I am here. No rush.",
    effect: { support: 1.6, clarity: 1.2, flag: "callOpen" }
  },
  {
    id: "reschedule",
    label: "Ask about rescheduling",
    line: "I do not think today is the day.",
    reply: "That is allowed. We can make the morning smaller.",
    effect: { support: 1, clarity: 0.8, flag: "rescheduled" }
  }
];

const endings = {
  supported: {
    title: "Supported Morning",
    text: "The door opens after labels, lists, tea, a call, and the small patience of the room. Support did not erase uncertainty. It made the next step reachable.",
    points: [
      "Environmental cues can reduce cognitive load.",
      "Support can protect independence instead of replacing it.",
      "Care works best when it is calm, specific, and respectful."
    ]
  },
  independent: {
    title: "Quiet Independence",
    text: "You leave with the essentials gathered and the call short. The morning stays quiet, private, and possible.",
    points: [
      "Independence can include tools, habits, and preparation.",
      "A person can choose privacy while still deserving support.",
      "Routine can be a form of care."
    ]
  },
  callOpen: {
    title: "The Call Stays Open",
    text: "A familiar voice stays with you through the hallway. The apartment feels less wide when connection is allowed to remain.",
    points: [
      "Familiar voices can support orientation.",
      "Connection can reduce distress without taking control.",
      "Asking someone to stay nearby is a strength."
    ]
  },
  notToday: {
    title: "Not Today",
    text: "The appointment can move. The morning becomes smaller, warmer, and still worthy. Rest is not a failure state.",
    points: [
      "Plans can change without shame.",
      "Supported autonomy includes the choice to pause.",
      "Care should leave room for the person, not just the schedule."
    ]
  },
  unsteady: {
    title: "Unsteady But Moving",
    text: "The door opens with a few things still uncertain. The morning is imperfect, but it is held by notes, memory, and motion.",
    points: [
      "Memory and clarity can fluctuate.",
      "A difficult morning can still move forward.",
      "Gentle supports matter even when they do not solve everything."
    ]
  }
};

const initialState = () => ({
  screen: "menu",
  currentRoom: "bedroom",
  clarity: 6,
  support: 1,
  inventory: [],
  collectedObjects: [],
  completed: [],
  fragments: [],
  journal: [],
  supportPlaced: [],
  flags: {
    organizerConfirmed: false,
    teaMade: false,
    photoRebuilt: false,
    phoneUsed: false,
    askedHelp: false,
    deniedHelp: false,
    callOpen: false,
    rescheduled: false
  },
  puzzleChoices: {},
  puzzleAttempts: 0,
  reflections: [],
  endingId: null,
  settings: {
    largeText: false,
    highContrast: false,
    reducedMotion: false,
    plainLanguage: false,
    muteSound: false
  }
});

let state = initialState();

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

const els = {
  menuScreen: $("#menuScreen"),
  gameScreen: $("#gameScreen"),
  endingScreen: $("#endingScreen"),
  roomTitle: $("#roomTitle"),
  roomDescription: $("#roomDescription"),
  clarityLabel: $("#clarityLabel"),
  clarityMeter: $("#clarityMeter"),
  roomStage: $("#roomStage"),
  decorLayer: $("#decorLayer"),
  supportLayer: $("#supportLayer"),
  hotspotLayer: $("#hotspotLayer"),
  roomMap: $("#roomMap"),
  caption: $("#caption"),
  checklist: $("#checklist"),
  inventory: $("#inventory"),
  journalLog: $("#journalLog"),
  supportChoices: $("#supportChoices"),
  memoryEntries: $("#memoryEntries"),
  phoneChoices: $("#phoneChoices"),
  examineTitle: $("#examineTitle"),
  examineText: $("#examineText"),
  objectAct: $("#objectAct"),
  objectExamineMore: $("#objectExamineMore"),
  memoryPuzzleSlots: $("#memoryPuzzleSlots"),
  memoryPuzzleFeedback: $("#memoryPuzzleFeedback"),
  submitMemoryPuzzle: $("#submitMemoryPuzzle"),
  endingTitle: $("#endingTitle"),
  endingText: $("#endingText"),
  endingPoints: $("#endingPoints"),
  endingReflection: $("#endingReflection"),
  saveReflection: $("#saveReflection")
};

function init() {
  $("#newGame").addEventListener("click", newGame);
  $("#continueGame").addEventListener("click", continueGame);
  $("#openMemoryBookMenu").addEventListener("click", () => openModal("memoryBookModal"));
  $("#openMemoryBookGame").addEventListener("click", () => openModal("memoryBookModal"));
  $("#openAccessibility").addEventListener("click", () => openModal("accessibilityPanel"));
  $("#openCredits").addEventListener("click", () => openModal("creditsModal"));
  $("#openSupport").addEventListener("click", openSupport);
  $("#saveGame").addEventListener("click", () => {
    saveGame();
    writeJournal("Saved. The morning can wait here.");
  });
  $("#returnMenu").addEventListener("click", showMenu);
  $("#endingRestart").addEventListener("click", newGame);
  $("#endingBook").addEventListener("click", () => openModal("memoryBookModal"));
  $("#endingMenu").addEventListener("click", showMenu);
  els.submitMemoryPuzzle.addEventListener("click", submitMemoryPuzzle);
  els.saveReflection.addEventListener("click", saveReflection);

  $$("[data-close]").forEach((button) => {
    button.addEventListener("click", () => closeModal(button.dataset.close));
  });

  for (const key of Object.keys(state.settings)) {
    const input = $(`#${key}`);
    input.addEventListener("change", () => {
      state.settings[key] = input.checked;
      applySettings();
      saveGame();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      $$(".modal").forEach((modal) => modal.classList.add("hidden"));
    }
  });

  updateContinueButton();
  renderAll();
}

function newGame() {
  const settings = { ...state.settings };
  state = initialState();
  state.settings = settings;
  state.screen = "game";
  writeJournal("The morning begins in five small rooms.");
  showGame();
  saveGame();
}

function continueGame() {
  const saved = loadGame();
  if (!saved) return;
  state = saved;
  if (state.screen === "ending" && state.endingId) {
    showEnding(state.endingId);
  } else {
    showGame();
  }
}

function showMenu() {
  state.screen = "menu";
  els.menuScreen.classList.remove("hidden");
  els.gameScreen.classList.add("hidden");
  els.endingScreen.classList.add("hidden");
  updateContinueButton();
}

function showGame() {
  els.menuScreen.classList.add("hidden");
  els.gameScreen.classList.remove("hidden");
  els.endingScreen.classList.add("hidden");
  renderAll();
}

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  updateContinueButton();
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    return normalizeState(JSON.parse(raw));
  } catch {
    return null;
  }
}

function normalizeState(saved) {
  return {
    ...initialState(),
    ...saved,
    flags: { ...initialState().flags, ...(saved.flags || {}) },
    puzzleChoices: saved.puzzleChoices || {},
    reflections: saved.reflections || [],
    settings: { ...initialState().settings, ...(saved.settings || {}) }
  };
}

function updateContinueButton() {
  $("#continueGame").disabled = !localStorage.getItem(SAVE_KEY);
}

function openModal(id) {
  if (id === "memoryBookModal") renderMemoryBook();
  const modal = $(`#${id}`);
  modal.classList.remove("hidden");
  const focusable = modal.querySelector("button, input");
  if (focusable) focusable.focus();
}

function closeModal(id) {
  $(`#${id}`).classList.add("hidden");
}

function renderAll() {
  applySettings();
  renderRoomMap();
  renderRoom();
  renderChecklist();
  renderInventory();
  renderJournal();
  renderMemoryBook();
}

function applySettings() {
  for (const [key, value] of Object.entries(state.settings)) {
    document.body.classList.toggle(kebab(key), Boolean(value));
    const input = $(`#${key}`);
    if (input) input.checked = Boolean(value);
  }
}

function kebab(value) {
  return value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function currentClarityState() {
  if (state.supportPlaced.length > 0 || state.support >= 4) return "supported";
  if (state.clarity <= 3.2) return "softened";
  return "clear";
}

function roomText(room) {
  const clarity = currentClarityState();
  return room.descriptions[state.settings.plainLanguage ? "clear" : clarity] || room.descriptions.clear;
}

function renderRoomMap() {
  els.roomMap.innerHTML = `<span class="map-label">Apartment map</span>` + Object.entries(rooms).map(([id, room]) => `
    <button class="${id === state.currentRoom ? "active" : ""}" data-room="${id}" data-map-room="${id}" type="button">${room.nav}</button>
  `).join("");

  $$("#roomMap [data-room]").forEach((button) => {
    button.addEventListener("click", () => {
      state.currentRoom = button.dataset.room;
      soften(0.12);
      renderAll();
      saveGame();
    });
  });
}

function renderRoom() {
  const room = rooms[state.currentRoom];
  const clarity = currentClarityState();
  els.roomTitle.textContent = room.name;
  els.roomDescription.textContent = roomText(room);
  els.clarityLabel.textContent = {
    clear: "Grounding: clear",
    softened: "Grounding: softened",
    supported: "Grounding: supported"
  }[clarity];
  els.clarityMeter.style.width = `${(state.clarity / 6) * 100}%`;
  els.roomStage.dataset.room = state.currentRoom;
  els.roomStage.dataset.clarity = clarity;
  els.roomStage.classList.toggle("tea-made", state.flags.teaMade && state.currentRoom === "kitchen");
  els.roomStage.classList.toggle("voice-supported", state.flags.phoneUsed && state.currentRoom === "living");
  els.roomStage.classList.toggle("memory-rebuilt", state.flags.photoRebuilt && state.currentRoom === "living");
  els.roomStage.classList.toggle("ready-to-leave", state.completed.includes("leave") && state.currentRoom === "hallway");
  els.decorLayer.innerHTML = (roomDetailLayers[state.currentRoom] || []).map(renderDecorDetail).join("") + renderDynamicDetails();
  els.supportLayer.innerHTML = state.supportPlaced
    .filter((id) => supportTargets.find((target) => target.id === id)?.room === state.currentRoom)
    .map((id) => `<span class="support-note support-${id}">${supportTargets.find((target) => target.id === id).label} cue</span>`)
    .join("");
  els.hotspotLayer.innerHTML = room.objects.map((object) => renderHotspot(object, clarity)).join("");

  $$(".hotspot").forEach((button) => {
    button.addEventListener("click", () => openObjectPanel(button.dataset.object));
  });
}

function renderDynamicDetails() {
  const details = [];
  if (state.currentRoom === "kitchen" && state.flags.teaMade) {
    details.push({ type: "steam glow", label: "fresh tea steam", x: 60, y: 34, w: 20, h: 18 });
  }
  if (state.currentRoom === "living" && state.flags.phoneUsed) {
    details.push({ type: "radio glow", label: "voice still nearby", x: 58, y: 48, w: 22, h: 10 });
  }
  if (state.currentRoom === "living" && state.flags.photoRebuilt) {
    details.push({ type: "postcard spread", label: "photo memory settled", x: 35, y: 22, w: 24, h: 12 });
  }
  if (state.currentRoom === "hallway" && hasEssentials()) {
    details.push({ type: "door glow", label: "ready when you are", x: 70, y: 44, w: 18, h: 25 });
  }
  return details.map(renderDecorDetail).join("");
}

function renderDecorDetail(detail) {
  return `
    <span
      class="scene-detail ${detail.type.split(" ").map((part) => `detail-${slug(part)}`).join(" ")}"
      style="left:${detail.x}%;top:${detail.y}%;width:${detail.w}%;height:${detail.h}%;"
      aria-hidden="true"
    >
      ${detail.label}
    </span>
  `;
}

function renderHotspot(object, clarity) {
  const supported = state.supportPlaced.some((target) => object.id.includes(target));
  const labelState = supported ? "supported" : clarity;
  const label = object.labels[labelState] || object.labels.clear;
  const done = state.collectedObjects.includes(object.id) || isObjectComplete(object);
  const helpful = isHelpfulObject(object);
  return `
    <button class="hotspot ${done ? "done" : ""} ${helpful ? "helpful" : ""}" style="left:${object.x}%;top:${object.y}%;" data-object="${object.id}" type="button">
      <span>${label}</span>
    </button>
  `;
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function isObjectComplete(object) {
  return (
    (object.kind === "tea" && state.flags.teaMade) ||
    (object.kind === "medication" && state.completed.includes("medication")) ||
    (object.kind === "photo" && state.flags.photoRebuilt) ||
    (object.kind === "phone" && state.flags.phoneUsed)
  );
}

function isHelpfulObject(object) {
  const next = nextChecklistItem();
  if (!next || state.support < 3) return false;
  const helpful = {
    glasses: ["bedside_glasses"],
    tea: ["mug", "tea_tin", "kettle"],
    medication: ["pill_organizer", "medication_bottle"],
    photo: ["photo_frame", "postcard", "bedroom_window"],
    phone: ["phone"],
    leave: ["keys", "wallet", "appointment_card", "front_door"]
  };
  return helpful[next.id]?.includes(object.id);
}

function openObjectPanel(objectId) {
  const object = rooms[state.currentRoom].objects.find((item) => item.id === objectId);
  if (!object) return;
  const clarity = currentClarityState();
  const label = object.labels[clarity] || object.labels.clear;
  els.examineTitle.textContent = label;
  els.examineText.textContent = objectExamineText(object);
  els.objectAct.textContent = actionLabel(object);
  els.objectAct.onclick = () => {
    closeModal("examineModal");
    performObjectAction(objectId);
  };
  els.objectExamineMore.onclick = () => {
    writeJournal(object.text);
    setCaption(object.text);
    if (object.fragment) addFragment(object.fragment);
    ground(0.1);
    closeModal("examineModal");
    renderAll();
    saveGame();
  };
  playSound("page");
  openModal("examineModal");
}

function objectExamineText(object) {
  const next = nextChecklistItem();
  const extra = next && isHelpfulObject(object) ? " It feels connected to the next step." : "";
  const mode = currentClarityState() === "softened" ? "The object is present before it is fully named. " : "The room gives this object a small role. ";
  return `${mode}${object.text}${extra}`;
}

function actionLabel(object) {
  return {
    collect: object.item && hasItem(object.item) ? "Hold again" : "Take",
    inspect: "Notice",
    organizer: "Confirm organizer",
    tea: "Make tea",
    medication: "Take medication",
    photo: "Rebuild memory",
    phone: state.flags.phoneUsed ? "Review call" : "Use phone",
    leave: state.flags.rescheduled ? "Rest today" : "Try the door"
  }[object.kind] || "Interact";
}

function performObjectAction(objectId) {
  const object = rooms[state.currentRoom].objects.find((item) => item.id === objectId);
  if (!object) return;

  switch (object.kind) {
    case "collect":
      collectObject(object);
      break;
    case "inspect":
      inspectObject(object);
      break;
    case "organizer":
      confirmOrganizer(object);
      break;
    case "tea":
      makeTea(object);
      break;
    case "medication":
      takeMedication(object);
      break;
    case "photo":
      reconstructPhoto(object);
      break;
    case "phone":
      usePhone(object);
      break;
    case "leave":
      tryLeave(object);
      break;
    default:
      inspectObject(object);
  }

  renderAll();
  saveGame();
}

function collectObject(object) {
  if (state.collectedObjects.includes(object.id)) {
    writeJournal(afterText(object));
    setCaption(afterText(object));
    return;
  }

  state.collectedObjects.push(object.id);
  if (object.item) addItem(object.item);
  if (object.fragment) addFragment(object.fragment);
  writeJournal(object.text);
  setCaption(afterText(object));

  playSound(object.item || "collect");

  if (object.item === "glasses") {
    complete("glasses");
    ground(1.5);
  } else {
    ground(0.2);
  }
}

function inspectObject(object) {
  writeJournal(object.text);
  setCaption(object.text);
  if (object.fragment) addFragment(object.fragment);
  ground(0.2);
}

function confirmOrganizer(object) {
  state.flags.organizerConfirmed = true;
  addItem("pill_organizer");
  writeJournal(object.text);
  setCaption("Medication is not taken yet. The organizer has made the instruction clearer.");
  ground(0.5);
}

function makeTea(object) {
  if (state.flags.teaMade) {
    writeJournal("The mug is warm. The sequence has already become part of the morning.");
    return;
  }

  if (!hasItem("mug") || !hasItem("tea_bag")) {
    soften(0.45);
    gentlePause("The kettle waits for the mug and tea bag first.");
    return;
  }

  state.flags.teaMade = true;
  complete("tea");
  playSound("kettle");
  writeJournal(object.text);
  setCaption("Tea made: mug, tea bag, water, switch. The order is outside of memory now.");
  ground(0.9);
}

function takeMedication(object) {
  if (state.completed.includes("medication")) {
    writeJournal("The medication step is complete. The organizer stays on the counter as a quiet record.");
    return;
  }

  if (!state.flags.teaMade) {
    soften(0.5);
    gentlePause("The bottle is here, but the morning asks for tea first.");
    return;
  }

  if (!state.flags.organizerConfirmed) {
    soften(0.5);
    gentlePause("The organizer can confirm today before the bottle asks you to remember.");
    return;
  }

  complete("medication");
  playSound("confirm");
  writeJournal(object.text);
  setCaption("Medication confirmed with the organizer. A routine can be supported without shame.");
  ground(0.8);
}

function reconstructPhoto(object) {
  addItem("photo");
  if (!state.fragments.includes("mango")) addFragment("mango", false);

  const clues = ["mango", "blue_towel", "wind"].filter((id) => state.fragments.includes(id));
  if (state.flags.photoRebuilt) {
    writeJournal("Mom, beach, 2018. Mango tea. Blue towel. Wind in her hair.");
    setCaption("The photo stays assembled, but it still feels tender.");
    return;
  }

  if (clues.length < 2) {
    soften(0.35);
    writeJournal(object.text);
    setCaption("The photo is close. More clues in the apartment may help the memory gather.");
    return;
  }

  openMemoryPuzzle();
}

function openMemoryPuzzle() {
  els.memoryPuzzleSlots.innerHTML = Object.entries(memoryPuzzle.slots).map(([slot, options]) => `
    <label class="puzzle-slot">
      <span>${titleCase(slot)}</span>
      <select data-puzzle-slot="${slot}">
        <option value="">Choose...</option>
        ${options.map((option) => `<option value="${option}" ${state.puzzleChoices[slot] === option ? "selected" : ""}>${option}</option>`).join("")}
      </select>
    </label>
  `).join("");
  const hints = state.fragments.map((id) => memoryPuzzle.hintByFragment[id]).filter(Boolean);
  els.memoryPuzzleFeedback.textContent = hints.length ? `Clues gathered: ${hints.join(" ")}` : "The apartment has not offered many clues yet.";
  openModal("memoryPuzzleModal");
}

function submitMemoryPuzzle() {
  $$('[data-puzzle-slot]').forEach((select) => {
    state.puzzleChoices[select.dataset.puzzleSlot] = select.value;
  });
  const missing = Object.keys(memoryPuzzle.required).filter((slot) => !state.puzzleChoices[slot]);
  if (missing.length) {
    els.memoryPuzzleFeedback.textContent = "The memory needs every piece before it can settle.";
    soften(0.15);
    return;
  }
  const incorrect = Object.entries(memoryPuzzle.required).filter(([slot, value]) => state.puzzleChoices[slot] !== value);
  state.puzzleAttempts += 1;
  if (incorrect.length) {
    const gentle = incorrect.length > 2
      ? "That version feels like a different morning. The room offers the clues again without blame."
      : "Almost. One piece feels out of tune with the fragments you found.";
    els.memoryPuzzleFeedback.textContent = gentle;
    writeJournal(gentle);
    soften(0.25);
    renderAll();
    saveGame();
    return;
  }
  state.flags.photoRebuilt = true;
  complete("photo");
  playSound("memory");
  writeJournal("Mom at the beach, 2018. Mango tea, blue towel, wind in her hair. The name arrives gently.");
  setCaption("The memory is reconstructed from clues, not forced.");
  ground(1);
  closeModal("memoryPuzzleModal");
  renderAll();
  saveGame();
}

function titleCase(value) {
  return value.replace(/_/g, " ").replace(/\w/g, (letter) => letter.toUpperCase());
}

function usePhone(object) {
  if (!hasItem("phone")) {
    collectObject(object);
    setCaption("The phone is in your pocket. You can call when the memory is steadier.");
    return;
  }

  if (!state.completed.includes("photo")) {
    soften(0.3);
    gentlePause("The phone is ready. The photo memory may help the contact feel less abstract first.");
    return;
  }

  if (state.flags.phoneUsed) {
    writeJournal("The call has already helped shape the morning.");
    return;
  }

  openPhone();
}

function openPhone() {
  els.phoneChoices.innerHTML = phoneChoices.map((choice) => `
    <button type="button" data-phone="${choice.id}">
      <strong>${choice.label}</strong>
      <span>${choice.line}</span>
    </button>
  `).join("");
  openModal("phoneModal");
  $$("[data-phone]").forEach((button) => {
    button.addEventListener("click", () => choosePhone(button.dataset.phone));
  });
}

function choosePhone(choiceId) {
  const choice = phoneChoices.find((item) => item.id === choiceId);
  if (!choice) return;
  state.flags.phoneUsed = true;
  state.flags[choice.effect.flag] = true;
  complete("phone");
  state.support = clamp(state.support + choice.effect.support, 1, 6);
  state.clarity = clamp(state.clarity + choice.effect.clarity, 1, 6);
  addFragment("voice");
  writeJournal(`You say: "${choice.line}"`);
  writeJournal(choice.reply);
  if (choice.id === "ask_help") writeJournal("Later, the hallway will allow one extra reminder before the door.");
  if (choice.id === "deny_help") writeJournal("The journal becomes quieter. Privacy remains a valid form of dignity.");
  if (choice.id === "reschedule") writeJournal("The goal changes: today can be made safe for rest instead of leaving.");
  playSound("voice");
  setCaption("The call becomes a support cue, not a test.");
  closeModal("phoneModal");
  renderAll();
  saveGame();
}

function tryLeave(object) {
  const needed = ["keys", "wallet", "phone", "appointment_card"];
  const missing = needed.filter((item) => !hasItem(item));

  if (state.flags.rescheduled) {
    showEnding("notToday");
    return;
  }

  if (missing.length > 0) {
    soften(0.55);
    if (state.flags.askedHelp) {
      const reminder = `The familiar voice names the next item gently: ${itemData[missing[0]].name}.`;
      writeJournal(reminder);
      setCaption(reminder);
    } else {
      gentlePause(`The door waits. Still missing: ${missing.map((item) => itemData[item].name).join(", ")}.`);
    }
    return;
  }

  complete("leave");
  showEnding(selectEnding());
}

function selectEnding() {
  if (state.flags.callOpen) return "callOpen";
  if (state.supportPlaced.length >= 3 || state.flags.askedHelp) return "supported";
  if (state.flags.deniedHelp && state.clarity >= 3.4) return "independent";
  if (state.clarity < 3.2) return "unsteady";
  return "independent";
}

function showEnding(id) {
  const ending = endings[id] || endings.unsteady;
  state.endingId = id;
  els.menuScreen.classList.add("hidden");
  els.gameScreen.classList.add("hidden");
  els.endingScreen.classList.remove("hidden");
  els.endingTitle.textContent = ending.title;
  els.endingText.textContent = ending.text;
  els.endingPoints.innerHTML = ending.points.map((point) => `<li>${point}</li>`).join("");
  state.screen = "ending";
  if (els.endingReflection) els.endingReflection.value = "";
  saveMorningRecord(id);
  saveGame();
}

function hasEssentials() {
  return ["keys", "wallet", "phone", "appointment_card"].every(hasItem);
}

function saveMorningRecord(endingId) {
  const records = loadMorningRecords();
  const signature = `${endingId}-${state.completed.join("/")}-${state.fragments.join("/")}-${state.supportPlaced.join("/")}`;
  if (records.some((record) => record.signature === signature)) return;
  const ending = endings[endingId] || endings.unsteady;
  records.unshift({
    signature,
    endingId,
    title: ending.title,
    date: new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }),
    supportCount: state.supportPlaced.length,
    fragments: state.fragments.length,
    phoneChoice: phoneChoices.find((choice) => state.flags[choice.effect.flag])?.label || "No call choice",
    clarity: Math.round(state.clarity * 10) / 10
  });
  localStorage.setItem(HISTORY_KEY, JSON.stringify(records.slice(0, 8)));
}

function loadMorningRecords() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveReflection() {
  const text = (els.endingReflection.value || "").trim();
  if (!text) {
    setCaption("The reflection box is empty. A blank pause can count too.");
    return;
  }
  state.reflections.unshift({ text, date: new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }) });
  state.reflections = state.reflections.slice(0, 6);
  writeJournal(`Reflection saved: ${text}`);
  els.endingReflection.value = "";
  saveGame();
  renderMemoryBook();
}

function addItem(itemId) {
  if (!state.inventory.includes(itemId)) {
    state.inventory.push(itemId);
  }
}

function hasItem(itemId) {
  return state.inventory.includes(itemId);
}

function addFragment(fragmentId, announce = true) {
  if (!memoryFragments[fragmentId] || state.fragments.includes(fragmentId)) return;
  state.fragments.push(fragmentId);
  playSound("fragment");
  if (announce) writeJournal(`Memory fragment added: ${memoryFragments[fragmentId].title}.`);
}

function complete(id) {
  if (!state.completed.includes(id)) {
    state.completed.push(id);
  }
}

function nextChecklistItem() {
  return checklist.find((item) => !state.completed.includes(item.id));
}

function gentlePause(text) {
  const lines = [
    "A pause. The room waits with you.",
    "This matters, just not yet.",
    "The order slips sideways for a moment.",
    "Nothing is wrong with needing the cue."
  ];
  writeJournal(lines[Math.floor(Math.random() * lines.length)]);
  setCaption(text);
}

function ground(amount) {
  state.clarity = clamp(state.clarity + amount, 1, 6);
}

function soften(amount) {
  state.clarity = clamp(state.clarity - amount, 1, 6);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function afterText(object) {
  return object.after || object.text || "The object stays where it is, a little clearer now.";
}

function setCaption(text) {
  els.caption.textContent = text;
}

function writeJournal(text) {
  if (!text) return;
  state.journal.unshift(text);
  state.journal = state.journal.slice(0, 24);
}

function renderChecklist() {
  els.checklist.innerHTML = checklist.map((item) => {
    const done = state.completed.includes(item.id);
    const current = !done && nextChecklistItem()?.id === item.id;
    return `<li class="${done ? "done" : ""} ${current ? "current" : ""}">${item.label}</li>`;
  }).join("");
}

function renderInventory() {
  const slots = Array.from({ length: 10 }, (_, index) => state.inventory[index] || null);
  els.inventory.innerHTML = slots.map((itemId) => {
    if (!itemId) return `<span class="slot empty">empty</span>`;
    const item = itemData[itemId];
    return `<span class="slot filled" title="${item.name}"><b>${item.icon}</b>${item.name}</span>`;
  }).join("");
}

function renderJournal() {
  els.journalLog.innerHTML = state.journal.length
    ? state.journal.map((line) => `<p class="entry">${line}</p>`).join("")
    : `<p class="entry">Journal entries will gather here as you move through the morning.</p>`;
}

function renderMemoryBook() {
  const entries = state.fragments.map((id) => memoryFragments[id]).filter(Boolean);
  const fragmentHtml = entries.length
    ? entries.map((entry) => `
      <article class="memory-entry">
        <span>${entry.room}</span>
        <h3>${entry.title}</h3>
        <p>${state.settings.plainLanguage ? plainMemory(entry.text) : entry.text}</p>
      </article>
    `).join("")
    : `<p>No fragments collected yet. They will appear as small details return to the morning.</p>`;

  const careHtml = state.endingId ? `
    <article class="memory-entry memory-entry-wide">
      <span>Care notes unlocked</span>
      <h3>What help looked like</h3>
      ${careNotes.map((note) => `<p><strong>${note.title}:</strong> ${note.text}</p>`).join("")}
    </article>
  ` : "";

  const recordHtml = loadMorningRecords().length ? `
    <article class="memory-entry memory-entry-wide">
      <span>Morning records</span>
      <h3>Previous routes</h3>
      ${loadMorningRecords().map((record) => `
        <p><strong>${record.title}</strong> (${record.date}) — fragments: ${record.fragments}, supports: ${record.supportCount}, call: ${record.phoneChoice}, grounding: ${record.clarity}/6.</p>
      `).join("")}
    </article>
  ` : "";

  const reflectionHtml = state.reflections.length ? `
    <article class="memory-entry memory-entry-wide">
      <span>Reflections</span>
      <h3>Player notes</h3>
      ${state.reflections.map((reflection) => `<p><strong>${reflection.date}:</strong> ${reflection.text}</p>`).join("")}
    </article>
  ` : "";

  els.memoryEntries.innerHTML = fragmentHtml + careHtml + recordHtml + reflectionHtml;
}

function plainMemory(text) {
  return text
    .replace("The scent reaches the memory before the date does.", "A smell helps bring back part of a memory.")
    .replace("The photo memory finds wind before it finds the year.", "A sensory clue helps the photo feel clearer.")
    .replace("It does not argue. It simply waits.", "It gives a clear reminder without pressure.");
}

function openSupport() {
  els.supportChoices.innerHTML = supportTargets.map((target) => {
    const placed = state.supportPlaced.includes(target.id);
    return `
      <button type="button" data-support-target="${target.id}" ${placed ? "disabled" : ""}>
        <strong>${placed ? "Placed: " : ""}${target.label}</strong>
        <span>${target.text}</span>
      </button>
    `;
  }).join("");

  openModal("supportModal");
  $$("[data-support-target]").forEach((button) => {
    button.addEventListener("click", () => placeSupport(button.dataset.supportTarget));
  });
}

function placeSupport(targetId) {
  if (!state.supportPlaced.includes(targetId)) {
    state.supportPlaced.push(targetId);
    state.support = clamp(state.support + 1, 1, 6);
    ground(0.8);
    const target = supportTargets.find((item) => item.id === targetId);
    playSound("support");
    writeJournal(target.text);
    setCaption("Support placed. The room becomes easier to read, without pretending the morning is solved.");
  }
  closeModal("supportModal");
  renderAll();
  saveGame();
}

let audioContext;
function playSound(name) {
  if (state.settings.muteSound) return;
  try {
    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    const tones = {
      kettle: [392, 523],
      memory: [523, 659, 784],
      voice: [220, 277],
      support: [440, 587],
      fragment: [330, 440],
      confirm: [294, 392],
      page: [196],
      collect: [262, 330],
      keys: [784, 988],
      wallet: [220],
      phone: [330, 415],
      glasses: [330, 392]
    };
    const sequence = tones[name] || tones.collect;
    sequence.forEach((frequency, index) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.035, audioContext.currentTime + index * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + index * 0.08 + 0.18);
      osc.connect(gain).connect(audioContext.destination);
      osc.start(audioContext.currentTime + index * 0.08);
      osc.stop(audioContext.currentTime + index * 0.08 + 0.2);
    });
  } catch {
    // Audio is optional; the game remains fully playable without it.
  }
}

window.softRecallTrailer = {
  async run() {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    $("#newGame").click();
    await wait(1200);
    await trailerClick("bedside_glasses", 1500);
    await trailerRoom("kitchen", 800);
    await trailerClick("mug", 900);
    await trailerClick("tea_tin", 900);
    await trailerClick("kettle", 1300);
    $("#openSupport").click();
    await wait(500);
    $('[data-support-target="kettle"]').click();
    await wait(1300);
    await trailerRoom("bathroom", 800);
    await trailerClick("pill_organizer", 1000);
    await trailerRoom("kitchen", 700);
    await trailerClick("medication_bottle", 1200);
    await trailerRoom("living", 700);
    await trailerClick("postcard", 900);
    await trailerClick("photo_frame", 500);
    await trailerPuzzle();
    await wait(800);
    await trailerClick("phone", 700);
    await trailerClick("phone", 900);
    $('[data-phone="stay_phone"]').click();
    await wait(1600);
    await trailerRoom("hallway", 700);
    await trailerClick("keys", 700);
    await trailerClick("appointment_card", 700);
    await trailerClick("hall_note", 700);
    await wait(9000);
  }
};

async function trailerPuzzle() {
  if ($("#memoryPuzzleModal").classList.contains("hidden")) return;
  const choices = { person: "Mom", place: "Beach", anchor: "Mango tea", detail: "Blue towel and wind" };
  Object.entries(choices).forEach(([slot, value]) => {
    const select = $(`[data-puzzle-slot="${slot}"]`);
    if (select) select.value = value;
  });
  $("#submitMemoryPuzzle").click();
}

async function trailerRoom(roomId, delay) {
  $(`#roomMap [data-room="${roomId}"]`).click();
  await new Promise((resolve) => setTimeout(resolve, delay));
}

async function trailerClick(objectId, delay) {
  const button = $(`[data-object="${objectId}"]`);
  if (button) button.click();
  await new Promise((resolve) => setTimeout(resolve, 150));
  if (!$("#examineModal").classList.contains("hidden")) {
    $("#objectAct").click();
  }
  await new Promise((resolve) => setTimeout(resolve, delay));
}

init();
