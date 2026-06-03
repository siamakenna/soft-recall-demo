import { createServer } from "node:http";
import { createReadStream, existsSync, mkdirSync, readdirSync, renameSync, statSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const mediaDir = resolve(root, "media");
const videoDir = resolve(mediaDir, "playwright-video");
const port = 4174;
const runtimeRoot = resolve(homedir(), ".cache/codex-runtimes/codex-primary-runtime/dependencies");
const runtimeModules = join(runtimeRoot, "node/node_modules");

function optionalRequire(name) {
  for (const base of [root, runtimeModules]) {
    try {
      return createRequire(join(base, "package.json"))(name);
    } catch {
      // Try the next module root.
    }
  }
  return null;
}

const playwright = optionalRequire("playwright");
if (!playwright) {
  throw new Error("Playwright is required to capture the trailer. Run npm install or use the Codex desktop bundled runtime.");
}

const { chromium } = playwright;

mkdirSync(mediaDir, { recursive: true });
mkdirSync(videoDir, { recursive: true });

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mp4": "video/mp4",
  ".webm": "video/webm"
};

const server = createServer((request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);
  const safePath = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const filePath = resolve(join(root, safePath));

  if (!filePath.startsWith(root) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, { "Content-Type": mime[extname(filePath)] || "application/octet-stream" });
  createReadStream(filePath).pipe(response);
});

await new Promise((resolveListen) => server.listen(port, resolveListen));

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  deviceScaleFactor: 1,
  recordVideo: {
    dir: videoDir,
    size: { width: 1280, height: 720 }
  }
});

const page = await context.newPage();
await page.goto(`http://localhost:${port}`, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.evaluate(() => window.softRecallTrailer.run());

const video = page.video();
await context.close();
await browser.close();
server.close();

const rawPath = await video.path();
const webmPath = resolve(mediaDir, "soft-recall-trailer.webm");
renameSync(rawPath, webmPath);

const mp4Path = resolve(mediaDir, "soft-recall-trailer.mp4");

function findCommand(command) {
  const result = spawnSync("zsh", ["-lc", `command -v ${command}`], { encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : null;
}

function findImageioFfmpeg() {
  const python = join(runtimeRoot, "python/bin/python3");
  if (!existsSync(python)) return null;
  const result = spawnSync(python, [
    "-c",
    "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"
  ], { encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : null;
}

const ffmpegStatic = optionalRequire("ffmpeg-static");
const playwrightFfmpeg = resolve(homedir(), "Library/Caches/ms-playwright/ffmpeg-1011/ffmpeg-mac");
const ffmpeg = ffmpegStatic || findCommand("ffmpeg") || findImageioFfmpeg() || (existsSync(playwrightFfmpeg) ? playwrightFfmpeg : null);
let converted = false;

if (ffmpeg) {
  const conversion = spawnSync(ffmpeg, [
    "-y",
    "-i", webmPath,
    "-t", "30",
    "-vf", "scale=1280:720",
    "-movflags", "+faststart",
    "-pix_fmt", "yuv420p",
    mp4Path
  ], { stdio: "inherit" });
  converted = conversion.status === 0;
}

if (!converted) {
  const avconvert = findCommand("avconvert");
  if (avconvert) {
    const conversion = spawnSync(avconvert, [
      "--source", webmPath,
      "--preset", "Preset1280x720",
      "--output", mp4Path,
      "--duration", "30",
      "--replace"
    ], { stdio: "inherit" });
    converted = conversion.status === 0;
  }
}

for (const file of readdirSync(videoDir)) {
  // Playwright leaves per-run temporary files here; keeping the directory clean makes the repo nicer.
  if (!file.endsWith(".webm")) continue;
}

console.log(`Wrote ${webmPath}`);
if (converted) {
  console.log(`Wrote ${mp4Path}`);
} else {
  console.log("MP4 conversion was not available; the WebM trailer is ready to use.");
}
