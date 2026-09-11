export type RoomId = "bedroom" | "hallway" | "kitchen" | "bathroom";
export type SceneId = RoomId | "phone" | "frontdoor";
export type EndingId = "supported" | "smaller" | "overloaded";

export type MemorySection = "Fragments" | "Messages" | "Routines" | "Reflections";

export interface MemoryEntry {
  section: MemorySection;
  title: string;
  body: string;
  at?: number;
  room?: string;
}

export interface PackedItems {
  keys: boolean;
  bag: boolean;
  phone: boolean;
}

export interface MemoryBookReview {
  noticed: boolean;
  helped: boolean;
  uncertain: boolean;
  contextRead: boolean;
}

export interface GameSave {
  schemaVersion: typeof GAME_SAVE_VERSION;
  currentRoom: RoomId;
  visitedRooms: RoomId[];
  unlockedRooms: RoomId[];
  completedInteractions: string[];
  interactionOrder: string[];
  memoryEntries: MemoryEntry[];
  roomVisitOrder: RoomId[];
  confidenceChoices: number[];
  supportCueUseCount: number;
  packedItems: PackedItems;
  frontDoorUnlocked: boolean;
  wrongCount: number;
  clarity: number;
  dissonance: number;
  endingState: EndingId | null;
  storyProgress: Partial<Record<RoomId, number>>;
  storyChoices: Record<string, string[]>;
  viewedCutscenes: string[];
  memoryBookReview: MemoryBookReview;
}

export const GAME_SAVE_VERSION = 3 as const;
export const GAME_SAVE_KEY = "soft-recall.save.v5";
export const LEGACY_GAME_SAVE_KEYS = ["soft-recall.save.v4"] as const;

const ROOMS: RoomId[] = ["bedroom", "hallway", "kitchen", "bathroom"];
const ENDINGS: EndingId[] = ["supported", "smaller", "overloaded"];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isRoom = (value: unknown): value is RoomId =>
  typeof value === "string" && ROOMS.includes(value as RoomId);

const isEnding = (value: unknown): value is EndingId =>
  typeof value === "string" && ENDINGS.includes(value as EndingId);

const stringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

const roomArray = (value: unknown, fallback: RoomId[]): RoomId[] => {
  const rooms = Array.isArray(value) ? value.filter(isRoom) : [];
  return rooms.length > 0 ? rooms : fallback;
};

const numberArray = (value: unknown): number[] =>
  Array.isArray(value)
    ? value.filter((item): item is number => typeof item === "number" && Number.isFinite(item))
    : [];

const finiteNumber = (value: unknown, fallback = 0): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const memoryArray = (value: unknown): MemoryEntry[] => {
  if (!Array.isArray(value)) return [];
  const sections: MemorySection[] = ["Fragments", "Messages", "Routines", "Reflections"];
  return value.flatMap((item) => {
    if (!isRecord(item) || !sections.includes(item.section as MemorySection)) return [];
    if (typeof item.title !== "string" || typeof item.body !== "string") return [];
    return [{
      section: item.section as MemorySection,
      title: item.title,
      body: item.body,
      at: typeof item.at === "number" ? item.at : undefined,
      room: typeof item.room === "string" ? item.room : undefined,
    }];
  });
};

const storyProgress = (value: unknown): Partial<Record<RoomId, number>> => {
  if (!isRecord(value)) return {};
  return ROOMS.reduce<Partial<Record<RoomId, number>>>((result, room) => {
    const progress = value[room];
    if (typeof progress === "number" && Number.isInteger(progress) && progress >= 0) {
      result[room] = progress;
    }
    return result;
  }, {});
};

const storyChoices = (value: unknown): Record<string, string[]> => {
  if (!isRecord(value)) return {};
  return Object.entries(value).reduce<Record<string, string[]>>((result, [key, choices]) => {
    if (Array.isArray(choices)) {
      const validChoices = choices.filter((choice): choice is string => typeof choice === "string");
      if (validChoices.length > 0) result[key] = validChoices;
    }
    return result;
  }, {});
};

const packedItems = (value: unknown): PackedItems => {
  const packed = isRecord(value) ? value : {};
  return {
    keys: packed.keys === true,
    bag: packed.bag === true,
    phone: packed.phone === true,
  };
};

const memoryBookReview = (value: unknown): MemoryBookReview => {
  const review = isRecord(value) ? value : {};
  return {
    noticed: review.noticed === true,
    helped: review.helped === true,
    uncertain: review.uncertain === true,
    contextRead: review.contextRead === true,
  };
};

export const isMemoryBookReviewComplete = (review: MemoryBookReview): boolean =>
  review.noticed && review.helped && review.uncertain && review.contextRead;

export function createInitialGameSave(): GameSave {
  return {
    schemaVersion: GAME_SAVE_VERSION,
    currentRoom: "bedroom",
    visitedRooms: ["bedroom"],
    unlockedRooms: ["bedroom"],
    completedInteractions: [],
    interactionOrder: [],
    memoryEntries: [],
    roomVisitOrder: ["bedroom"],
    confidenceChoices: [],
    supportCueUseCount: 0,
    packedItems: { keys: false, bag: false, phone: false },
    frontDoorUnlocked: false,
    wrongCount: 0,
    clarity: 0,
    dissonance: 0,
    endingState: null,
    storyProgress: {},
    storyChoices: {},
    viewedCutscenes: [],
    memoryBookReview: { noticed: false, helped: false, uncertain: false, contextRead: false },
  };
}

export function parseGameSave(raw: string): GameSave | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;

    const currentRoom = isRoom(parsed.currentRoom)
      ? parsed.currentRoom
      : isRoom(parsed.room)
        ? parsed.room
        : "bedroom";

    const save: GameSave = {
      schemaVersion: GAME_SAVE_VERSION,
      currentRoom,
      visitedRooms: roomArray(parsed.visitedRooms ?? parsed.visited, ["bedroom"]),
      unlockedRooms: roomArray(parsed.unlockedRooms ?? parsed.unlocked, ["bedroom"]),
      completedInteractions: stringArray(parsed.completedInteractions ?? parsed.done),
      interactionOrder: stringArray(parsed.interactionOrder),
      memoryEntries: memoryArray(parsed.memoryEntries ?? parsed.memory),
      roomVisitOrder: roomArray(parsed.roomVisitOrder, [currentRoom]),
      confidenceChoices: numberArray(parsed.confidenceChoices),
      supportCueUseCount: Math.max(0, finiteNumber(parsed.supportCueUseCount)),
      packedItems: packedItems(parsed.packedItems ?? parsed.packed),
      frontDoorUnlocked: parsed.frontDoorUnlocked === true,
      wrongCount: Math.max(0, finiteNumber(parsed.wrongCount)),
      clarity: finiteNumber(parsed.clarity),
      dissonance: Math.max(0, finiteNumber(parsed.dissonance)),
      endingState: isEnding(parsed.endingState) ? parsed.endingState : null,
      storyProgress: storyProgress(parsed.storyProgress),
      storyChoices: storyChoices(parsed.storyChoices),
      viewedCutscenes: stringArray(parsed.viewedCutscenes),
      memoryBookReview: memoryBookReview(parsed.memoryBookReview),
    };

    if (!save.visitedRooms.includes(save.currentRoom)) save.visitedRooms.push(save.currentRoom);
    if (!save.unlockedRooms.includes("bedroom")) save.unlockedRooms.unshift("bedroom");
    if (!save.unlockedRooms.includes(save.currentRoom)) save.unlockedRooms.push(save.currentRoom);
    return save;
  } catch {
    return null;
  }
}

export function loadGameSave(storage: Storage): GameSave | null {
  for (const key of [GAME_SAVE_KEY, ...LEGACY_GAME_SAVE_KEYS]) {
    const raw = storage.getItem(key);
    if (!raw) continue;
    const save = parseGameSave(raw);
    if (save) return save;
  }
  return null;
}

export function hasGameSave(storage: Storage): boolean {
  return loadGameSave(storage) !== null;
}

export function writeGameSave(storage: Storage, save: GameSave): void {
  storage.setItem(GAME_SAVE_KEY, JSON.stringify({ ...save, schemaVersion: GAME_SAVE_VERSION }));
}

export function clearGameSave(storage: Storage): void {
  storage.removeItem(GAME_SAVE_KEY);
  LEGACY_GAME_SAVE_KEYS.forEach((key) => storage.removeItem(key));
}
