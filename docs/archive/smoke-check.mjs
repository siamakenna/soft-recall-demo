import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const files = [
  "index.html",
  "styles.css",
  "game.js",
  "README.md",
  "PRODUCTION_DIRECTION.md",
  "VERTICAL_SLICE_SCOPE.md",
  "ART_DIRECTION.md",
  "AI_USE_LOG.md",
  "assets/scenes/bedroom_bedside.svg",
  "assets/scenes/bedroom_mirror.svg",
  "assets/scenes/phone_closeup.svg",
  "assets/scenes/hallway_mid.svg",
  "assets/scenes/hallway_door.svg",
  "assets/ui/paper_texture.svg",
  "assets/ui/watercolor_noise.svg"
];

for (const file of files) {
  const content = readFileSync(resolve(root, file), "utf8");
  if (!content.trim()) throw new Error(`${file} is empty`);
}

const html = readFileSync(resolve(root, "index.html"), "utf8");
const css = readFileSync(resolve(root, "styles.css"), "utf8");
const js = readFileSync(resolve(root, "game.js"), "utf8");
const readme = readFileSync(resolve(root, "README.md"), "utf8");
const production = readFileSync(resolve(root, "PRODUCTION_DIRECTION.md"), "utf8");
const scope = readFileSync(resolve(root, "VERTICAL_SLICE_SCOPE.md"), "utf8");
const art = readFileSync(resolve(root, "ART_DIRECTION.md"), "utf8");
const aiLog = readFileSync(resolve(root, "AI_USE_LOG.md"), "utf8");
const serve = readFileSync(resolve(root, "serve.mjs"), "utf8");
const scriptsServe = readFileSync(resolve(root, "scripts/serve.mjs"), "utf8");

for (const id of [
  "newGame",
  "continueGame",
  "gameScreen",
  "roomStage",
  "inputPrompts",
  "inventory",
  "roomMap",
  "metacognitionPanel",
  "metacognitiveChoices",
  "inspectionModal",
  "memoryTabs",
  "supportStyleChoices",
  "accessibilityPanel",
  "feedbackLayer"
]) {
  if (!html.includes(id)) throw new Error(`Missing expected HTML id: ${id}`);
}

for (const token of [
  "verticalSliceRoomIds",
  "verticalSliceNodes",
  "sliceRequiredItems",
  "scenePlateAssets",
  "phone_closeup",
  "currentFocusIndex",
  "handleKeyboardInput",
  "startGamepadLoop",
  "handleGamepadInput",
  "interactiveElements",
  "controller-focus",
  "renderInputPrompts",
  "sceneNodes",
  "renderNodeExits",
  "moveToNode",
  "setVN",
  "renderVNBox",
  "assets/scenes/bedroom_bedside.svg",
  "assets/scenes/hallway_door.svg",
  "scene-art",
  "object-marker",
  "closeup-view",
  "Supported Departure",
  "Smaller Morning",
  "Overloaded but Not Alone",
  "localStorage",
  "recordMetacognitiveCheck",
  "supportStyles",
  "selfMonitoring",
  "function playSound(type) {\n  return type;",
  "reduceBlur",
  "disableDistortion"
]) {
  if (!js.includes(token)) throw new Error(`Missing expected game token: ${token}`);
}

for (const token of [
  "Vertical slice production viewport",
  "assets/ui/paper_texture.svg",
  "assets/ui/watercolor_noise.svg",
  "game-viewport",
  "scene-viewport",
  "first-person-scene",
  "scene-plate",
  "scene-art",
  "scene-ink-wash",
  "scene-paper-grain",
  "scene-surface",
  "scene-wall",
  "scene-floor",
  "scene-table",
  "scene-door",
  "scene-window",
  "scene-mirror",
  "scene-object",
  "object-marker",
  "node-exit",
  "vn-box",
  "vn-choice",
  "input-prompts",
  "controller-focus",
  "closeup-card",
  "state-dread",
  "state-supported"
]) {
  if (!css.includes(token)) throw new Error(`Missing expected CSS token: ${token}`);
}

for (const token of [
  "Current Prototype",
  "Intended Direction",
  "Core Gameplay",
  "Research Angle",
  "Controls",
  "Accessibility",
  "not medical advice"
]) {
  if (!readme.includes(token)) throw new Error(`Missing README text: ${token}`);
}

for (const [name, content, tokens] of [
  ["PRODUCTION_DIRECTION.md", production, ["Steam / PC Direction", "Engine Recommendation", "Controller Input Plan", "Migration Notes"]],
  ["VERTICAL_SLICE_SCOPE.md", scope, ["Core Scenes", "Required Interactions", "Required Endings", "Intentionally Cut", "Acceptance Criteria", "No audio"]],
  ["ART_DIRECTION.md", art, ["Visual Target", "Composition Rules", "Hotspot Rules", "VN Box Rules", "Scene Examples", "Show-Don't-Tell"]],
  ["AI_USE_LOG.md", aiLog, ["AI coding assistance", "No voice acting", "No live AI generation"]],
  ["serve.mjs", serve, [".svg", "image/svg+xml"]],
  ["scripts/serve.mjs", scriptsServe, [".svg", "image/svg+xml"]]
]) {
  for (const token of tokens) {
    if (!content.includes(token)) throw new Error(`Missing ${token} in ${name}`);
  }
}

console.log("Smoke check passed.");
