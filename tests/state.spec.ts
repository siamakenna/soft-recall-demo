import { expect, test } from "@playwright/test";
import { createInitialGameSave, GAME_SAVE_KEY, GAME_SAVE_VERSION, loadGameSave, parseGameSave, writeGameSave } from "../src/game/state";

test("round-trips every release save field without changing ending eligibility", () => {
  const save = {
    ...createInitialGameSave(),
    currentRoom: "hallway" as const,
    visitedRooms: ["bedroom", "hallway", "kitchen", "bathroom"] as const,
    unlockedRooms: ["bedroom", "hallway", "kitchen", "bathroom"] as const,
    completedInteractions: ["glasses", "note", "phone", "kettle", "tap"],
    interactionOrder: ["glasses", "note", "phone", "kettle", "tap"],
    memoryEntries: [{ section: "Fragments" as const, title: "A note", body: "A place to begin.", at: 1, room: "bedroom" }],
    roomVisitOrder: ["bedroom", "hallway", "kitchen", "hallway", "bathroom", "hallway"] as const,
    confidenceChoices: [1, 2],
    supportCueUseCount: 2,
    packedItems: { phone: true, bag: true, keys: true },
    frontDoorUnlocked: true,
    wrongCount: 3,
    clarity: 2,
    dissonance: 4,
    endingState: "overloaded" as const,
    storyProgress: { bedroom: 5 },
    storyChoices: { bedroom: ["keep"] },
    viewedCutscenes: ["waking", "note"],
    memoryBookReview: { noticed: true, helped: true, uncertain: true, contextRead: true },
    frustrationBeatSeen: true,
  };
  expect(parseGameSave(JSON.stringify(save))).toEqual(save);
});

test("migrates the preceding schema without changing counters or ending", () => {
  const { frustrationBeatSeen: _seen, ...previous } = createInitialGameSave();
  const migrated = parseGameSave(JSON.stringify({ ...previous, schemaVersion: 3, endingState: "supported", wrongCount: 2, dissonance: 3 }));
  expect(migrated).toMatchObject({ schemaVersion: GAME_SAVE_VERSION, endingState: "supported", wrongCount: 2, dissonance: 3, frustrationBeatSeen: false });
});

test("recovers legacy storage when the current save is malformed", () => {
  const values = new Map([
    [GAME_SAVE_KEY, "{broken"],
    ["soft-recall.save.v4", JSON.stringify({ room: "kitchen", visited: ["bedroom", "hallway", "kitchen"], unlocked: ["hallway", "kitchen"], done: ["phone"], packed: { phone: true } })],
  ]);
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } } as unknown as Storage;
  const recovered = loadGameSave(storage);
  expect(recovered).toMatchObject({ currentRoom: "kitchen", completedInteractions: ["phone"], packedItems: { phone: true, keys: false, bag: false } });
  expect(recovered?.unlockedRooms).toEqual(["bedroom", "hallway", "kitchen"]);
  writeGameSave(storage, recovered!);
  expect(JSON.parse(values.get(GAME_SAVE_KEY)!)).toHaveProperty("schemaVersion", GAME_SAVE_VERSION);
});

test("rejects broken JSON and normalizes invalid state fields", () => {
  for (const raw of ["{broken", "null", "[]", "false"]) expect(parseGameSave(raw)).toBeNull();
  expect(parseGameSave(JSON.stringify({ currentRoom: "outside", wrongCount: -10, dissonance: "many", memoryEntries: [null, { title: 4 }], packedItems: { keys: "true" } }))).toMatchObject({ currentRoom: "bedroom", wrongCount: 0, dissonance: 0, memoryEntries: [], packedItems: { keys: false } });
});
