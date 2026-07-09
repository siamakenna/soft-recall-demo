const SAVE_KEY = "softRecallFiveRoomsSave";

const symptomDomains = {
  memory: "memory",
  language: "language",
  visuospatial: "visuospatial",
  executiveFunction: "executive function",
  motor: "motor",
  recognition: "recognition",
  grounding: "grounding",
  overload: "overload",
  dread: "dread"
};

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
  photo: { name: "photo", icon: "IM" },
  laptop: { name: "laptop", icon: "LP" },
  earbuds: { name: "earbuds", icon: "EB" },
  transit_card: { name: "transit card", icon: "TC" },
  tote_bag: { name: "tote bag", icon: "TO" },
  sneakers: { name: "sneakers", icon: "SN" }
};

const checklist = [
  { id: "glasses", label: "Find glasses" },
  { id: "phone", label: "Use the phone" },
  { id: "leave", label: "Reach the door with one support cue" }
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
  },
  song_basil: {
    title: "The basil song",
    room: "Living Room",
    text: "The song you played while watering the basil finds the memory before the facts do."
  },
  half_text: {
    title: "Half-written text",
    room: "Bedroom",
    text: "A half-written text still means love, even before the right words arrive."
  },
  tote: {
    title: "Tote by the door",
    room: "Hallway",
    text: "The tote bag waits near the sneakers, ordinary and loyal, already pointed toward outside."
  },
  circled_twice: {
    title: "Circled twice",
    room: "Kitchen",
    text: "The appointment square is circled twice: once for remembering, once for admitting it matters."
  },
  hard_mornings: {
    title: "For hard mornings",
    room: "Bedroom",
    text: "A voice memo labeled 'for hard mornings' says: no rush, I am here."
  },
  basil_window: {
    title: "Basil at the window",
    room: "Kitchen",
    text: "The plant remembers the window better than you do today, green leaves turning toward light."
  },
  hallway_shadow: {
    title: "Hallway shadow",
    room: "Hallway",
    text: "The hallway grew teeth only in the shadow. When the light changed, it became a hallway again."
  },
  late_name: {
    title: "The late name",
    room: "Bathroom",
    text: "The name came back after the feeling. Recognition did not fail; it took a different road."
  }
};

const supportStyles = {
  direct: {
    label: "Direct reminder",
    example: "Keys by the door.",
    effect: { support: 1.1, clarity: 0.7, dread: -0.2, overload: -0.25 },
    note: "Direct reminder chosen. The cue is plain, fast, and practical."
  },
  gentle: {
    label: "Gentle cue",
    example: "What do you usually take with you?",
    effect: { support: 0.9, clarity: 0.55, dread: -0.35, overload: -0.15 },
    note: "Gentle cue chosen. The room offers a question instead of a correction."
  },
  environmental: {
    label: "Environmental support",
    example: "Tray, color cue, object placement.",
    effect: { support: 1.25, clarity: 0.8, dread: -0.25, overload: -0.4 },
    note: "Environmental support chosen. The apartment carries part of the sequence."
  },
  relational: {
    label: "Relational support",
    example: "Text or call from someone trusted.",
    effect: { support: 1.1, clarity: 0.65, dread: -0.55, overload: -0.2 },
    note: "Relational support chosen. Care stays present without taking over."
  },
  self: {
    label: "Self-support",
    example: "Breath, pause, music, one next step.",
    effect: { support: 0.8, clarity: 0.55, dread: -0.45, overload: -0.3 },
    note: "Self-support chosen. The protagonist keeps authorship of the next step."
  }
};

const rooms = {
  bedroom: {
    name: "Bedroom",
    nav: "Bedroom",
    descriptions: {
      clear: "A soft quilt, slippers, and pale morning light. The room knows the first step: glasses.",
      softened: "The room is familiar, but its edges arrive late. The bed is a shape, the table a maybe-place.",
      fragmented: "The bed is here, the laptop is here, the text you started is here. The order between them is missing.",
      supported: "The bedside label and steady light make the first step easier to hold.",
      uncanny: "A voice memo waits on the phone like a message from a version of you who knew this would happen.",
      dread: "The room is warm, but the unread text makes the morning feel watched by its own future."
    },
    decor: ["bed", "window", "blanket", "sneakers", "small lamp", "laptop"],
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
      },
      {
        id: "phone",
        item: "phone",
        kind: "phone",
        x: 58,
        y: 49,
        labels: { clear: "phone", softened: "small bright demand", supported: "phone - one reply" },
        text: "The phone is warm from its own waiting. One message can be smaller than the whole morning.",
        after: "The phone is in your pocket. The sentence does not have to be perfect."
      },
      {
        id: "unread_texts",
        kind: "group_chat",
        x: 58,
        y: 49,
        labels: { clear: "unread texts", softened: "little bright demands", supported: "texts - reply simply" },
        text: "The group chat has moved on without you: five messages, one photo, one question you may have already answered.",
        fragment: "half_text"
      },
      {
        id: "voice_memo",
        kind: "voice_memo",
        x: 78,
        y: 38,
        labels: { clear: "voice memo", softened: "for hard mornings", supported: "voice memo - play" },
        text: "A recording labeled 'for hard mornings' waits with your own name in someone else's gentle voice.",
        fragment: "hard_mornings"
      },
      {
        id: "laptop",
        item: "laptop",
        kind: "laptop",
        x: 66,
        y: 66,
        labels: { clear: "laptop", softened: "work light", supported: "laptop - one sentence" },
        text: "A half-finished research note is open. The cursor blinks like it expects continuity."
      }
    ]
  },
  bathroom: {
    name: "Bathroom",
    nav: "Bathroom",
    descriptions: {
      clear: "The sink is clean, the mirror is fogged at the edges, and the pill organizer waits by the towel.",
      softened: "White tile, reflected light, small containers. The labels are close, then farther away.",
      fragmented: "Light bounces from tile to mirror to bottle. The face arrives in pieces before it becomes yours.",
      supported: "A plain label near the organizer gives the medication step a gentle order.",
      uncanny: "The mirror is not wrong. It is only too accurate for a morning that feels uncertain.",
      dread: "The bathroom light is too bright, and every small container seems to ask if you already did this."
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
      fragmented: "Mug, tea, bottle, basil, alert. Too many objects have a job at once.",
      supported: "The kettle label and checklist hold the order outside of memory.",
      uncanny: "The appointment is circled twice. You do not remember doing it twice.",
      dread: "The kitchen is warmer than the rest of the apartment, as if the room kept boiling after the kettle stopped."
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
        text: "Today has a small circle around it. Appointment, 9:30. There is a second circle, darker, almost impatient.",
        fragment: "circled_twice"
      },
      {
        id: "plant_shelf",
        kind: "plant",
        x: 35,
        y: 24,
        labels: { clear: "basil plant", softened: "green responsibility", supported: "basil - window water" },
        text: "The basil leans toward the window. The plant does not need a perfect morning, only water.",
        fragment: "basil_window"
      },
      {
        id: "calendar_alert",
        kind: "inspect",
        x: 88,
        y: 41,
        labels: { clear: "calendar alert", softened: "small alarm", supported: "alert - 9:30" },
        text: "A phone alert says: appointment in 45 minutes. Under it: ask one question at a time."
      }
    ]
  },
  living: {
    name: "Living Room",
    nav: "Living",
    descriptions: {
      clear: "A couch, low table, photo frame, phone, and postcards. The room holds relationship.",
      softened: "Faces feel close but unnamed. The room is tender, not empty.",
      fragmented: "Photo, song, postcard, project. Feeling knows the room before facts do.",
      supported: "Labels, music, and the phone contact make the room easier to ask for help in.",
      uncanny: "The playlist starts on a song you do not remember choosing, but your chest recognizes the first note.",
      dread: "The couch is safe and too deep. If you sit down, the morning might become a room you cannot leave."
    },
    decor: ["couch", "rug", "bookshelf", "playlist", "photo wall", "creative project"],
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
      },
      {
        id: "playlist",
        item: "earbuds",
        kind: "playlist",
        x: 58,
        y: 72,
        labels: { clear: "playlist", softened: "song thread", supported: "playlist - grounding song" },
        text: "The playlist is still open. Track three has a star beside it and no explanation.",
        fragment: "song_basil"
      },
      {
        id: "creative_project",
        kind: "laptop",
        x: 84,
        y: 63,
        labels: { clear: "creative project", softened: "unfinished bright thing", supported: "project - one sentence" },
        text: "A half-finished zine page waits on the table. It still looks like your taste, even when the next step is missing."
      }
    ]
  },
  hallway: {
    name: "Hallway/Doorway",
    nav: "Doorway",
    descriptions: {
      clear: "Keys, shoes, appointment card, and the door. The outside begins here.",
      softened: "The hall narrows into objects with jobs. Some are named, some are only important.",
      fragmented: "The hallway is longer than the apartment should allow. The door stays visible and not quite reachable.",
      supported: "The door label, note, and checklist make leaving feel possible without rushing.",
      uncanny: "The same note appears twice, almost the same: keys wallet phone card. keys phone card wallet.",
      dread: "Outside is not danger. Outside is the question of whether the morning will hold together in public."
    },
    decor: ["coat hook", "sneakers", "door", "letters", "small table", "tote bag"],
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
        id: "transit_card",
        item: "transit_card",
        kind: "collect",
        x: 38,
        y: 66,
        labels: { clear: "transit card", softened: "tap card", supported: "transit card - front pocket" },
        text: "The transit card is in the wrong pocket and then the right one. You keep it where your hand will look first."
      },
      {
        id: "sneakers",
        item: "sneakers",
        kind: "collect",
        x: 18,
        y: 72,
        labels: { clear: "sneakers", softened: "outside shoes", supported: "sneakers - by mat" },
        text: "The sneakers are scuffed at the toes. They look like a life that keeps moving."
      },
      {
        id: "tote_bag",
        item: "tote_bag",
        kind: "collect",
        x: 72,
        y: 70,
        labels: { clear: "tote bag", softened: "canvas thing", supported: "tote - appointment papers" },
        text: "The tote has a pen, a receipt, and a joke pin from a friend. It is not a medical bag. It is yours.",
        fragment: "tote"
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
  { id: "calendar", label: "Calendar", room: "kitchen", text: "The appointment day is marked in large print." },
  { id: "laptop", label: "Laptop", room: "bedroom", text: "A one-sentence project cue appears beside the laptop." },
  { id: "playlist", label: "Playlist", room: "living", text: "The grounding song is pinned to the top of the playlist." },
  { id: "plant", label: "Plant shelf", room: "kitchen", text: "A small water cue appears by the basil." },
  { id: "transit", label: "Transit", room: "hallway", text: "Transit card, tote, and sneakers move into one visible leaving tray." }
];

const inspectionData = {
  bedside_glasses: {
    title: "Glasses",
    visual: "glasses",
    note: "Observation: sensory support improves orientation.",
    look: "The frames are exactly where a past version of you put them.",
    question: "For a moment the word comes late: the thing for seeing. Then: glasses."
  },
  mirror: {
    title: "Mirror",
    visual: "mirror",
    note: "Observation: recognition may begin as feeling before certainty.",
    look: "The face is yours, and also arriving in pieces: eyes, mouth, expression, morning.",
    question: "Choose what feels true: I know this face. I know this feeling. Not today."
  },
  pill_organizer: {
    title: "Pill organizer",
    visual: "organizer",
    note: "Observation: external cue reduced medication uncertainty.",
    look: "The Tuesday compartment is a small square of evidence.",
    question: "Memory alone feels slippery here. The organizer can answer without blame."
  },
  medication_bottle: {
    title: "Medication bottle",
    visual: "bottle",
    note: "Observation: medication uncertainty increased until an external cue was used.",
    look: "The label is legible, then too full of instructions. The organizer makes it smaller.",
    question: "You compare bottle, day, and tea. The routine asks for sequence, not courage."
  },
  kettle: {
    title: "Kettle",
    visual: "kettle",
    note: "Observation: sequencing support helped executive load.",
    look: "Mug. Tea bag. Water. Switch. The order is simple when it stays visible.",
    question: "Steam curls up like a reminder you can smell."
  },
  calendar: {
    title: "Calendar",
    visual: "calendar",
    note: "Observation: date cue improved appointment orientation.",
    look: "Numbers reorder when you stare too long. One small circle keeps the day in place.",
    question: "The appointment note is not a verdict. It is only a plan."
  },
  photo_frame: {
    title: "Photo",
    visual: "photo",
    note: "Observation: sensory anchors supported memory reconstruction.",
    look: "The image is warm before it is named.",
    question: "Mango. Blue towel. Wind. The person returns through pieces."
  },
  postcard: {
    title: "Postcard",
    visual: "postcard",
    note: "Observation: color cue supported autobiographical memory.",
    look: "A blue towel repeats the shape in the photo.",
    question: "The clue does not demand perfect recall. It offers a path."
  },
  phone: {
    title: "Phone",
    visual: "phone",
    note: "Observation: familiar voice reduced distress and supported orientation.",
    look: "The contact photo is small, but it gives the voice a place to stand.",
    question: "You can ask for help, ask for company, or keep the morning private."
  },
  unread_texts: {
    title: "Unread texts",
    visual: "phone",
    note: "Clinical: expressive language and confidence fluctuated in group chat. Human: you knew the care before you knew the phrasing.",
    look: "The group chat says: 'Still on for later?' You remember the warmth before the plan.",
    question: "The reply can be small. A whole self can fit inside one honest sentence."
  },
  voice_memo: {
    title: "Voice memo",
    visual: "phone",
    note: "Clinical: relational cue lowered dread during disorientation. Human: someone believed you before the room did.",
    look: "The memo is labeled 'for hard mornings.' The voice says, 'No rush. I'm here.'",
    question: "It is strange to need a message from before. It is also a kindness you accepted."
  },
  laptop: {
    title: "Laptop",
    visual: "laptop",
    note: "Clinical: executive sequencing slowed near a familiar project. Human: the work still looked like yours.",
    look: "The cursor blinks in a research note. The next step is missing, but the curiosity is still present.",
    question: "You can close it, write one sentence, set a reminder, or ask for one question at a time."
  },
  calendar_alert: {
    title: "Calendar alert",
    visual: "calendar",
    note: "Clinical: time cue increased pressure and orientation at once. Human: the alert helped and hurt.",
    look: "Appointment in 45 minutes. Under it: 'Ask one question at a time.'",
    question: "The alert is not a command. It is information you can reshape."
  },
  plant_shelf: {
    title: "Basil plant",
    visual: "plant",
    note: "Clinical: simple responsibility supported grounding. Human: the plant only asked for water.",
    look: "Leaves turn toward the window. They remember light with their whole bodies.",
    question: "Care can be small enough to complete."
  },
  playlist: {
    title: "Playlist",
    visual: "playlist",
    note: "Clinical: recognition improved with auditory cueing. Human: the song found the memory before the facts did.",
    look: "Track three begins with a soft pulse. Your shoulders know it before your mind explains it.",
    question: "The song is either a clue or a comfort. This morning, it can be both."
  },
  creative_project: {
    title: "Creative project",
    visual: "laptop",
    note: "Clinical: task initiation improved when the next action became smaller. Human: one sentence counted.",
    look: "A half-finished zine page waits, messy and alive. It does not look like illness. It looks like taste.",
    question: "You can leave it unfinished without letting it become evidence against you."
  },
  keys: {
    title: "Keys",
    visual: "keys",
    note: "Observation: fine-motor hesitation noted near departure sequence.",
    look: "Metal against palm. A slight hesitation before the grip settles.",
    question: "The keys are not lost. Your hand simply takes an extra second."
  },
  front_door: {
    title: "Doorway",
    visual: "door",
    note: "Observation: spatial support improved threshold sequence.",
    look: "The hall feels longer when the next step is too wide.",
    question: "Door, keys, wallet, phone, card. A threshold, not a test."
  },
  transit_card: {
    title: "Transit card",
    visual: "card",
    note: "Clinical: object placement reduced departure load. Human: your hand needs a place to look.",
    look: "A chipped corner, a transit logo, enough fare. The city is abstract until the card is in your palm.",
    question: "Outside can be divided into smaller doors."
  },
  sneakers: {
    title: "Sneakers",
    visual: "sneakers",
    note: "Clinical: motor planning stabilized through familiar routine. Human: the shoes remembered the route.",
    look: "The laces are already loose enough. Past-you made this easier.",
    question: "Autonomy sometimes looks like leaving a knot half-ready."
  },
  tote_bag: {
    title: "Tote bag",
    visual: "tote",
    note: "Clinical: gathered objects reduced executive load. Human: this is not a medical bag; it is a life bag.",
    look: "A pen, receipt, lip balm, appointment papers, and a joke pin. The tote is proof of a current life.",
    question: "The bag carries the day without defining you."
  }
};

const memoryBookSections = [
  { id: "fragments", label: "Fragments" },
  { id: "messages", label: "Messages" },
  { id: "selfMonitoring", label: "Self-Monitoring" },
  { id: "reflections", label: "Reflections" }
];

const roomDetailLayers = {
  bedroom: [
    { type: "wallpaper floral", label: "faded floral wallpaper", x: 4, y: 4, w: 28, h: 33 },
    { type: "arched-window ivy", label: "arched window with ivy", x: 66, y: 6, w: 24, h: 25 },
    { type: "quilt patchwork", label: "patchwork quilt", x: 11, y: 50, w: 30, h: 17 },
    { type: "poster moon", label: "moon print", x: 45, y: 9, w: 12, h: 17 },
    { type: "stack books", label: "bedside books", x: 42, y: 44, w: 13, h: 10 },
    { type: "laptop glow", label: "open laptop", x: 60, y: 58, w: 20, h: 12 },
    { type: "phone texts", label: "unread texts", x: 54, y: 42, w: 12, h: 9 },
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
    { type: "plant shelf", label: "basil shelf", x: 31, y: 18, w: 14, h: 18 },
    { type: "phone alert", label: "calendar alert", x: 82, y: 38, w: 12, h: 10 },
    { type: "steam curls", label: "steam curls", x: 65, y: 31, w: 18, h: 23 },
    { type: "calendar bold", label: "circled date", x: 8, y: 31, w: 17, h: 12 }
  ],
  living: [
    { type: "comic panels", label: "small comic panels", x: 5, y: 7, w: 28, h: 28 },
    { type: "couch shadow", label: "deep couch shadow", x: 9, y: 58, w: 36, h: 18 },
    { type: "record sleeves", label: "record sleeves", x: 68, y: 8, w: 22, h: 22 },
    { type: "earbuds playlist", label: "earbuds playlist", x: 52, y: 65, w: 17, h: 10 },
    { type: "laptop project", label: "zine project", x: 78, y: 54, w: 16, h: 13 },
    { type: "postcard spread", label: "postcard spread", x: 18, y: 38, w: 22, h: 13 },
    { type: "moon lamp", label: "moon lamp", x: 55, y: 21, w: 13, h: 17 },
    { type: "plant shelf", label: "plant shelf", x: 72, y: 60, w: 18, h: 17 },
    { type: "radio glow", label: "radio glow", x: 43, y: 61, w: 19, h: 12 }
  ],
  hallway: [
    { type: "blue arch", label: "blue hallway arch", x: 4, y: 4, w: 31, h: 54 },
    { type: "coat silhouette", label: "coat silhouette", x: 20, y: 18, w: 17, h: 32 },
    { type: "key hooks", label: "key hooks", x: 25, y: 45, w: 19, h: 10 },
    { type: "sneakers mat", label: "sneakers", x: 12, y: 70, w: 20, h: 10 },
    { type: "transit card", label: "transit card", x: 36, y: 65, w: 12, h: 8 },
    { type: "tote bag", label: "tote bag", x: 68, y: 65, w: 16, h: 14 },
    { type: "door chain", label: "door chain", x: 70, y: 29, w: 16, h: 10 },
    { type: "notice board", label: "notice board", x: 46, y: 9, w: 20, h: 23 },
    { type: "letter stack", label: "letter stack", x: 42, y: 58, w: 24, h: 13 },
    { type: "ink curve", label: "soft ink shadow", x: 63, y: 62, w: 31, h: 22 }
  ]
};

const firstPersonScenes = {
  bedroom: {
    parts: [
      { cls: "scene-window bedroom-window", x: 67, y: 8, w: 20, h: 31 },
      { cls: "scene-poster bedroom-poster", x: 40, y: 9, w: 13, h: 23 },
      { cls: "scene-mirror bedroom-mirror", x: 7, y: 17, w: 16, h: 42 },
      { cls: "scene-shelf bedroom-shelf", x: 57, y: 29, w: 27, h: 8 },
      { cls: "scene-table bedside-table", x: 46, y: 49, w: 29, h: 25 },
      { cls: "scene-bed quilt-foreground", x: -6, y: 66, w: 58, h: 34 },
      { cls: "scene-object object-bedside_glasses", x: 55, y: 57, w: 11, h: 8 },
      { cls: "scene-object object-unread_texts", x: 64, y: 55, w: 12, h: 12 },
      { cls: "scene-object object-bedroom_note", x: 50, y: 65, w: 15, h: 9 },
      { cls: "scene-object object-voice_memo", x: 72, y: 42, w: 9, h: 14 },
      { cls: "scene-object object-laptop", x: 71, y: 70, w: 22, h: 13 }
    ]
  },
  bathroom: {
    parts: [
      { cls: "scene-tile bathroom-tile", x: 0, y: 0, w: 100, h: 70 },
      { cls: "scene-mirror bathroom-mirror", x: 27, y: 10, w: 37, h: 43 },
      { cls: "bathroom-light", x: 36, y: 4, w: 20, h: 6 },
      { cls: "scene-cabinet bathroom-cabinet", x: 72, y: 15, w: 17, h: 31 },
      { cls: "scene-towel bathroom-towel", x: 70, y: 53, w: 20, h: 12 },
      { cls: "scene-counter bathroom-counter", x: 8, y: 62, w: 84, h: 27 },
      { cls: "scene-sink bathroom-sink", x: 35, y: 66, w: 29, h: 15 },
      { cls: "scene-object object-pill_organizer", x: 61, y: 61, w: 17, h: 8 },
      { cls: "scene-object object-bathroom_cabinet", x: 77, y: 25, w: 9, h: 17 },
      { cls: "scene-object object-mirror", x: 46, y: 31, w: 16, h: 22 }
    ]
  },
  kitchen: {
    parts: [
      { cls: "scene-window kitchen-window", x: 60, y: 8, w: 24, h: 30 },
      { cls: "scene-backsplash kitchen-backsplash", x: 0, y: 34, w: 100, h: 22 },
      { cls: "scene-calendar kitchen-calendar", x: 12, y: 14, w: 16, h: 22 },
      { cls: "scene-shelf kitchen-shelf", x: 29, y: 24, w: 25, h: 8 },
      { cls: "scene-counter kitchen-counter", x: 2, y: 56, w: 96, h: 34 },
      { cls: "scene-object object-mug", x: 27, y: 70, w: 12, h: 12 },
      { cls: "scene-object object-tea_tin", x: 42, y: 62, w: 12, h: 14 },
      { cls: "scene-object object-kettle", x: 65, y: 60, w: 19, h: 20 },
      { cls: "scene-object object-medication_bottle", x: 79, y: 55, w: 8, h: 17 },
      { cls: "scene-object object-plant_shelf", x: 33, y: 30, w: 15, h: 17 },
      { cls: "scene-object object-calendar_alert", x: 86, y: 37, w: 10, h: 12 }
    ]
  },
  living: {
    parts: [
      { cls: "scene-window living-window", x: 13, y: 10, w: 24, h: 28 },
      { cls: "scene-art living-art", x: 69, y: 9, w: 20, h: 24 },
      { cls: "scene-shelf living-shelf", x: 64, y: 38, w: 28, h: 9 },
      { cls: "scene-couch living-couch", x: 19, y: 43, w: 58, h: 26 },
      { cls: "scene-table coffee-table", x: 23, y: 65, w: 54, h: 22 },
      { cls: "scene-object object-photo_frame", x: 40, y: 60, w: 13, h: 13 },
      { cls: "scene-object object-postcard", x: 29, y: 70, w: 17, h: 9 },
      { cls: "scene-object object-phone", x: 61, y: 68, w: 11, h: 13 },
      { cls: "scene-object object-wallet", x: 74, y: 57, w: 12, h: 8 },
      { cls: "scene-object object-playlist", x: 53, y: 74, w: 13, h: 8 },
      { cls: "scene-object object-creative_project", x: 79, y: 68, w: 17, h: 12 }
    ]
  },
  hallway: {
    parts: [
      { cls: "scene-door hallway-door", x: 60, y: 8, w: 26, h: 62 },
      { cls: "scene-door-light hallway-door-light", x: 82, y: 8, w: 8, h: 64 },
      { cls: "scene-wall-note hallway-note-wall", x: 41, y: 18, w: 15, h: 22 },
      { cls: "scene-hooks hallway-hooks", x: 20, y: 26, w: 23, h: 14 },
      { cls: "scene-runner hallway-runner", x: 23, y: 56, w: 52, h: 41 },
      { cls: "scene-object object-keys", x: 30, y: 40, w: 12, h: 10 },
      { cls: "scene-object object-appointment_card", x: 48, y: 29, w: 14, h: 11 },
      { cls: "scene-object object-hall_note", x: 49, y: 41, w: 16, h: 11 },
      { cls: "scene-object object-transit_card", x: 42, y: 73, w: 12, h: 8 },
      { cls: "scene-object object-sneakers", x: 27, y: 79, w: 19, h: 10 },
      { cls: "scene-object object-tote_bag", x: 72, y: 65, w: 18, h: 21 },
      { cls: "scene-object object-front_door", x: 73, y: 45, w: 16, h: 33 }
    ]
  }
};

const firstPersonHotspots = {
  bedside_glasses: [52, 56],
  bedroom_window: [76, 24],
  bedroom_note: [55, 66],
  unread_texts: [64, 55],
  voice_memo: [71, 44],
  laptop: [73, 68],
  mirror: [50, 41],
  pill_organizer: [63, 60],
  bathroom_cabinet: [80, 27],
  mug: [31, 68],
  tea_tin: [46, 60],
  kettle: [70, 57],
  medication_bottle: [81, 52],
  calendar: [20, 24],
  plant_shelf: [40, 29],
  calendar_alert: [89, 38],
  photo_frame: [43, 59],
  postcard: [33, 69],
  phone: [65, 56],
  wallet: [77, 56],
  playlist: [56, 73],
  creative_project: [82, 67],
  keys: [33, 54],
  appointment_card: [57, 34],
  transit_card: [43, 72],
  sneakers: [30, 78],
  tote_bag: [74, 64],
  hall_note: [51, 38],
  front_door: [69, 45]
};

const roomStartNodes = {
  bedroom: "bedroom_bedside",
  bathroom: "bedroom_mirror",
  kitchen: "hallway_mid",
  living: "phone_closeup",
  hallway: "hallway_mid"
};

const verticalSliceRoomIds = ["bedroom", "hallway"];
const verticalSliceNodes = ["bedroom_bedside", "bedroom_mirror", "phone_closeup", "hallway_mid", "hallway_mid_uncertain", "hallway_door"];
const sliceRequiredItems = ["keys", "phone", "appointment_card"];

const scenePlateAssets = {
  bedroom_bedside: "assets/scenes/bedroom_bedside.svg",
  bedroom_mirror: "assets/scenes/bedroom_mirror.svg",
  phone_closeup: "assets/scenes/phone_closeup.svg",
  hallway_mid: "assets/scenes/hallway_mid.svg",
  hallway_mid_uncertain: "assets/scenes/hallway_mid.svg",
  hallway_door: "assets/scenes/hallway_door.svg"
};

const sceneNodes = {
  bedroom_bedside: {
    room: "bedroom",
    title: "Bedroom - Bedside",
    perspective: "first-person",
    mood: "softened",
    exits: { left: "bedroom_mirror", right: "phone_closeup", forward: "hallway_mid" },
    hotspots: ["bedside_glasses", "phone", "unread_texts", "bedroom_note", "voice_memo"],
    speaker: "Morning",
    narration: [
      "The room is familiar before it is clear.",
      "The table remembers where your hands usually go."
    ]
  },
  bedroom_mirror: {
    room: "bedroom",
    title: "Bedroom - Mirror",
    perspective: "first-person",
    mood: "uncanny",
    exits: { right: "bedroom_bedside", back: "bedroom_bedside" },
    hotspots: ["bedroom_note", "bedside_glasses"],
    speaker: "Recognition",
    narration: [
      "The face is familiar. The name arrives late.",
      "You know this feeling before you know the sentence for it."
    ],
    choices: [
      { label: "I know this feeling.", text: "Recognition begins as a warmth, not a fact." },
      { label: "Name one thing.", text: "Mirror. Bed. Table. One word returns, then another." },
      { label: "Step away.", node: "bedroom_bedside", text: "You step back before the feeling gets too large." }
    ]
  },
  phone_closeup: {
    room: "bedroom",
    title: "Phone - Close-up",
    perspective: "first-person",
    mood: "memory",
    exits: { back: "bedroom_bedside", left: "bedroom_mirror", forward: "hallway_mid" },
    hotspots: ["phone", "unread_texts", "voice_memo", "bedroom_note"],
    speaker: "Phone",
    narration: [
      "You know what you mean. The sentence is the hard part.",
      "The unread message is not a threat. It is only waiting for a smaller answer."
    ],
    choices: [
      { label: "Send simple reply.", text: "Running slow. I care. Text soon.", action: "simpleReply" },
      { label: "Ask for one question at a time.", text: "Could you ask one question at a time?", action: "oneQuestion" },
      { label: "Call.", text: "A familiar voice gives the room a second center.", action: "call" },
      { label: "Not now.", node: "bedroom_bedside", text: "The phone can wait without becoming a verdict." }
    ]
  },
  bedroom_window: {
    room: "bedroom",
    title: "Bedroom - Window",
    perspective: "first-person",
    mood: "memory",
    exits: { left: "bedroom_bedside", forward: "bedroom_door" },
    hotspots: ["bedroom_window", "laptop", "voice_memo"],
    speaker: "Morning",
    narration: [
      "Light leans through the window like it remembers the route.",
      "The laptop waits with one unfinished sentence."
    ]
  },
  bedroom_door: {
    room: "bedroom",
    title: "Bedroom - Door",
    perspective: "first-person",
    mood: "softened",
    exits: { back: "bedroom_bedside", forward: "hallway_mid", right: "bathroom_sink" },
    hotspots: ["laptop", "bedroom_note"],
    speaker: "Threshold",
    narration: [
      "The door is a small decision, not a test.",
      "The hall waits on the other side of the morning."
    ]
  },
  bathroom_sink: {
    room: "bathroom",
    title: "Bathroom - Sink",
    perspective: "first-person",
    mood: "uncanny",
    exits: { back: "hallway_mid", right: "bathroom_shelf" },
    hotspots: ["mirror", "pill_organizer"],
    speaker: "Bathroom",
    narration: [
      "The light is too white. The water knows what to do before you do.",
      "The mirror offers a face in pieces, then all at once."
    ]
  },
  bathroom_shelf: {
    room: "bathroom",
    title: "Bathroom - Shelf",
    perspective: "first-person",
    mood: "clear",
    exits: { left: "bathroom_sink", back: "hallway_mid" },
    hotspots: ["bathroom_cabinet", "pill_organizer"],
    speaker: "Cue",
    narration: [
      "The organizer can answer without asking memory to perform.",
      "A small box of days is kinder than guessing."
    ]
  },
  kitchen_counter: {
    room: "kitchen",
    title: "Kitchen - Counter",
    perspective: "first-person",
    mood: "grounded",
    exits: { left: "kitchen_window", back: "hallway_mid", right: "living_coffee_table" },
    hotspots: ["mug", "tea_tin", "kettle", "medication_bottle", "calendar"],
    speaker: "Kitchen",
    narration: [
      "The kettle makes the next step smaller.",
      "Steam is easier to trust than memory."
    ]
  },
  kitchen_window: {
    room: "kitchen",
    title: "Kitchen - Window",
    perspective: "first-person",
    mood: "memory",
    exits: { right: "kitchen_counter", back: "hallway_mid" },
    hotspots: ["plant_shelf", "calendar_alert", "calendar"],
    speaker: "Window",
    narration: [
      "The basil leans toward the window. It does not need a perfect morning.",
      "The appointment square is circled twice."
    ]
  },
  living_coffee_table: {
    room: "living",
    title: "Living Room - Coffee Table",
    perspective: "first-person",
    mood: "memory",
    exits: { left: "living_shelf", right: "hallway_mid", back: "kitchen_counter" },
    hotspots: ["photo_frame", "postcard", "phone", "wallet", "playlist", "creative_project"],
    speaker: "Memory",
    narration: [
      "The photo knows you before you know it back.",
      "Faces feel close but unnamed. The room is tender, not empty."
    ]
  },
  living_shelf: {
    room: "living",
    title: "Living Room - Shelf",
    perspective: "first-person",
    mood: "softened",
    exits: { right: "living_coffee_table", forward: "hallway_mid" },
    hotspots: ["playlist", "creative_project", "phone"],
    speaker: "Room",
    narration: [
      "A song waits with the patience of a familiar hand.",
      "The unfinished project still looks like your taste."
    ]
  },
  hallway_mid: {
    room: "hallway",
    title: "Hallway - Midpoint",
    perspective: "first-person",
    mood: "dread",
    exits: { forward: "hallway_door", back: "bedroom_bedside" },
    hotspots: ["keys", "hall_note", "tote_bag", "sneakers", "transit_card", "appointment_card"],
    speaker: "Hallway",
    narration: [
      "The hallway is longer than the apartment should allow.",
      "The door is visible. The route to it feels less certain."
    ]
  },
  hallway_mid_uncertain: {
    room: "hallway",
    title: "Hallway - Uncertain",
    perspective: "first-person",
    mood: "dread",
    exits: { forward: "hallway_door", back: "bedroom_bedside" },
    hotspots: ["hall_note", "keys", "appointment_card"],
    speaker: "Space",
    narration: [
      "You moved. The door did not get closer.",
      "Name the next object. One step is allowed to be small."
    ],
    choices: [
      { label: "Use floor note.", text: "Keys. Wallet. Phone. Card. The order becomes external." },
      { label: "Name the next object.", text: "Keys first. The hallway stops widening." },
      { label: "Step forward again.", node: "hallway_door", text: "The door becomes a door again." }
    ]
  },
  hallway_door: {
    room: "hallway",
    title: "Door - Threshold",
    perspective: "first-person",
    mood: "threshold",
    exits: { back: "hallway_mid" },
    hotspots: ["front_door", "appointment_card", "keys", "hall_note"],
    speaker: "Threshold",
    narration: [
      "The door is not only a door. It is the shape of the whole morning asking to be finished.",
      "Light leaks around the frame, bright and not quite readable."
    ],
    choices: [
      { label: "Check carried things.", text: "Keys. Phone. Card. The list is plain and kind." },
      { label: "Use support cue.", text: "Support does not erase the morning. It makes one step reachable.", action: "supportDoor" },
      { label: "Make today smaller.", text: "Not today is also a way to care for the day.", action: "reschedule" }
    ]
  }
};

const phoneChoices = [
  {
    id: "ask_help",
    label: "Send simple text",
    line: "Could you ask one question at a time?",
    reply: "Of course. One question. Do you want me to text, call, or just wait nearby?",
    effect: { support: 1.2, clarity: 1, flag: "askedHelp" }
  },
  {
    id: "deny_help",
    label: "Save as draft",
    line: "I think I can do it myself.",
    reply: "I believe you. I will keep my phone nearby. You do not have to prove anything to me.",
    effect: { support: 0.2, clarity: -0.4, flag: "deniedHelp" }
  },
  {
    id: "stay_phone",
    label: "Call and stay connected",
    line: "Can you stay on the phone while I get to the door?",
    reply: "I am here. No rush. You are not a problem I am solving.",
    effect: { support: 1.6, clarity: 1.2, flag: "callOpen" }
  },
  {
    id: "reschedule",
    label: "Not now / reschedule",
    line: "I do not think today is the day.",
    reply: "That is allowed. We can make today smaller.",
    effect: { support: 1, clarity: 0.8, flag: "rescheduled" }
  }
];

const reflectionPrompts = [
  "What helped most?",
  "What felt hardest to read?",
  "What kind of support preserved dignity?",
  "What would you say to them as a friend?",
  "What would make tomorrow smaller?"
];

const endings = {
  supported: {
    title: "Supported Departure",
    text: "The door opens after the room lends back a few simple facts: glasses, phone, keys, card, one cue. Support did not erase uncertainty. It made the next step reachable.",
    points: [
      "What helped: object cues, a carried phone, and one visible support near the door.",
      "What remained difficult: the threshold still asked for patience.",
      "Care note: support protected autonomy instead of replacing it.",
      "Reflection: what made the morning feel possible?"
    ]
  },
  notToday: {
    title: "Smaller Morning",
    text: "The appointment can move. The morning becomes smaller, warmer, and still worthy. Rest is not a failure state.",
    points: [
      "What helped: rescheduling made the morning smaller.",
      "What remained difficult: the original plan still carried pressure.",
      "Care note: supported autonomy includes the choice to pause.",
      "Reflection: what would rest make room for?"
    ]
  },
  overloadedNotAlone: {
    title: "Overloaded but Not Alone",
    text: "The hallway becomes too loud, but the support remains. A call, a note, or a smaller plan keeps the morning from becoming something faced alone.",
    points: [
      "What helped: pausing, relational support, and the option to leave some tasks unfinished.",
      "What remained difficult: overload and dread stayed present.",
      "Care note: being overwhelmed is not being abandoned.",
      "Reflection: what would make tomorrow smaller?"
    ]
  }
};

const initialState = () => ({
  screen: "menu",
  currentRoom: "bedroom",
  currentNode: "bedroom_bedside",
  clarity: 6,
  support: 1,
  inventory: [],
  collectedObjects: [],
  completed: [],
  fragments: [],
  journal: [],
  morningRecords: [],
  careNotes: [],
  symptomLog: [],
  songs: [],
  messages: [],
  carePerspective: [],
  reflections: [],
  selfMonitoring: [],
  supportPlaced: [],
  metacognition: {
    sure: 0,
    partial: 0,
    unsure: 0,
    cuesUsed: 0,
    lastConfidence: "unrecorded"
  },
  supportStyle: "gentle",
  inspectedObjects: [],
  visitedRooms: ["bedroom"],
  visitedNodes: ["bedroom_bedside"],
  memoryBookSection: "fragments",
  currentInspectionId: null,
  currentFocusIndex: 0,
  lastInputMode: "keyboard",
  vnSpeaker: "Morning",
  vnText: "The room is familiar before it is clear.",
  vnChoices: [],
  interactionCount: 0,
  symptoms: {
    memory: 1.2,
    language: 1,
    visuospatial: 1,
    executiveFunction: 1.2,
    motor: 1,
    recognition: 1.1,
    grounding: 4.8,
    overload: 1.4,
    dread: 1.6
  },
  flags: {
    organizerConfirmed: false,
    teaMade: false,
    photoRebuilt: false,
    phoneUsed: false,
    textHandled: false,
    laptopHandled: false,
    playlistUsed: false,
    plantWatered: false,
    voiceMemoPlayed: false,
    oneQuestionAtATime: false,
    askedHelp: false,
    deniedHelp: false,
    callOpen: false,
    rescheduled: false,
    hallwayLooped: false
  },
  endingId: null,
  settings: {
    largeText: false,
    highContrast: false,
    reducedMotion: false,
    reduceBlur: false,
    plainLanguage: false,
    disableDistortion: false,
    contentNote: true,
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
  symptomSummary: $("#symptomSummary"),
  metacognitionPanel: $("#metacognitionPanel"),
  metacognitiveChoices: $("#metacognitiveChoices"),
  quickMemoryGrid: $("#quickMemoryGrid"),
  roomStage: $("#roomStage"),
  decorLayer: $("#decorLayer"),
  supportLayer: $("#supportLayer"),
  hotspotLayer: $("#hotspotLayer"),
  nodeExitLayer: $("#nodeExitLayer"),
  roomMap: $("#roomMap"),
  caption: $("#caption"),
  vnSpeaker: $("#vnSpeaker"),
  vnChoices: $("#vnChoices"),
  checklist: $("#checklist"),
  inventory: $("#inventory"),
  journalLog: $("#journalLog"),
  supportStyleChoices: $("#supportStyleChoices"),
  supportChoices: $("#supportChoices"),
  memoryTabs: $("#memoryTabs"),
  memoryEntries: $("#memoryEntries"),
  symptomLogEntries: $("#symptomLogEntries"),
  feedbackLayer: $("#feedbackLayer"),
  inputPrompts: $("#inputPrompts"),
  phoneChoices: $("#phoneChoices"),
  inspectionEyebrow: $("#inspectionEyebrow"),
  inspectionTitle: $("#inspectionTitle"),
  inspectionText: $("#inspectionText"),
  inspectionFeeling: $("#inspectionFeeling"),
  inspectionNote: $("#inspectionNote"),
  inspectionVisual: $("#inspectionVisual"),
  inspectionActions: $("#inspectionActions"),
  endingTitle: $("#endingTitle"),
  endingText: $("#endingText"),
  endingPoints: $("#endingPoints"),
  reflectionPrompts: $("#reflectionPrompts"),
  reflectionInput: $("#reflectionInput")
};

function init() {
  $("#newGame").addEventListener("click", newGame);
  $("#continueGame").addEventListener("click", continueGame);
  $("#openMemoryBookMenu").addEventListener("click", () => openModal("memoryBookModal"));
  $("#openMemoryBookGame").addEventListener("click", () => openModal("memoryBookModal"));
  $("#quickOpenBook").addEventListener("click", () => openModal("memoryBookModal"));
  $("#openAccessibility").addEventListener("click", () => openModal("accessibilityPanel"));
  $("#openAccessibilityGame").addEventListener("click", () => openModal("accessibilityPanel"));
  $("#openAccessibilityFromCase").addEventListener("click", () => openModal("accessibilityPanel"));
  $("#openCredits").addEventListener("click", () => openModal("creditsModal"));
  $("#openSupport").addEventListener("click", openSupport);
  $("#openSymptomLog").addEventListener("click", () => openModal("symptomLogModal"));
  $("#beginCaseFile").addEventListener("click", () => {
    closeModal("caseFileModal");
    openModal("onboardingModal");
  });
  $("#finishOnboarding").addEventListener("click", () => {
    closeModal("onboardingModal");
    showGame();
  });
  $("#caseReturnMenu").addEventListener("click", () => {
    closeModal("caseFileModal");
    showMenu();
  });
  $("#saveGame").addEventListener("click", () => {
    saveGame();
    writeJournal("Saved. The morning can wait here.");
  });
  $("#returnMenu").addEventListener("click", showMenu);
  $("#endingRestart").addEventListener("click", newGame);
  $("#endingBook").addEventListener("click", () => openModal("memoryBookModal"));
  $("#endingSymptomLog").addEventListener("click", () => openModal("symptomLogModal"));
  $("#endingMenu").addEventListener("click", showMenu);
  $("#saveReflection").addEventListener("click", saveEndingReflection);

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

  document.addEventListener("keydown", handleKeyboardInput);

  updateContinueButton();
  renderAll();
  startGamepadLoop();
}

function visibleModal() {
  return $$(".modal").find((modal) => !modal.classList.contains("hidden"));
}

function handleKeyboardInput(event) {
  if (state.screen !== "game") {
    if (event.key === "Escape") closeTopModalOrBack();
    return;
  }

  const key = event.key.toLowerCase();
  const modal = visibleModal();

  if (event.key === "Escape") {
    event.preventDefault();
    closeTopModalOrBack();
    return;
  }

  if (modal) return;

  const directionMap = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "forward", ArrowDown: "back" };
  const direction = directionMap[event.key];
  if (direction) {
    event.preventDefault();
    state.lastInputMode = "keyboard";
    moveOrFocus(direction);
    return;
  }

  if (event.key === "Tab") {
    event.preventDefault();
    state.lastInputMode = "keyboard";
    cycleControllerFocus(event.shiftKey ? -1 : 1);
    return;
  }

  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    activateControllerFocus();
    return;
  }

  if (key === "m" || key === "y") {
    event.preventDefault();
    openModal("memoryBookModal");
    return;
  }

  if (key === "s" || key === "x") {
    event.preventDefault();
    openSupport();
  }
}

function closeTopModalOrBack() {
  const modal = visibleModal();
  if (modal) {
    closeModal(modal.id);
    return;
  }
  if (state.screen === "game") {
    const back = currentSceneNode().exits?.back;
    if (back) moveToNode(back, "back");
  }
}

function moveOrFocus(direction) {
  const target = currentSceneNode().exits?.[direction];
  if (target) {
    moveToNode(target, direction);
    return;
  }
  cycleControllerFocus(direction === "left" || direction === "back" ? -1 : 1);
}

function interactiveElements() {
  return [
    ...$$("[data-vn-choice]"),
    ...$$(".object-marker"),
    ...$$("[data-node-exit]")
  ].filter((element) => element.offsetParent !== null && !element.disabled);
}

function refreshControllerFocus() {
  const elements = interactiveElements();
  if (!elements.length) return;
  if (state.currentFocusIndex >= elements.length) state.currentFocusIndex = 0;
  elements.forEach((element, index) => {
    element.classList.toggle("controller-focus", index === state.currentFocusIndex);
  });
}

function cycleControllerFocus(delta = 1) {
  const elements = interactiveElements();
  if (!elements.length) return;
  state.currentFocusIndex = (state.currentFocusIndex + delta + elements.length) % elements.length;
  refreshControllerFocus();
  elements[state.currentFocusIndex]?.focus({ preventScroll: true });
}

function activateControllerFocus() {
  const elements = interactiveElements();
  if (!elements.length) return;
  const element = elements[state.currentFocusIndex] || elements[0];
  element.click();
}

function startGamepadLoop() {
  if (!("getGamepads" in navigator)) return;
  const previous = { buttons: [], axes: [0, 0] };
  const tick = () => {
    if (state.screen === "game" && !visibleModal()) {
      const pad = Array.from(navigator.getGamepads()).find(Boolean);
      if (pad) handleGamepadInput(pad, previous);
    }
    window.requestAnimationFrame(tick);
  };
  window.requestAnimationFrame(tick);
}

function pressedNow(pad, previous, index) {
  const pressed = Boolean(pad.buttons[index]?.pressed);
  const wasPressed = Boolean(previous.buttons[index]);
  previous.buttons[index] = pressed;
  return pressed && !wasPressed;
}

function axisTap(value, previousValue) {
  return Math.abs(value) > 0.62 && Math.abs(previousValue) <= 0.62;
}

function handleGamepadInput(pad, previous) {
  state.lastInputMode = "gamepad";
  const xAxis = pad.axes[0] || 0;
  const yAxis = pad.axes[1] || 0;

  if (axisTap(xAxis, previous.axes[0])) moveOrFocus(xAxis < 0 ? "left" : "right");
  if (axisTap(yAxis, previous.axes[1])) moveOrFocus(yAxis < 0 ? "forward" : "back");
  previous.axes = [xAxis, yAxis];

  if (pressedNow(pad, previous, 0)) activateControllerFocus();
  if (pressedNow(pad, previous, 1)) closeTopModalOrBack();
  if (pressedNow(pad, previous, 2)) openSupport();
  if (pressedNow(pad, previous, 3)) openModal("memoryBookModal");
  if (pressedNow(pad, previous, 4)) cycleControllerFocus(-1);
  if (pressedNow(pad, previous, 5)) cycleControllerFocus(1);
  if (pressedNow(pad, previous, 12)) moveOrFocus("forward");
  if (pressedNow(pad, previous, 13)) moveOrFocus("back");
  if (pressedNow(pad, previous, 14)) moveOrFocus("left");
  if (pressedNow(pad, previous, 15)) moveOrFocus("right");
}

function newGame() {
  const settings = { ...state.settings };
  state = initialState();
  state.settings = settings;
  state.screen = "game";
  writeJournal("Morning File opened at 7:13 AM.");
  addMorningRecord("Subjective report begins. External supports available.");
  addClinicalNote("Observation is not diagnosis. Player agency and dignity remain primary.");
  openModal("caseFileModal");
  $("#contentNoteText").classList.toggle("hidden", !state.settings.contentNote);
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
    symptoms: { ...initialState().symptoms, ...(saved.symptoms || {}) },
    metacognition: { ...initialState().metacognition, ...(saved.metacognition || {}) },
    selfMonitoring: saved.selfMonitoring || [],
    currentNode: saved.currentNode && sceneNodes[saved.currentNode] ? saved.currentNode : roomStartNodes[saved.currentRoom] || "bedroom_bedside",
    visitedNodes: saved.visitedNodes || [saved.currentNode || "bedroom_bedside"],
    currentFocusIndex: Number.isFinite(saved.currentFocusIndex) ? saved.currentFocusIndex : 0,
    lastInputMode: saved.lastInputMode || "keyboard",
    vnChoices: saved.vnChoices || [],
    settings: { ...initialState().settings, ...(saved.settings || {}) }
  };
}

function updateContinueButton() {
  $("#continueGame").disabled = !localStorage.getItem(SAVE_KEY);
}

function openModal(id) {
  if (id === "memoryBookModal") renderMemoryBook();
  if (id === "symptomLogModal") renderSymptomLog();
  if (id === "caseFileModal") $("#contentNoteText").classList.toggle("hidden", !state.settings.contentNote);
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
  renderMetacognitionPanel();
  renderQuickMemoryGrid();
  renderMemoryBook();
  renderVNBox();
  renderInputPrompts();
  refreshControllerFocus();
}

function setVN(speaker, text, choices = []) {
  state.vnSpeaker = speaker || "Morning";
  state.vnText = text || "The apartment is quiet. Start with what helps you see.";
  state.vnChoices = choices || [];
  renderVNBox();
}

function renderVNBox() {
  if (!els.caption || !els.vnSpeaker || !els.vnChoices) return;
  const node = currentSceneNode();
  const speaker = state.vnSpeaker || node?.speaker || "Morning";
  const text = state.vnText || nodeText(node);
  els.vnSpeaker.textContent = speaker;
  els.caption.textContent = text;
  els.vnChoices.innerHTML = (state.vnChoices || []).map((choice, index) => `
    <button class="vn-choice" type="button" data-vn-choice="${index}" data-interactive="choice">
      ${choice.label}
    </button>
  `).join("");
  $$("[data-vn-choice]").forEach((button) => {
    button.addEventListener("click", () => chooseVNChoice(Number(button.dataset.vnChoice)));
  });
  refreshControllerFocus();
}

function renderInputPrompts() {
  if (!els.inputPrompts) return;
  const exits = Object.keys(currentSceneNode().exits || {});
  const turnPrompt = exits.includes("left") || exits.includes("right") ? "<span><b>Left/Right</b> Turn</span>" : "";
  const forwardPrompt = exits.includes("forward") ? "<span><b>Up</b> Move</span>" : "";
  const backPrompt = exits.includes("back") ? "<span><b>B / Esc</b> Back</span>" : "<span><b>B / Esc</b> Close</span>";
  els.inputPrompts.innerHTML = `
    <span><b>A / Enter</b> Inspect</span>
    ${backPrompt}
    <span><b>X / S</b> Support</span>
    <span><b>Y / M</b> Memory Book</span>
    <span><b>Tab / Shoulder</b> Focus</span>
    ${turnPrompt}
    ${forwardPrompt}
  `;
}

function chooseVNChoice(index) {
  const choice = state.vnChoices?.[index];
  if (!choice) return;
  if (choice.action === "reschedule") {
    state.flags.rescheduled = true;
    addCarePerspective("Making today smaller can be an autonomous choice.");
    addSymptomLog({
      clinical: "Threshold decision shifted toward rescheduling under high load.",
      human: "Not today became care, not failure."
    });
    setVN("Threshold", choice.text, []);
    showEnding("notToday");
    return;
  } else if (choice.action === "supportDoor") {
    if (!state.supportPlaced.includes("door")) placeSupport("door");
    setVN("Support", choice.text, []);
    return;
  } else if (choice.action === "simpleReply") {
    state.flags.textHandled = true;
    state.flags.phoneUsed = true;
    complete("phone");
    addItem("phone");
    addMessage(choice.text);
    addFragment("half_text");
    addCarePerspective("Communication can be made smaller without making the person smaller.");
    setVN("Phone", choice.text, []);
    ground(0.45);
    playSound("text");
  } else if (choice.action === "oneQuestion") {
    state.flags.oneQuestionAtATime = true;
    state.flags.askedHelp = true;
    state.flags.phoneUsed = true;
    complete("phone");
    addItem("phone");
    addMessage(choice.text);
    addCarePerspective("One question at a time is a support need, not a failure.");
    setVN("Phone", "Sam: Of course. One question. Do you want me to stay on the phone, or just text?", []);
    ground(0.65);
    playSound("text");
  } else if (choice.action === "call") {
    state.flags.callOpen = true;
    state.flags.askedHelp = true;
    state.flags.phoneUsed = true;
    complete("phone");
    addItem("phone");
    addFragment("voice");
    addCarePerspective("Relational support can stay present without taking control.");
    setVN("Sam", "I am here. No rush. You are not a problem I am solving.", []);
    ground(0.8);
    playSound("phone");
  } else if (choice.node) {
    moveToNode(choice.node, "choice");
    setVN(currentSceneNode().speaker || "Morning", choice.text, currentSceneNode().choices || []);
  } else {
    setVN(currentSceneNode().speaker || "Morning", choice.text, []);
    ground(0.18);
  }
  renderAll();
  saveGame();
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
  return currentPerceptionState();
}

function symptomLoad() {
  const { memory, language, visuospatial, executiveFunction, motor, recognition, overload, dread } = state.symptoms;
  return (memory + language + visuospatial + executiveFunction + motor + recognition + overload + dread) / 8;
}

function currentPerceptionState() {
  if (state.supportPlaced.length > 0 || state.support >= 4 || state.symptoms.grounding >= 5.4) return "supported";
  if (state.symptoms.dread >= 4.7) return "dread";
  if (state.symptoms.executiveFunction >= 4.8 || state.clarity <= 1.8) return "overloaded";
  if (state.symptoms.dread >= 3.4 || state.inspectedObjects.includes("voice_memo")) return "uncanny";
  if (symptomLoad() >= 3.7 || state.clarity <= 2.8) return "fragmented";
  if (state.clarity <= 4.2 || symptomLoad() >= 2.6) return "softened";
  return "clear";
}

function roomText(room) {
  const clarity = currentClarityState();
  if (state.settings.disableDistortion || state.settings.plainLanguage) return room.descriptions.clear;
  if (clarity === "dread") return room.descriptions.dread || "The room is familiar and still not quite trustworthy.";
  if (clarity === "uncanny") return room.descriptions.uncanny || room.descriptions.softened || room.descriptions.clear;
  if (clarity === "fragmented") return distortText(room.descriptions.softened || room.descriptions.clear, "fragmented");
  if (clarity === "overloaded") return "Too many edges in the room. Choose one next step, or place a support cue.";
  return room.descriptions[state.settings.plainLanguage ? "clear" : clarity] || room.descriptions.clear;
}

function distortText(text, mode) {
  if (state.settings.disableDistortion || state.settings.plainLanguage) return text;
  if (mode === "language") return text.replace(/\b(glasses|kettle|phone|keys|wallet|door|calendar|photo|mug)\b/gi, "the thing for...");
  return text.replace(/\b(room|counter|hall|door|photo|morning|appointment)\b/gi, (word) => `${word.slice(0, 2)}...`);
}

function renderRoomMap() {
  els.roomMap.innerHTML = verticalSliceRoomIds.map((id) => {
    const room = rooms[id];
    return `
    <button
      class="${id === state.currentRoom ? "active" : ""} ${state.visitedRooms.includes(id) ? "visited" : ""} ${roomStatus(id)}"
      data-room="${id}"
      type="button"
      aria-label="${room.nav}, ${roomStatus(id)}${id === state.currentRoom ? ", current room" : ""}"
    >
      <span class="map-dot"></span>
      <span>${room.nav}</span>
    </button>
  `;
  }).join("");

  $$("#roomMap [data-room]").forEach((button) => {
    button.addEventListener("click", () => {
      const nodeId = roomStartNodes[button.dataset.room] || "bedroom_bedside";
      moveToNode(nodeId, "map");
    });
  });
}

function currentSceneNode() {
  return sceneNodes[state.currentNode] || sceneNodes[roomStartNodes[state.currentRoom]] || sceneNodes.bedroom_bedside;
}

function moveToNode(nodeId, direction = "forward") {
  const current = currentSceneNode();
  let targetId = nodeId;
  if (
    current &&
    state.currentNode === "hallway_mid" &&
    direction === "forward" &&
    currentPerceptionState() === "dread" &&
    !state.flags.hallwayLooped
  ) {
    targetId = "hallway_mid_uncertain";
    state.flags.hallwayLooped = true;
    nudgeSymptom("visuospatial", 0.25);
  }
  const node = sceneNodes[targetId];
  if (!node) return;
  state.currentNode = targetId;
  state.currentRoom = node.room;
  state.visitedNodes = [...new Set([...(state.visitedNodes || []), targetId])];
  if (!state.visitedRooms.includes(node.room)) state.visitedRooms.push(node.room);
  soften(direction === "map" ? 0.08 : 0.16);
  beginRoomTransition();
  setVN(node.speaker || "Morning", nodeText(node), node.choices || []);
  announceFeedback("transition", `${node.title} settles into view.`);
  playSound(node.room === "hallway" ? "hallway" : "ground");
  renderAll();
  saveGame();
}

function beginRoomTransition() {
  document.body.classList.add("room-transitioning", "node-transition");
  window.clearTimeout(beginRoomTransition.timeout);
  beginRoomTransition.timeout = window.setTimeout(() => {
    document.body.classList.remove("room-transitioning", "node-transition");
  }, state.settings.reducedMotion ? 60 : 520);
}

function roomStatus(roomId) {
  if (state.currentRoom === roomId && currentPerceptionState() === "supported") return "stable";
  if (state.currentRoom === roomId && ["uncanny", "dread", "overloaded"].includes(currentPerceptionState())) return "uncertain";
  const roomObjects = rooms[roomId].objects.map((object) => object.id);
  const unresolved = roomObjects.some((id) => state.inspectedObjects.includes(id) && !state.collectedObjects.includes(id));
  return unresolved ? "unresolved" : "stable";
}

function renderRoom() {
  const nodeId = sceneNodes[state.currentNode] ? state.currentNode : roomStartNodes[state.currentRoom] || "bedroom_bedside";
  state.currentNode = nodeId;
  const node = sceneNodes[nodeId];
  state.currentRoom = node.room;
  const room = rooms[node.room];
  const clarity = currentClarityState();
  applyPerceptionClasses(clarity);
  if (!state.visitedRooms.includes(state.currentRoom)) state.visitedRooms.push(state.currentRoom);
  els.roomTitle.textContent = node.title || room.name;
  els.roomDescription.textContent = nodeText(node);
  els.clarityLabel.textContent = {
    clear: "Grounding: clear",
    softened: "Grounding: softened",
    fragmented: "Signal: fragmented",
    overloaded: "Morning pressure: high",
    supported: "Grounding: supported",
    uncanny: "Signal: uncanny",
    dread: "Morning dread: present"
  }[clarity];
  els.clarityMeter.style.width = `${(state.clarity / 6) * 100}%`;
  els.symptomSummary.innerHTML = renderSymptomSummary();
  els.roomStage.dataset.room = state.currentRoom;
  els.roomStage.dataset.node = state.currentNode;
  els.roomStage.dataset.mood = node.mood || clarity;
  els.roomStage.dataset.clarity = clarity;
  els.decorLayer.innerHTML = renderFirstPersonScene(state.currentRoom, state.currentNode);
  els.supportLayer.innerHTML = state.supportPlaced
    .filter((id) => supportTargets.find((target) => target.id === id)?.room === state.currentRoom)
    .map((id) => `<span class="support-note support-${id}">${supportTargets.find((target) => target.id === id).label} cue</span>`)
    .join("");
  const nodeObjects = (node.hotspots || room.objects.map((object) => object.id))
    .map(findObjectById)
    .filter(Boolean);
  els.hotspotLayer.innerHTML = nodeObjects.map((object) => renderHotspot(object, clarity)).join("");
  els.nodeExitLayer.innerHTML = renderNodeExits(node);

  $$(".hotspot").forEach((button) => {
    button.addEventListener("click", () => handleObject(button.dataset.object));
  });
  $$("[data-node-exit]").forEach((button) => {
    button.addEventListener("click", () => moveToNode(button.dataset.nodeExit, button.dataset.direction));
  });
}

function nodeText(node) {
  if (!node) return "The apartment is quiet. Start with what helps you see.";
  const line = state.settings.plainLanguage ? node.narration[0] : node.narration[Math.min((state.interactionCount || 0) % node.narration.length, node.narration.length - 1)];
  if (state.settings.disableDistortion || state.settings.plainLanguage) return line;
  if (node.mood === "dread" && currentPerceptionState() !== "supported") return distortText(line, "fragmented");
  return line;
}

function applyPerceptionClasses(clarity) {
  ["dread", "memory", "grounded", "overloaded", "uncanny", "supported"].forEach((name) => {
    document.body.classList.remove(`state-${name}`);
  });
  const className = {
    dread: "state-dread",
    uncanny: "state-uncanny",
    overloaded: "state-overloaded",
    supported: "state-supported",
    clear: "state-grounded",
    softened: "state-memory",
    fragmented: "state-memory"
  }[clarity];
  if (className) document.body.classList.add(className);
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

function renderFirstPersonScene(roomId, nodeId) {
  const asset = scenePlateAssets[nodeId] || scenePlateAssets[roomStartNodes[roomId]] || scenePlateAssets.bedroom_bedside;
  return `
    <div class="first-person-scene scene-node scene-plate scene-${roomId} node-${nodeId}" aria-hidden="true">
      <img class="scene-art" src="${asset}" alt="">
      <span class="scene-ink-wash" aria-hidden="true"></span>
      <span class="scene-paper-grain" aria-hidden="true"></span>
    </div>
  `;
}

function renderNodeExits(node) {
  const labels = {
    left: "Turn left",
    right: "Turn right",
    forward: "Move forward",
    back: "Step back"
  };
  return Object.entries(node.exits || {}).map(([direction, nodeId]) => `
    <button
      class="node-exit exit-${direction}"
      type="button"
      data-direction="${direction}"
      data-node-exit="${nodeId}"
      data-interactive="exit"
      aria-label="${labels[direction] || "Move"} to ${sceneNodes[nodeId]?.title || nodeId}"
    >
      <span>${labels[direction] || "Move"}</span>
    </button>
  `).join("");
}

function renderHotspot(object, clarity) {
  const supported = state.supportPlaced.some((target) => object.id.includes(target));
  const labelState = supported ? "supported" : clarity;
  const label = objectLabel(object, labelState);
  const done = state.collectedObjects.includes(object.id) || isObjectComplete(object);
  const helpful = isHelpfulObject(object);
  const [x, y] = firstPersonHotspots[object.id] || [object.x, object.y];
  return `
    <button class="hotspot object-marker hotspot-${object.id} ${done ? "done" : ""} ${helpful ? "helpful" : ""}" style="left:${x}%;top:${y}%;" data-object="${object.id}" data-interactive="object" type="button">
      <span class="object-label">${label}</span>
    </button>
  `;
}

function objectLabel(object, labelState) {
  if (state.settings.disableDistortion || state.settings.plainLanguage) {
    return object.labels.clear;
  }
  if (labelState === "dread") return object.labels.dread || "why does this matter";
  if (labelState === "uncanny") return object.labels.uncanny || object.labels.softened || object.labels.clear;
  if (labelState === "overloaded") return "too many things";
  if (labelState === "fragmented" && state.symptoms.language >= 3) return `the thing for ${object.labels.clear}`;
  return object.labels[labelState] || object.labels.softened || object.labels.clear;
}

function renderSymptomSummary() {
  const entries = [
    ["Memory", state.symptoms.memory],
    ["Language", state.symptoms.language],
    ["Space", state.symptoms.visuospatial],
    ["Sequence", state.symptoms.executiveFunction],
    ["Motor", state.symptoms.motor],
    ["Recognition", state.symptoms.recognition],
    ["Overload", state.symptoms.overload],
    ["Dread", state.symptoms.dread]
  ];
  return entries.map(([label, value]) => `<span>${label}: ${symptomWord(value)}</span>`).join("");
}

function symptomWord(value) {
  if (value >= 4.4) return "strained";
  if (value >= 3) return "soft";
  return "steady";
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
    leave: ["keys", "wallet", "appointment_card", "transit_card", "sneakers", "tote_bag", "front_door"]
  };
  return helpful[next.id]?.includes(object.id);
}

function handleObject(objectId) {
  const object = findObjectById(objectId);
  if (!object) return;
  setVN(object.labels.clear || "Object", inspectionText(object.text || "The object waits in the scene."));
  openInspection(object);
}

function useInspectedObject() {
  const object = findObjectById(state.currentInspectionId);
  if (!object) return;
  closeModal("inspectionModal");
  applyObjectUse(object);
  renderAll();
  saveGame();
}

function applyObjectUse(object) {
  state.interactionCount += 1;
  nudgeSymptom("executiveFunction", 0.08);

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
    case "group_chat":
      useGroupChat(object);
      break;
    case "voice_memo":
      useVoiceMemo(object);
      break;
    case "laptop":
      useLaptop(object);
      break;
    case "playlist":
      usePlaylist(object);
      break;
    case "plant":
      waterPlant(object);
      break;
    case "leave":
      tryLeave(object);
      break;
    default:
      inspectObject(object);
  }
}

function findObjectById(objectId) {
  for (const room of Object.values(rooms)) {
    const found = room.objects.find((object) => object.id === objectId);
    if (found) return found;
  }
  return null;
}

function openInspection(object) {
  state.currentInspectionId = object.id;
  state.inspectedObjects.push(object.id);
  state.inspectedObjects = [...new Set(state.inspectedObjects)];
  const data = inspectionData[object.id] || {
    title: object.labels.clear,
    visual: object.kind,
    note: "Observation: familiar object inspected in context.",
    look: object.text,
    question: "The object is familiar, but the next step still needs a little room."
  };
  els.inspectionTitle.textContent = data.title;
  els.inspectionEyebrow.textContent = `${rooms[state.currentRoom].name} / close inspection`;
  els.inspectionText.textContent = inspectionText(data.look);
  els.inspectionFeeling.textContent = inspectionText(data.feeling || data.question || "The object feels familiar and not fully settled yet.");
  els.inspectionNote.textContent = data.note;
  els.inspectionVisual.className = `inspection-visual closeup-view inspect-${slug(data.visual || object.kind)}`;
  els.inspectionActions.innerHTML = inspectionActionsFor(object, data).map((action) => `
    <button type="button" data-inspection-action="${action.id}">
      <strong>${action.label}</strong>
      <span>${action.text}</span>
    </button>
  `).join("");
  renderMetacognitiveChoices(object);
  openModal("inspectionModal");
  if (object.id === "mirror") playSound("mirror");
  if (object.id === "front_door" && currentPerceptionState() !== "supported") playSound("hallway");
  $$("[data-inspection-action]").forEach((button) => {
    button.addEventListener("click", () => runInspectionAction(button.dataset.inspectionAction, object.id));
  });
  $$("[data-meta-confidence]").forEach((button) => {
    button.addEventListener("click", () => recordMetacognitiveCheck(button.dataset.metaConfidence, object));
  });
}

function renderMetacognitiveChoices(object) {
  if (!els.metacognitiveChoices) return;
  const label = object?.labels?.clear || "this object";
  els.metacognitiveChoices.innerHTML = [
    ["sure", "Sure", `I know what ${label} means.`],
    ["partial", "Partly sure", "I know the feeling before the facts."],
    ["unsure", "Unsure", "I need a cue, not pressure."]
  ].map(([id, title, text]) => `
    <button type="button" data-meta-confidence="${id}">
      <strong>${title}</strong>
      <span>${text}</span>
    </button>
  `).join("");
}

function recordMetacognitiveCheck(confidence, object) {
  const key = confidence === "sure" ? "sure" : confidence === "partial" ? "partial" : "unsure";
  state.metacognition[key] = (state.metacognition[key] || 0) + 1;
  state.metacognition.lastConfidence = key;
  const objectName = object?.labels?.clear || "the object";
  const lines = {
    sure: `Confidence check near ${objectName}: sure enough to act.`,
    partial: `Confidence check near ${objectName}: partly sure; sensory context mattered.`,
    unsure: `Confidence check near ${objectName}: unsure; external cue would preserve autonomy.`
  };
  const human = {
    sure: "Certainty became action without needing to be perfect.",
    partial: "Feeling arrived before the facts, and that still counted as information.",
    unsure: "Needing a cue did not make the morning less yours."
  };
  const node = currentSceneNode();
  state.selfMonitoring.unshift({
    confidence: key,
    object: objectName,
    sceneNode: state.currentNode,
    sceneTitle: node?.title || rooms[state.currentRoom].name,
    supportUsed: state.supportPlaced.length > 0,
    text: lines[key],
    human: human[key]
  });
  state.selfMonitoring = state.selfMonitoring.slice(0, 30);
  if (key === "unsure") {
    state.metacognition.cuesUsed += 1;
    nudgeSymptom("overload", 0.1);
  } else if (key === "sure") {
    nudgeSymptom("dread", -0.08);
  } else {
    nudgeSymptom("memory", -0.04);
  }
  addSymptomLog({ clinical: lines[key], human: human[key] });
  announceFeedback("metacognition", human[key]);
  renderMetacognitionPanel();
  renderMemoryBook();
  saveGame();
}


function inspectionText(text) {
  if (state.settings.disableDistortion || state.settings.plainLanguage) return text;
  if (state.symptoms.language >= 3.4) return distortText(text, "language");
  return text;
}

function inspectionActionsFor(object) {
  const actions = [
    { id: "look", label: "Look", text: "Observe without acting yet." },
    { id: "use", label: "Use", text: "Try the practical next step." },
    { id: "question", label: "Ask", text: "Notice uncertainty without shame." },
    { id: "ground", label: "Ground", text: "Pause and use a steady cue." },
    { id: "leave_it", label: "Leave it for now", text: "Make the morning smaller." }
  ];
  if (object.id === "mirror") {
    actions.splice(1, 0, { id: "recognize", label: "I know this feeling", text: "Let recognition begin as sensation." });
  }
  if (["photo", "photo_frame", "postcard", "playlist", "voice_memo"].includes(object.kind) || ["photo_frame", "postcard", "playlist", "voice_memo"].includes(object.id)) {
    actions.splice(2, 0, { id: "remember", label: "Remember", text: "Let a sensory anchor arrive first." });
  }
  return actions;
}

function runInspectionAction(actionId, objectId) {
  const object = findObjectById(objectId);
  const data = inspectionData[objectId] || {};
  if (!object) return;

  if (actionId === "use") {
    useInspectedObject();
    return;
  }

  if (actionId === "look") {
    writeJournal(data.look || object.text);
    addClinicalNote(data.note || "Observation: object inspected in context.");
    nudgeSymptom(domainForObject(object), 0.18);
    nudgeSymptom("dread", object.id === "calendar" || object.id === "front_door" ? 0.18 : 0.04);
    playSound("page");
  }

  if (actionId === "question") {
    const line = data.question || "The morning makes space for uncertainty.";
    writeJournal(line);
    addSymptomLog({
      clinical: `Uncertainty noted near ${object.labels.clear}.`,
      human: "You knew it mattered before you knew why."
    });
    nudgeSymptom("memory", 0.18);
    nudgeSymptom("language", object.kind === "inspect" ? 0.12 : 0.04);
    nudgeSymptom("dread", 0.12);
  }

  if (actionId === "recognize") {
    writeJournal("I know this feeling before I know the whole face.");
    addFragment("late_name");
    addSymptomLog({
      clinical: "Recognition stabilized through affective cue at mirror.",
      human: "The name arrived late, but the feeling did not leave."
    });
    nudgeSymptom("recognition", -0.45);
    ground(0.8);
    playSound("ground");
  }

  if (actionId === "remember") {
    if (object.fragment) addFragment(object.fragment);
    writeJournal(data.question || "Memory arrives as smell, sound, color, or feeling before facts.");
    addSymptomLog({
      clinical: "Autobiographical recall improved through sensory anchoring.",
      human: "The memory did not become perfect. It became reachable."
    });
    nudgeSymptom("memory", -0.25);
    nudgeSymptom("recognition", -0.25);
    ground(0.45);
    playSound("memory");
  }

  if (actionId === "ground") {
    ground(1);
    state.support = clamp(state.support + 0.35, 1, 6);
    addClinicalNote(`Grounding cue used near ${object.labels.clear}.`);
    writeJournal("You narrow the room to one object, one breath, one next step.");
    playSound("ground");
  }

  if (actionId === "leave_it") {
    writeJournal("You leave it for now. Autonomy includes choosing which question the morning gets to ask.");
    addCarePerspective("The goal is not a perfect morning. The goal is a morning with less fear.");
    nudgeSymptom("overload", -0.35);
    ground(0.25);
  }

  closeModal("inspectionModal");
  renderAll();
  saveGame();
}

function domainForObject(object) {
  if (["photo", "phone", "playlist", "voice_memo"].includes(object.kind)) return "recognition";
  if (object.kind === "tea" || object.kind === "medication" || object.kind === "organizer" || object.kind === "laptop" || object.kind === "group_chat") return "executiveFunction";
  if (object.id.includes("door") || object.id.includes("hall")) return "visuospatial";
  if (object.id.includes("keys") || object.id.includes("sneakers")) return "motor";
  return "memory";
}

function collectObject(object) {
  if (state.collectedObjects.includes(object.id)) {
    writeJournal(afterText(object));
    setCaption(afterText(object));
    announceFeedback("settled", "Already held. The object stays clear.");
    return;
  }

  state.collectedObjects.push(object.id);
  if (object.item) addItem(object.item);
  if (object.fragment) addFragment(object.fragment);
  writeJournal(object.text);
  setCaption(afterText(object));

  if (object.item === "glasses") {
    complete("glasses");
    ground(1.5);
    nudgeSymptom("visuospatial", -0.6);
    addSymptomLog("Visual support improved room readability after glasses were found.");
    playSound("ground");
  } else {
    ground(0.2);
    if (object.item === "keys") {
      nudgeSymptom("motor", 0.2);
      addSymptomLog({
        clinical: "Fine-motor hesitation noted while collecting keys.",
        human: "Your hand took an extra second and still found them."
      });
      playSound("keys");
    } else if (["transit_card", "tote_bag", "sneakers"].includes(object.item)) {
      addMorningRecord(`${itemData[object.item].name} gathered for departure.`);
      addCarePerspective("Gathering objects in one visible place can lower pressure without removing choice.");
      nudgeSymptom("visuospatial", -0.12);
      playSound("page");
    } else {
      playSound("page");
    }
  }
  announceFeedback("changed", `${object.labels.clear} settles into the morning.`);
}

function inspectObject(object) {
  writeJournal(object.text);
  setCaption(object.text);
  if (object.fragment) addFragment(object.fragment);
  nudgeSymptom(domainForObject(object), 0.12);
  ground(0.2);
  playSound("page");
}

function confirmOrganizer(object) {
  state.flags.organizerConfirmed = true;
  addItem("pill_organizer");
  writeJournal(object.text);
  setCaption("Medication is not taken yet. The organizer has made the instruction clearer.");
  addSymptomLog("External cue reduced medication uncertainty.");
  addCareNote("Pill organizer helped confirm the day without relying on memory alone.");
  nudgeSymptom("executiveFunction", -0.5);
  ground(0.5);
  playSound("ground");
}

function makeTea(object) {
  if (state.flags.teaMade) {
    writeJournal("The mug is warm. The sequence has already become part of the morning.");
    return;
  }

  if (!hasItem("mug") || !hasItem("tea_bag")) {
    soften(0.45);
    nudgeSymptom("executiveFunction", 0.35);
    addSymptomLog("Sequencing load increased at kettle before mug and tea bag were gathered.");
    gentlePause("The kettle waits for the mug and tea bag first.");
    return;
  }

  state.flags.teaMade = true;
  complete("tea");
  writeJournal(object.text);
  setCaption("Tea made: mug, tea bag, water, switch. The order is outside of memory now.");
  addMorningRecord("Tea sequence completed with visible object cues.");
  addSymptomLog("Routine sequence stabilized through embodied steps: mug, tea, water, switch.");
  nudgeSymptom("executiveFunction", -0.45);
  ground(0.9);
  playSound("kettle");
}

function takeMedication(object) {
  if (state.completed.includes("medication")) {
    writeJournal("The medication step is complete. The organizer stays on the counter as a quiet record.");
    return;
  }

  if (!state.flags.teaMade) {
    soften(0.5);
    nudgeSymptom("executiveFunction", 0.3);
    gentlePause("The bottle is here, but the morning asks for tea first.");
    return;
  }

  if (!state.flags.organizerConfirmed) {
    soften(0.5);
    nudgeSymptom("memory", 0.35);
    addSymptomLog("Medication uncertainty increased when memory was used without an external cue.");
    gentlePause("The organizer can confirm today before the bottle asks you to remember.");
    return;
  }

  complete("medication");
  writeJournal(object.text);
  setCaption("Medication confirmed with the organizer. A routine can be supported without shame.");
  addMorningRecord("Medication confirmed with organizer and tea sequence.");
  ground(0.8);
  playSound("ground");
}

function reconstructPhoto(object) {
  addItem("photo");
  if (!state.fragments.includes("mango")) addFragment("mango", false);

  const clues = ["mango", "blue_towel", "wind"].filter((id) => state.fragments.includes(id));
  if (state.flags.photoRebuilt) {
    writeJournal("Mom, beach, 2018. Mango tea. Blue towel. Wind in her hair.");
    return;
  }

  if (clues.length < 2) {
    soften(0.35);
    nudgeSymptom("recognition", 0.3);
    addSymptomLog("Photo recognition remained partial until sensory anchors were gathered.");
    writeJournal(object.text);
    setCaption("The photo is close. More clues in the apartment may help the memory gather.");
    return;
  }

  state.flags.photoRebuilt = true;
  complete("photo");
  writeJournal("Mom at the beach, 2018. Mango tea, blue towel, wind in her hair. The name arrives gently.");
  setCaption("The memory is reconstructed from clues, not forced.");
  addMorningRecord("Photo memory reconstructed through sensory anchors.");
  addReflection("Memory returned through smell, color, and motion rather than pressure.");
  nudgeSymptom("recognition", -0.55);
  nudgeSymptom("memory", -0.35);
  ground(0.9);
  playSound("memory");
}

function usePhone(object) {
  if (!hasItem("phone")) {
    collectObject(object);
    complete("phone");
    setCaption("The phone is in your pocket. The message can become smaller now.");
    return;
  }

  if (state.flags.phoneUsed) {
    writeJournal("The call has already helped shape the morning.");
    return;
  }

  moveToNode("phone_closeup", "choice");
}

function useGroupChat(object) {
  if (state.flags.textHandled) {
    writeJournal("The message is already small enough to send: 'Running slow. I care. Text soon.'");
    return;
  }

  state.flags.textHandled = true;
  addFragment("half_text");
  addMessage("Group chat draft: Running slow. I care. Text soon.");
  writeJournal("You send a simple text instead of the perfect one: 'Running slow. I care. Text soon.'");
  setCaption("The reply is small, honest, and enough.");
  addSymptomLog({
    clinical: "Expressive language slowed near social pressure.",
    human: "You knew what you meant before the words trusted you."
  });
  addCarePerspective("Support can include making communication smaller without making the person smaller.");
  state.flags.oneQuestionAtATime = true;
  nudgeSymptom("language", -0.35);
  nudgeSymptom("dread", -0.25);
  ground(0.45);
  playSound("text");
}

function useVoiceMemo(object) {
  if (state.flags.voiceMemoPlayed) {
    writeJournal("The transcript card is still there: No rush. I am here.");
    ground(0.35);
    return;
  }

  state.flags.voiceMemoPlayed = true;
  addFragment("hard_mornings");
  addMessage("Voice memo transcript: No rush. I'm here. You do not have to prove anything to me.");
  writeJournal("The memo transcript reads: 'No rush. I'm here. You are not a problem I am solving.'");
  setCaption("The words are present without taking the morning away.");
  addSymptomLog({
    clinical: "Relational cue reduced dread during disorientation.",
    human: "Someone believed you, even when the room did not."
  });
  addCarePerspective("Care should make the room easier to read, not make the person smaller.");
  nudgeSymptom("dread", -0.65);
  nudgeSymptom("overload", -0.2);
  ground(0.75);
  playSound("phone");
}

function useLaptop(object) {
  if (state.flags.laptopHandled) {
    writeJournal("The project is saved with one sentence added. That counts.");
    return;
  }

  state.flags.laptopHandled = true;
  addItem("laptop");
  writeJournal("You write one sentence in the project notes, then set a reminder instead of forcing the whole task.");
  setCaption("One sentence is a real step. Closing the laptop can be support, too.");
  addMorningRecord("Laptop project narrowed to one sentence and one reminder.");
  addCarePerspective("The goal is not a perfect morning. The goal is a morning with less fear.");
  addSymptomLog({
    clinical: "Task initiation improved when the next action became smaller.",
    human: "The project still belonged to you, even unfinished."
  });
  nudgeSymptom("executiveFunction", -0.45);
  nudgeSymptom("overload", -0.4);
  ground(0.45);
  playSound("page");
}

function usePlaylist(object) {
  if (state.flags.playlistUsed) {
    writeJournal("The grounding song is pinned now. It can be found again.");
    return;
  }

  state.flags.playlistUsed = true;
  addItem("earbuds");
  addFragment("song_basil");
  addSong("Track three: the basil song. Recognition before facts.");
  writeJournal("The song begins. Your shoulders remember first; the story arrives after.");
  setCaption("Music becomes a cue, not a demand.");
  addSymptomLog({
    clinical: "Recognition improved with auditory cueing.",
    human: "The song found the memory before the facts did."
  });
  nudgeSymptom("recognition", -0.55);
  nudgeSymptom("dread", -0.25);
  ground(0.8);
  playSound("song");
}

function waterPlant(object) {
  if (state.flags.plantWatered) {
    writeJournal("The basil is watered. Small care remains complete.");
    return;
  }

  state.flags.plantWatered = true;
  addFragment("basil_window");
  writeJournal("You water the basil. The leaves shine. A responsibility becomes small enough to finish.");
  setCaption("The plant only asked for water.");
  addMorningRecord("Plant care completed with a small visible cue.");
  addCarePerspective("A cue can preserve independence instead of replacing it.");
  addSymptomLog({
    clinical: "Simple responsibility supported grounding.",
    human: "The plant made care small enough to complete."
  });
  nudgeSymptom("overload", -0.2);
  ground(0.5);
  playSound("ground");
}

function openPhone() {
  const thread = $("#phoneThread");
  if (thread) {
    thread.innerHTML = `
      <p class="bubble them">No rush. I am here.</p>
      <p class="bubble them">Want me to stay on the phone, or just text?</p>
      <p class="bubble me draft">Draft: I need one question at a time.</p>
    `;
  }
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
  nudgeSymptom("recognition", -0.4);
  nudgeSymptom("memory", choice.id === "deny_help" ? 0.25 : -0.15);
  if (choice.id === "ask_help") state.flags.oneQuestionAtATime = true;
  addSymptomLog(choice.id === "deny_help"
    ? {
      clinical: "Support was declined; independence preserved while morning pressure stayed present.",
      human: "Privacy mattered, and the door stayed open for later help."
    }
    : {
      clinical: "Familiar voice reduced distress and improved orientation.",
      human: "Care stayed beside you instead of taking the wheel."
    });
  addCarePerspective(choice.id === "deny_help"
    ? "Privacy and support can both be valid needs."
    : "Helping is not the same as correcting.");
  addCareNote(`Phone choice: ${choice.label}.`);
  addMessage(`Phone: ${choice.line}`);
  addFragment("voice");
  writeJournal(`You say: "${choice.line}"`);
  writeJournal(choice.reply);
  setCaption("The call becomes a support cue, not a test.");
  playSound("phone");
  closeModal("phoneModal");
  renderAll();
  saveGame();
}

function tryLeave(object) {
  const needed = sliceRequiredItems;
  const missing = needed.filter((item) => !hasItem(item));

  if (state.flags.rescheduled) {
    showEnding("notToday");
    return;
  }

  if (!state.supportPlaced.includes("door") && state.symptoms.visuospatial >= 3.2 && !state.flags.callOpen) {
    soften(0.55);
    nudgeSymptom("visuospatial", 0.35);
    addSymptomLog("Hallway felt spatially unstable until a door cue was available.");
    gentlePause("The hallway seems longer than it was. A door cue or checklist can make the threshold clearer.");
    return;
  }

  if (missing.length > 0) {
    soften(0.55);
    nudgeSymptom("executiveFunction", 0.4);
    gentlePause(`The door waits. Still missing: ${missing.map((item) => itemData[item].name).join(", ")}.`);
    return;
  }

  complete("leave");
  showEnding(selectEnding());
}

function selectEnding() {
  if (state.flags.rescheduled) return "notToday";
  if (state.symptoms.overload >= 4 || state.symptoms.dread >= 4.4 || state.flags.callOpen) return "overloadedNotAlone";
  return "supported";
}

function showEnding(id) {
  const ending = endings[id] || endings.unsteady;
  state.endingId = id;
  addMorningRecord(`Ending reached: ${ending.title}.`);
  addReflection(ending.points.at(-1) || "Reflect on what helped the morning feel held.");
  els.menuScreen.classList.add("hidden");
  els.gameScreen.classList.add("hidden");
  els.endingScreen.classList.remove("hidden");
  els.endingTitle.textContent = ending.title;
  els.endingText.textContent = ending.text;
  els.endingPoints.innerHTML = ending.points.map((point) => `<li>${point}</li>`).join("");
  els.reflectionPrompts.innerHTML = reflectionPrompts.map((prompt) => `
    <button type="button" data-reflection-prompt="${prompt}">${prompt}</button>
  `).join("");
  els.reflectionInput.value = "";
  $$("[data-reflection-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      els.reflectionInput.value = `${button.dataset.reflectionPrompt} `;
      els.reflectionInput.focus();
    });
  });
  state.screen = "ending";
  saveGame();
}

function saveEndingReflection() {
  const text = els.reflectionInput.value.trim();
  if (!text) return;
  addReflection(text);
  els.reflectionInput.value = "";
  writeJournal("Reflection saved to the Memory Book.");
  saveGame();
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
  addMorningRecord(`Memory fragment stored: ${memoryFragments[fragmentId].title}.`);
  if (announce) writeJournal(`Memory fragment added: ${memoryFragments[fragmentId].title}.`);
  announceFeedback("memory", `Memory fragment settled: ${memoryFragments[fragmentId].title}.`);
  playSound("memory");
}

function addSong(text) {
  if (!text) return;
  state.songs.unshift(text);
  state.songs = [...new Set(state.songs)].slice(0, 30);
}

function addMessage(text) {
  if (!text) return;
  state.messages.unshift(text);
  state.messages = [...new Set(state.messages)].slice(0, 30);
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
  announceFeedback("overload", "The room offers a smaller clue.");
  playSound("overload");
}

function ground(amount) {
  state.clarity = clamp(state.clarity + amount, 1, 6);
  state.symptoms.grounding = clamp(state.symptoms.grounding + amount, 1, 6);
  for (const key of ["memory", "language", "visuospatial", "executiveFunction", "motor", "recognition"]) {
    nudgeSymptom(key, -amount * 0.08);
  }
  nudgeSymptom("overload", -amount * 0.18);
  nudgeSymptom("dread", -amount * 0.12);
  if (amount >= 0.7) announceFeedback("ground", "The text settles. The next step gets smaller.");
}

function soften(amount) {
  state.clarity = clamp(state.clarity - amount, 1, 6);
  state.symptoms.grounding = clamp(state.symptoms.grounding - amount * 0.35, 1, 6);
  nudgeSymptom("overload", amount * 0.22);
  nudgeSymptom("dread", amount * 0.14);
  if (amount >= 0.45) announceFeedback("dread", "The wash deepens. Try one smaller step.");
}

function nudgeSymptom(domain, amount) {
  if (!(domain in state.symptoms) || domain === "grounding") return;
  state.symptoms[domain] = clamp(state.symptoms[domain] + amount, 1, 6);
}

function addSymptomLog(text) {
  if (!text) return;
  const entry = typeof text === "string"
    ? { clinical: text, human: "The room changed, and you adjusted without shame." }
    : text;
  const key = `${entry.clinical} ${entry.human}`;
  if (!state.symptomLog.some((item) => `${item.clinical || item} ${item.human || ""}` === key)) {
    state.symptomLog.unshift(entry);
  }
  state.symptomLog = state.symptomLog.slice(0, 40);
}

function addMorningRecord(text) {
  if (!text) return;
  state.morningRecords.unshift(text);
  state.morningRecords = [...new Set(state.morningRecords)].slice(0, 40);
}

function addCareNote(text) {
  if (!text) return;
  state.careNotes.unshift(text);
  state.careNotes = [...new Set(state.careNotes)].slice(0, 40);
}

function addCarePerspective(text) {
  if (!text) return;
  state.carePerspective.unshift(text);
  state.carePerspective = [...new Set(state.carePerspective)].slice(0, 40);
}

function addClinicalNote(text) {
  addCareNote(text);
  if (text.startsWith("Observation:")) addSymptomLog(text.replace("Observation: ", ""));
  if (text.startsWith("Clinical:")) {
    const [clinical, human = "Human: the experience mattered beyond the observation."] = text.split(" Human:");
    addSymptomLog({ clinical: clinical.replace("Clinical: ", ""), human: human.replace(/^ /, "") });
  }
}

function addReflection(text) {
  if (!text) return;
  state.reflections.unshift(text);
  state.reflections = [...new Set(state.reflections)].slice(0, 40);
}

function playSound(type) {
  return type;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function afterText(object) {
  return object.after || object.text || "The object stays where it is, a little clearer now.";
}

function setCaption(text) {
  setVN(state.vnSpeaker || currentSceneNode()?.speaker || "Morning", text, []);
}

function announceFeedback(type, text) {
  if (!els.feedbackLayer || !text) return;
  els.feedbackLayer.className = `feedback-layer feedback-${type}`;
  els.feedbackLayer.innerHTML = `<span>${text}</span>`;
  window.clearTimeout(announceFeedback.timeout);
  announceFeedback.timeout = window.setTimeout(() => {
    if (els.feedbackLayer) els.feedbackLayer.innerHTML = "";
  }, state.settings.reducedMotion ? 1400 : 2400);
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
  const slots = Array.from({ length: 15 }, (_, index) => state.inventory[index] || null);
  els.inventory.innerHTML = slots.map((itemId, index) => {
    if (!itemId) return `<span class="slot empty">${state.inventory.length || index > 0 ? "open space" : "Your hands are free"}</span>`;
    const item = itemData[itemId];
    return `<span class="slot filled" title="${item.name}"><b>${item.icon}</b>${item.name}</span>`;
  }).join("");
}

function renderJournal() {
  els.journalLog.innerHTML = state.journal.length
    ? state.journal.map((line) => `<p class="entry">${line}</p>`).join("")
    : `<p class="entry">Journal entries will gather here as you move through the morning.</p>`;
}

function renderMetacognitionPanel() {
  if (!els.metacognitionPanel) return;
  const total = Math.max(1, state.metacognition.sure + state.metacognition.partial + state.metacognition.unsure);
  const pct = (value) => `${Math.round((value / total) * 100)}%`;
  const last = state.selfMonitoring[0];
  els.metacognitionPanel.innerHTML = `
    <div class="meta-meter">
      <span><b>Sure</b><em>${state.metacognition.sure}</em></span><i style="--value:${pct(state.metacognition.sure)}"></i>
      <span><b>Partial</b><em>${state.metacognition.partial}</em></span><i style="--value:${pct(state.metacognition.partial)}"></i>
      <span><b>Unsure</b><em>${state.metacognition.unsure}</em></span><i style="--value:${pct(state.metacognition.unsure)}"></i>
    </div>
    <p>${last ? last.human : "Confidence checks will gather here when you inspect objects."}</p>
  `;
}

function renderQuickMemoryGrid() {
  if (!els.quickMemoryGrid) return;
  const counts = {
    Fragments: state.fragments.length,
    Songs: state.songs.length,
    Messages: state.messages.length,
    Symptoms: state.symptomLog.length,
    Care: state.carePerspective.length,
    Monitor: state.selfMonitoring.length
  };
  els.quickMemoryGrid.innerHTML = Object.entries(counts).map(([label, value]) => `
    <button type="button" data-quick-book="${label.toLowerCase()}">
      <strong>${label}</strong>
      <span>${value}</span>
    </button>
  `).join("");
  $$("[data-quick-book]").forEach((button) => {
    button.addEventListener("click", () => {
      const map = { fragments: "fragments", songs: "songs", messages: "messages", symptoms: "symptoms", care: "carePerspective", monitor: "selfMonitoring" };
      state.memoryBookSection = map[button.dataset.quickBook] || "fragments";
      openModal("memoryBookModal");
    });
  });
}

function renderMemoryBook() {
  if (!memoryBookSections.some((section) => section.id === state.memoryBookSection)) {
    state.memoryBookSection = "fragments";
  }
  els.memoryTabs.innerHTML = memoryBookSections.map((section) => `
    <button type="button" class="${state.memoryBookSection === section.id ? "active" : ""}" data-book-section="${section.id}">
      ${section.label}
    </button>
  `).join("");

  $$("[data-book-section]").forEach((button) => {
    button.addEventListener("click", () => {
      state.memoryBookSection = button.dataset.bookSection;
      renderMemoryBook();
      saveGame();
    });
  });

  const section = state.memoryBookSection;
  if (section === "fragments") {
    const entries = state.fragments.map((id) => memoryFragments[id]).filter(Boolean);
    els.memoryEntries.innerHTML = entries.length
      ? entries.map((entry) => `
        <article class="memory-entry fragment-card mood-${slug(entry.room)}">
          <div class="entry-tags">
            <span>${entry.room}</span>
            <span>${entry.text.includes("before") ? "partial" : "settled"}</span>
            <span>${entry.text.includes("smells") || entry.text.includes("song") ? "sensory" : "memory"}</span>
          </div>
          <h3>${entry.title}</h3>
          <p>${state.settings.plainLanguage ? plainMemory(entry.text) : entry.text}</p>
        </article>
      `).join("")
      : `<p class="empty-state">Nothing has settled yet. Fragments will arrive as smell, color, sound, voice, place.</p>`;
    return;
  }

  const sectionData = {
    records: state.morningRecords,
    selfMonitoring: state.selfMonitoring,
    songs: state.songs,
    messages: state.messages,
    carePerspective: state.carePerspective.length
      ? state.carePerspective
      : [
        "Helping is not the same as correcting.",
        "They are not becoming less themselves. They are navigating more noise.",
        "Dread can grow in the space between knowing something matters and not knowing why."
      ],
    symptoms: state.symptomLog,
    reflections: state.reflections
  }[section] || [];

  const emptyCopy = {
    songs: "No song has found the room yet.",
    messages: "No message has been saved or sent yet.",
    carePerspective: "How care helped will gather here.",
    symptoms: "The room is quiet for now.",
    records: "No morning records have dried on the page yet.",
    selfMonitoring: "No confidence checks have been written into the morning yet.",
    reflections: "You have not written back to the morning yet."
  };

  els.memoryEntries.innerHTML = sectionData.length
    ? sectionData.map((line) => {
      if (typeof line === "object") {
        if (line.confidence) {
          return `
            <article class="memory-entry paired-note">
              <span>${line.confidence}</span>
              <p><strong>Scene:</strong> ${line.sceneTitle || line.sceneNode || "Current view"}</p>
              <p><strong>Object:</strong> ${line.object}</p>
              <p><strong>Support used:</strong> ${line.supportUsed ? "yes" : "not yet"}</p>
              <p>${line.text}</p>
              <p><strong>Human:</strong> ${line.human}</p>
            </article>
          `;
        }
        return `
          <article class="memory-entry paired-note">
            <p><strong>Clinical:</strong> ${line.clinical}</p>
            <p><strong>Human:</strong> ${line.human}</p>
          </article>
        `;
      }
      return `<article class="memory-entry"><p>${line}</p></article>`;
    }).join("")
    : `<p class="empty-state">${emptyCopy[section] || "Nothing has settled yet."}</p>`;
}

function renderSymptomLog() {
  const entries = state.symptomLog.length ? state.symptomLog : ["The room is quiet for now."];
  els.symptomLogEntries.innerHTML = entries.map((line) => {
    if (typeof line === "object") {
      return `
        <article class="entry paired-note">
          <p><strong>Clinical:</strong> ${line.clinical}</p>
          <p><strong>Human:</strong> ${line.human}</p>
        </article>
      `;
    }
    return `<p class="entry">${line}</p>`;
  }).join("");
}

function plainMemory(text) {
  return text
    .replace("The scent reaches the memory before the date does.", "A smell helps bring back part of a memory.")
    .replace("The photo memory finds wind before it finds the year.", "A sensory clue helps the photo feel clearer.")
    .replace("It does not argue. It simply waits.", "It gives a clear reminder without pressure.");
}

function openSupport() {
  els.supportStyleChoices.innerHTML = Object.entries(supportStyles).map(([id, style]) => `
    <button type="button" class="${state.supportStyle === id ? "active" : ""}" data-support-style="${id}">
      <strong>${style.label}</strong>
      <span>${style.example}</span>
    </button>
  `).join("");

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
  $$("[data-support-style]").forEach((button) => {
    button.addEventListener("click", () => {
      state.supportStyle = button.dataset.supportStyle;
      openSupport();
      saveGame();
    });
  });
  $$("[data-support-target]").forEach((button) => {
    button.addEventListener("click", () => placeSupport(button.dataset.supportTarget));
  });
}

function placeSupport(targetId) {
  if (!state.supportPlaced.includes(targetId)) {
    const style = supportStyles[state.supportStyle] || supportStyles.gentle;
    state.supportPlaced.push(targetId);
    state.support = clamp(state.support + style.effect.support, 1, 6);
    state.metacognition.cuesUsed += 1;
    state.clarity = clamp(state.clarity + style.effect.clarity, 1, 6);
    nudgeSymptom("dread", style.effect.dread);
    nudgeSymptom("overload", style.effect.overload);
    ground(0.45);
    const target = supportTargets.find((item) => item.id === targetId);
    writeJournal(`${target.text} Support style: ${style.label}.`);
    addCareNote(`${style.label} placed near ${target.label}. ${style.note}`);
    addCarePerspective(style.note);
    addSymptomLog({
      clinical: `${target.label} support improved readability and reduced task load.`,
      human: style.example
    });
    if (targetId === "door") nudgeSymptom("visuospatial", -0.65);
    if (targetId === "medication" || targetId === "kettle") nudgeSymptom("executiveFunction", -0.65);
    if (targetId === "phone") nudgeSymptom("recognition", -0.45);
    if (targetId === "calendar") nudgeSymptom("memory", -0.45);
    if (targetId === "laptop") nudgeSymptom("executiveFunction", -0.45);
    if (targetId === "playlist") nudgeSymptom("recognition", -0.35);
    if (targetId === "plant") nudgeSymptom("overload", -0.25);
    if (targetId === "transit") nudgeSymptom("visuospatial", -0.35);
    setCaption("Support placed. The room becomes easier to read, without pretending the morning is solved.");
    announceFeedback("support", `${style.label}: ${target.label} cue placed.`);
    playSound("ground");
  }
  closeModal("supportModal");
  renderAll();
  saveGame();
}

window.softRecallTrailer = {
  async run() {
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    $("#newGame").click();
    await wait(500);
    $("#beginCaseFile").click();
    await wait(500);
    $("#finishOnboarding").click();
    await wait(900);
    await trailerClick("bedside_glasses", 900);
    await trailerNode("phone_closeup", 900);
    $('[data-vn-choice="2"]')?.click();
    await wait(1200);
    await trailerNode("bedroom_mirror", 900);
    $('[data-vn-choice="1"]')?.click();
    await wait(1000);
    await trailerNode("hallway_mid", 900);
    await trailerClick("keys", 700);
    await trailerClick("appointment_card", 700);
    $("#openSupport").click();
    await wait(500);
    $('[data-support-style="gentle"]').click();
    await wait(300);
    $('[data-support-target="door"]').click();
    await wait(900);
    await trailerNode("hallway_door", 900);
    await trailerClick("front_door", 1200);
    await wait(5000);
  }
};

async function trailerNode(nodeId, delay) {
  moveToNode(nodeId, "trailer");
  await new Promise((resolve) => setTimeout(resolve, delay));
}

async function trailerRoom(roomId, delay) {
  $(`#roomMap [data-room="${roomId}"]`).click();
  await new Promise((resolve) => setTimeout(resolve, delay));
}

async function trailerClick(objectId, delay) {
  const button = $(`[data-object="${objectId}"]`);
  if (button) button.click();
  await new Promise((resolve) => setTimeout(resolve, Math.min(450, delay)));
  const useButton = $('[data-inspection-action="use"]');
  if (useButton) useButton.click();
  await new Promise((resolve) => setTimeout(resolve, delay));
}

init();
