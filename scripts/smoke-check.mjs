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
  "caseFileModal",
  "inspectionModal",
  "symptomLogModal",
  "memoryTabs",
  "symptomSummary",
  "gameScreen",
  "roomStage",
  "checklist",
  "accessibilityPanel",
  "endingBook",
  "endingSymptomLog",
  "supportStyleChoices",
  "reflectionPrompts",
  "reflectionInput",
  "saveReflection",
  "saveGame",
  "openMemoryBookMenu",
  "openAccessibility",
  "openCredits",
  "onboardingModal",
  "feedbackLayer",
  "inspectionFeeling",
  "phoneThread",
  "openAccessibilityGame"
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
  "addCarePerspective",
  "supportStyle",
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
  "reflectionPrompts",
  "announceFeedback",
  "beginRoomTransition",
  "visitedRooms",
  "roomStatus",
  "Supported Departure",
  "Smaller Morning",
  "Quiet Proof",
  "Overloaded but Not Alone",
  "The Circled Appointment",
  "Shared Morning",
  "Quiet Independence",
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
  "can affect younger adults",
  "broad tonal inspirations only",
  "modern watercolor-inspired",
  "no external dependencies",
  "GitHub Pages",
  "Roadmap"
]) {
  if (!readme.includes(token)) throw new Error(`Missing expected README text: ${token}`);
}

console.log("Smoke check passed.");
