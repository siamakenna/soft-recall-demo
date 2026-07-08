import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const files = ["index.html", "styles.css", "game.js", "README.md"];

for (const file of files) {
  const content = readFileSync(resolve(root, file), "utf8");
  if (!content.trim()) throw new Error(`${file} is empty`);
}

const html = readFileSync(resolve(root, "index.html"), "utf8");
const css = readFileSync(resolve(root, "styles.css"), "utf8");
const js = readFileSync(resolve(root, "game.js"), "utf8");
const readme = readFileSync(resolve(root, "README.md"), "utf8");

for (const id of [
  "newGame",
  "continueGame",
  "gameScreen",
  "roomStage",
  "checklist",
  "inventory",
  "roomMap",
  "symptomSummary",
  "metacognitionPanel",
  "quickMemoryGrid",
  "metacognitiveChoices",
  "inspectionModal",
  "inspectionFeeling",
  "memoryTabs",
  "symptomLogModal",
  "supportStyleChoices",
  "reflectionPrompts",
  "accessibilityPanel",
  "openAccessibilityGame",
  "feedbackLayer"
]) {
  if (!html.includes(id)) throw new Error(`Missing expected HTML id: ${id}`);
}

for (const token of [
  "window.softRecallTrailer",
  "rooms",
  "itemData",
  "localStorage",
  "showEnding",
  "symptomDomains",
  "currentPerceptionState",
  "inspectionData",
  "memoryBookSections",
  "playSound",
  "renderSymptomLog",
  "supportStyles",
  "carePerspective",
  "supportStyle",
  "selfMonitoring",
  "metacognition",
  "recordMetacognitiveCheck",
  "renderMetacognitionPanel",
  "renderQuickMemoryGrid",
  "group_chat",
  "voice_memo",
  "playlist",
  "laptop",
  "transit_card",
  "tote_bag",
  "sneakers",
  "overload",
  "dread",
  "uncanny",
  "Supported Departure",
  "Smaller Morning",
  "Quiet Proof",
  "Overloaded but Not Alone",
  "The Circled Appointment",
  "Shared Morning",
  "reduceBlur",
  "disableDistortion",
  "contentNote"
]) {
  if (!js.includes(token)) throw new Error(`Missing expected game token: ${token}`);
}

for (const token of [
  "watercolor-wash",
  "memory-bloom",
  "dread-stain",
  "grounding-light",
  "paper-grain",
  "ink-shadow",
  "soft-vignette",
  "threshold-haze",
  "scene-frame",
  "game-logo-card",
  "carried-tray",
  "quick-memory-grid",
  "meta-choice-grid",
  "state-dread",
  "state-memory",
  "state-grounded",
  "state-overloaded",
  "state-uncanny",
  "state-supported",
  "phone-surface",
  "fragment-card",
  "feedback-layer"
]) {
  if (!css.includes(token)) throw new Error(`Missing expected CSS token: ${token}`);
}

for (const token of [
  "plain HTML, CSS, and JavaScript",
  "not medical advice",
  "Symptom Log",
  "Close inspection",
  "Support Style",
  "Care Perspective",
  "metacognitive",
  "self-monitoring",
  "can affect younger adults",
  "modern watercolor-inspired",
  "GitHub Pages",
  "Roadmap"
]) {
  if (!readme.includes(token)) throw new Error(`Missing expected README text: ${token}`);
}


for (const token of [
  "whole-game-watercolor",
  "research-ready-surfaces",
  "full-surface-art-direction",
  "first-person-stage"
]) {
  if (!html.includes(token)) throw new Error(`Missing full-surface HTML token: ${token}`);
}

for (const token of [
  "firstPersonScenes",
  "firstPersonHotspots",
  "sceneNodes",
  "currentNode",
  "renderNodeExits",
  "moveToNode",
  "setVN",
  "renderVNBox",
  "renderFirstPersonScene",
  "scene-node",
  "object-marker",
  "object-label",
  "closeup-view",
  "node-transition",
  "scene-background",
  "scene-wall",
  "scene-floor",
  "scene-object",
  "object-bedside_glasses",
  "object-front_door"
]) {
  if (!js.includes(token)) throw new Error(`Missing first-person scene game token: ${token}`);
}

for (const token of [
  "Full-surface watercolor art direction pass",
  "full-surface-art-direction",
  "research-ready-surfaces",
  "phone-modal-card",
  "ending-reflection",
  "support-card",
  "title-card::before",
  "modal-card::before",
  "First-person point-and-click scene conversion",
  "Node-based movement and visual-novel interaction layer",
  "first-person-shell",
  "first-person-scene",
  "scene-node",
  "scene-viewport",
  "object-marker",
  "object-label",
  "closeup-view",
  "node-transition",
  "node-exit",
  "vn-box",
  "vn-choices",
  "scene-wall",
  "scene-floor",
  "scene-counter",
  "scene-door",
  "object-bedside_glasses",
  "object-kettle",
  "object-front_door"
]) {
  if (!css.includes(token)) throw new Error(`Missing full-surface CSS token: ${token}`);
}

for (const token of [
  "Whole-Game Art Direction Pass",
  "First-Person Scene Pass",
  "not only the opening screen",
  "full-surface consistency",
  "metacognitive premise"
]) {
  if (!readme.includes(token)) throw new Error(`Missing full-surface README text: ${token}`);
}

console.log("Smoke check passed.");
