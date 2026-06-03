import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const files = ["index.html", "styles.css", "game.js", "README.md"];

for (const file of files) {
  const content = readFileSync(resolve(root, file), "utf8");
  if (!content.trim()) throw new Error(`${file} is empty`);
}

const html = readFileSync(resolve(root, "index.html"), "utf8");
const js = readFileSync(resolve(root, "game.js"), "utf8");

for (const id of ["newGame", "continueGame", "gameScreen", "roomStage", "checklist"]) {
  if (!html.includes(id)) throw new Error(`Missing expected HTML id: ${id}`);
}

for (const token of ["window.softRecallTrailer", "rooms", "itemData", "localStorage", "showEnding"]) {
  if (!js.includes(token)) throw new Error(`Missing expected game token: ${token}`);
}

console.log("Smoke check passed.");
