export const CUTSCENE_SHOTS = {
  waking: { room: "bedroom", x: 0.5, y: 0.45, zoom: 1.04, push: 0.13 },
  note: { room: "bedroom", x: 0.66, y: 0.74, zoom: 1.18, push: 0.12 },
  corridor: { room: "hallway", x: 0.5, y: 0.5, zoom: 1.04, push: 0.16 },
  tea: { room: "kitchen", x: 0.72, y: 0.66, zoom: 1.15, push: 0.13 },
  threshold: { room: "hallway", x: 0.65, y: 0.48, zoom: 1.16, push: 0.14 },
  "clear-morning": { room: "hallway", x: 0.62, y: 0.48, zoom: 1.08, push: 0.16 },
} as const;

export type CutsceneKind = keyof typeof CUTSCENE_SHOTS;

export function captionDuration(text: string): number {
  return Math.max(5.5, text.trim().split(/\s+/).length / 2.6 + 1);
}

export function cutsceneTimeline(lines: string[]) {
  let elapsed = 0;
  return lines.map((text) => {
    const start = elapsed;
    elapsed += captionDuration(text);
    return { text, start, end: elapsed };
  });
}
