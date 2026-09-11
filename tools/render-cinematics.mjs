import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { CUTSCENE_COPY } from "../src/game/data/morningBeats.ts";
import { CUTSCENE_SHOTS, cutsceneTimeline } from "../src/game/data/cutscenes.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = resolve(root, "public/media/cutscenes");
const ffmpeg = process.env.FFMPEG_PATH || "ffmpeg";
mkdirSync(output, { recursive: true });
const manifest = [];
for (const [kind, shot] of Object.entries(CUTSCENE_SHOTS)) {
  const timeline = cutsceneTimeline(CUTSCENE_COPY[kind].lines);
  const duration = timeline.at(-1).end;
  const frames = Math.ceil(duration * 24);
  const source = resolve(root, `src/assets/scene-${shot.room}.webp`);
  const destination = resolve(output, `${kind}.mp4`);
  // Supersample the crop so sub-pixel camera motion stays smooth at 24 fps.
  const filter = `scale=2560:-2,zoompan=z='${shot.zoom}+${shot.push}*(1-cos(PI*on/${frames}))/2':x='(iw-iw/zoom)*${shot.x}':y='(ih-ih/zoom)*${shot.y}':d=${frames}:s=1280x720:fps=24,eq=brightness=-0.015:saturation=0.92,fade=t=in:st=0:d=0.45,fade=t=out:st=${duration - 0.5}:d=0.5`;
  const result = spawnSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-i", source,
    "-vf", filter, "-t", String(duration), "-an", "-c:v", "libx264", "-preset", "fast",
    "-crf", "24", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-threads", "2", destination], { stdio: "inherit" });
  if (result.error || result.status !== 0) throw result.error || new Error(`Render failed: ${kind}`);
  const bytes = readFileSync(destination);
  manifest.push({ kind, source: `src/assets/scene-${shot.room}.webp`, sourceSha256: createHash("sha256").update(readFileSync(source)).digest("hex"), file: `${kind}.mp4`, sha256: createHash("sha256").update(bytes).digest("hex"), bytes: bytes.length, duration, width: 1280, height: 720, fps: 24, audio: false });
  console.log(`${kind}: ${duration.toFixed(1)} seconds, ${(bytes.length / 1048576).toFixed(2)} MB`);
}
writeFileSync(resolve(output, "manifest.json"), JSON.stringify({ method: "Local FFmpeg camera crops from existing project paintings; no new source artwork or audio.", clips: manifest }, null, 2) + "\n");
