import { expect, test, type Locator, type Page } from "@playwright/test";
import { existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { CUTSCENE_COPY } from "../src/game/data/morningBeats";
import { cutsceneTimeline } from "../src/game/data/cutscenes";

const TARGET_WORD = "THURSDAY";

async function releaseScreenshot(page: Page, name: string) {
  const directory = process.env.RELEASE_SCREENSHOT_DIR;
  if (!directory) return;
  mkdirSync(directory, { recursive: true });
  await page.screenshot({ path: resolve(directory, `${name}.png`) });
}

async function dragBetween(page: Page, source: Locator, target: Locator) {
  await expect(source).toBeVisible();
  await expect(target).toBeVisible();
  const from = await source.boundingBox();
  const to = await target.boundingBox();
  if (!from || !to) throw new Error("Drag surfaces must be visible");
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 4 });
  await expect(page.getByTestId("carry-ghost")).toBeVisible();
  await page.mouse.up();
  await expect(page.getByTestId("carry-ghost")).toHaveCount(0);
}

async function clickHotspot(page: Page, id: string) {
  await page.getByTestId(`hotspot-${id}`).click();
}

async function solvePhoneWord(page: Page, keyboard = false) {
  for (let position = 0; position < TARGET_WORD.length; position += 1) {
    const tiles = page.locator('[data-testid^="phone-tile-"]');
    const letters = (await tiles.allTextContents()).map((letter) => letter.trim());
    if (letters[position] === TARGET_WORD[position]) continue;
    const swapPosition = letters.findIndex(
      (letter, index) => index > position && letter === TARGET_WORD[position],
    );
    expect(swapPosition).toBeGreaterThan(position);
    const selected = tiles.nth(position);
    if (keyboard) await selected.press("Enter");
    else await selected.click({ force: true });
    await expect(selected).toHaveAttribute("aria-pressed", "true");
    if (keyboard) await tiles.nth(swapPosition).press("Enter");
    else await tiles.nth(swapPosition).click({ force: true });
    await expect(tiles.nth(position)).toHaveText(TARGET_WORD[position]);
  }
  if (keyboard) await page.getByTestId("phone-word-submit").press("Enter");
  else await page.getByTestId("phone-word-submit").click();
}

async function sortChecklist(page: Page, yesIds: string[], noIds: string[]) {
  for (const id of yesIds) {
    const item = page.getByTestId(`check-item-${id}`);
    await dragBetween(page, item, page.getByTestId("check-bin-yes"));
    await expect(item).toHaveCount(0);
  }
  for (const id of noIds) {
    const item = page.getByTestId(`check-item-${id}`);
    await dragBetween(page, item, page.getByTestId("check-bin-no"));
    await expect(item).toHaveCount(0);
  }
  await expect(page.getByTestId("check-submit")).toHaveCount(0);
}

async function completeMemoryReview(page: Page) {
  await expect(page.getByTestId("memory-book")).toBeVisible();
  await page.getByTestId("memory-review-noticed").click();
  await page.getByTestId("memory-review-helped").click();
  await page.getByTestId("memory-review-uncertain").click();
  await page.getByTestId("memory-review-context-link").click();
  await expect(page.getByTestId("research-context")).toBeVisible();
  await page.getByTestId("research-context-read").click();
  await expect(page.getByTestId("research-context-read")).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("memory-book")).toHaveCount(0);
}

async function finishCutscene(page: Page, kind: "waking" | "note" | "corridor" | "tea" | "threshold" | "clear-morning") {
  const cutscene = page.getByTestId(`cutscene-${kind}`);
  if (await cutscene.count() === 0) return;
  await cutscene.getByTestId("cutscene-skip").click();
  await expect(cutscene).toHaveCount(0);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("soft-recall.test-initialized")) {
      localStorage.clear();
      localStorage.setItem("soft-recall.settings.v3", JSON.stringify({ reducedMotion: true }));
      sessionStorage.setItem("soft-recall.test-initialized", "1");
      sessionStorage.setItem("soft-recall.test-audio-count", "0");
    }
    (window as Window & { __audioInitCount?: number }).__audioInitCount = Number(
      sessionStorage.getItem("soft-recall.test-audio-count") ?? 0,
    );
    class AudioContextTrap {
      constructor() {
        const next = Number(sessionStorage.getItem("soft-recall.test-audio-count") ?? 0) + 1;
        sessionStorage.setItem("soft-recall.test-audio-count", String(next));
        (window as Window & { __audioInitCount?: number }).__audioInitCount = next;
      }
    }
    Object.defineProperty(window, "AudioContext", { configurable: true, value: AudioContextTrap });
  });
});

test("completes the core route, reloads safely, and reaches an ending", async ({ page }) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Soft Recall" })).toBeVisible();
  await releaseScreenshot(page, "01-title-1440x900");
  await page.getByTestId("begin-button").click();
  await finishCutscene(page, "waking");
  await page.getByTestId("tutorial-skip").click();
  await expect(page.getByTestId("game-screen")).toHaveAttribute("data-room", "bedroom");

  await clickHotspot(page, "glasses");
  await releaseScreenshot(page, "02-bedroom-1440x900");
  await clickHotspot(page, "note");
  await dragBetween(page, page.getByTestId("interaction-object"), page.getByTestId("interaction-target-door"));
  await finishCutscene(page, "note");
  await clickHotspot(page, "phone");
  await solvePhoneWord(page);
  await page.getByTestId("choice-send").click();

  await page.getByTestId("doorway-hallway").click();
  await expect(page.getByTestId("game-screen")).toHaveAttribute("data-room", "hallway");
  await finishCutscene(page, "corridor");
  await expect(page.locator("[aria-hidden].pointer-events-none.absolute.inset-0.z-50")).toHaveCount(
    0,
  );
  await clickHotspot(page, "coat");

  await page.getByTestId("doorway-kitchen").click();
  await expect(page.getByTestId("game-screen")).toHaveAttribute("data-room", "kitchen");
  await clickHotspot(page, "k-kettle");
  await releaseScreenshot(page, "03-tea-interaction-1440x900");
  for (const [source, target] of [["kettle", "cup"], ["warm-cup", "hands"], ["empty-cup", "saucer"]]) {
    await dragBetween(page, page.getByTestId(`tea-source-${source}`), page.getByTestId(`tea-target-${target}`));
  }
  await expect(page.getByTestId("mini-sip")).toHaveCount(0);
  await finishCutscene(page, "tea");

  await clickHotspot(page, "k-toast");
  for (const [index, id] of ["bread", "toaster", "butter", "plate"].entries()) {
    await dragBetween(page, page.getByTestId(`sequence-item-${id}`), page.getByTestId(`sequence-slot-${index}`));
  }
  await expect(page.getByTestId("interaction-sequence")).toHaveCount(0);
  await page.getByTestId("doorway-hallway").click();
  await expect(page.getByTestId("game-screen")).toHaveAttribute("data-room", "hallway");

  await page.getByTestId("doorway-bathroom").click();
  await expect(page.getByTestId("game-screen")).toHaveAttribute("data-room", "bathroom");
  await clickHotspot(page, "b-tap");
  for (let i = 0; i < 4; i += 1) await page.getByTestId("water-target").click();
  await expect(page.getByTestId("mini-splash")).toHaveCount(0);

  await clickHotspot(page, "b-teeth");
  const brush = await page.getByTestId("brush-surface").boundingBox();
  if (!brush) throw new Error("Brush surface is missing");
  await page.mouse.move(brush.x + brush.width / 2, brush.y + brush.height / 2);
  await page.mouse.down();
  for (let i = 0; i < 6; i += 1) {
    await page.mouse.move(brush.x + brush.width * (i % 2 === 0 ? 0.2 : 0.8), brush.y + brush.height / 2, { steps: 5 });
  }
  await page.mouse.up();
  await expect(page.getByTestId("mini-brush")).toHaveCount(0);
  await page.getByTestId("doorway-hallway").click();
  await expect(page.getByTestId("game-screen")).toHaveAttribute("data-room", "hallway");

  await expect
    .poll(() =>
      page.evaluate(() => {
        const raw = localStorage.getItem("soft-recall.save.v5");
        return raw ? JSON.parse(raw).currentRoom : null;
      }),
    )
    .toBe("hallway");
  await page.reload();
  await page.getByTestId("continue-button").click();
  await expect(page.getByTestId("game-screen")).toHaveAttribute("data-room", "hallway");

  await page.keyboard.press("m");
  await expect(page.getByTestId("memory-book")).toBeVisible();
  await releaseScreenshot(page, "04-memory-book-1440x900");
  await page.getByTestId("memory-tab-learn-more").click();
  await expect(page.getByTestId("research-notes")).toBeVisible();
  await expect(page.getByText(/informational, not medical advice/i)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("memory-book")).toHaveCount(0);

  await clickHotspot(page, "frontdoor");
  await completeMemoryReview(page);
  await clickHotspot(page, "frontdoor");
  const recallItems = page.locator('[data-testid^="check-item-"]');
  const recallIds = await recallItems.evaluateAll((elements) =>
    elements.map(
      (element) => element.getAttribute("data-testid")?.replace("check-item-", "") ?? "",
    ),
  );
  for (const id of recallIds) {
    await page.getByTestId(`check-item-${id}`).click();
    await page.getByTestId(id.startsWith("k:") ? "check-bin-yes" : "check-bin-no").click();
    await expect(page.getByTestId(`check-item-${id}`)).toHaveCount(0);
  }

  await expect(page.getByText("Readiness — what comes with you?")).toBeVisible();
  const readinessIds = await page
    .locator('[data-testid^="check-item-"]')
    .evaluateAll((elements) =>
      elements.map(
        (element) => element.getAttribute("data-testid")?.replace("check-item-", "") ?? "",
      ),
    );
  const readinessYes = readinessIds.filter((id) => ["phone", "kettle", "note"].includes(id));
  const readinessNo = readinessIds.filter((id) => !readinessYes.includes(id));
  await sortChecklist(page, readinessYes, readinessNo);

  await page.getByTestId("choice-smaller").click();
  await finishCutscene(page, "threshold");
  await expect(page.getByTestId("ending-screen")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Smaller Morning" })).toBeVisible();
  await releaseScreenshot(page, "05-ending-1440x900");
  await page.waitForTimeout(500);

  const savedEnding = await page.evaluate(() => {
    const raw = localStorage.getItem("soft-recall.save.v5");
    return raw ? JSON.parse(raw).endingState : null;
  });
  expect(savedEnding).toBe("smaller");
  await page.reload();
  await page.getByTestId("continue-button").click();
  await expect(page.getByRole("heading", { name: "Smaller Morning" })).toBeVisible();
  expect(
    await page.evaluate(() => (window as Window & { __audioInitCount?: number }).__audioInitCount),
  ).toBe(0);
  expect(consoleErrors).toEqual([]);
  expect(existsSync(resolve(process.cwd(), "dist/index.html"))).toBe(true);
});

test("supports keyboard entry and Memory Book access", async ({ page, browserName }) => {
  await page.goto("./");
  await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
  await expect(page.getByTestId("begin-button")).toBeFocused();
  await page.keyboard.press("Enter");
  await finishCutscene(page, "waking");
  await page.getByTestId("tutorial-skip").click();
  await page.getByTestId("hotspot-glasses").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("The room sharpens at the edges first.")).toBeVisible();
  await page.getByTestId("hotspot-note").focus();
  await page.keyboard.press("Space");
  await expect(page.getByTestId("interaction-drag")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.keyboard.press("m");
  await expect(page.getByTestId("memory-book")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("memory-book")).toHaveCount(0);
});

test("completes an entire morning with keyboard alternatives", async ({ page, browserName }) => {
  const activate = (id: string) => page.getByTestId(id).press("Enter");
  const skip = async (kind: string) => {
    await page.getByTestId(`cutscene-${kind}`).waitFor({ state: "visible" });
    await page.keyboard.press("Escape");
  };
  const sort = async (yes: (id: string) => boolean) => {
    const ids = await page.locator('[data-testid^="check-item-"]').evaluateAll(elements => elements.map(element => element.getAttribute("data-testid")!.slice("check-item-".length)));
    for (const id of ids) {
      await activate(`check-item-${id}`);
      await activate(yes(id) ? "check-bin-yes" : "check-bin-no");
    }
  };
  await page.goto("./");
  await page.keyboard.press(browserName === "webkit" ? "Alt+Tab" : "Tab");
  await expect(page.getByTestId("begin-button")).toBeFocused();
  await page.keyboard.press("Enter");
  await skip("waking");
  await activate("tutorial-skip");
  await activate("hotspot-glasses");
  await activate("hotspot-note");
  await activate("interaction-target-door");
  await skip("note");
  await activate("hotspot-phone");
  await solvePhoneWord(page, true);
  await activate("choice-send");
  await activate("doorway-hallway");
  await skip("corridor");
  await activate("hotspot-coat");
  await activate("doorway-kitchen");
  await activate("hotspot-k-kettle");
  for (const [source, target] of [["kettle", "cup"], ["warm-cup", "hands"], ["empty-cup", "saucer"]]) {
    await activate(`tea-source-${source}`);
    await activate(`tea-target-${target}`);
  }
  await skip("tea");
  await activate("hotspot-k-toast");
  for (const [index, id] of ["bread", "toaster", "butter", "plate"].entries()) {
    await activate(`sequence-item-${id}`);
    await activate(`sequence-slot-${index}`);
  }
  await activate("doorway-hallway");
  await activate("doorway-bathroom");
  await activate("hotspot-b-tap");
  for (let i = 0; i < 4; i++) await activate("water-target");
  await expect(page.getByTestId("mini-splash")).toHaveCount(0);
  await activate("hotspot-b-teeth");
  for (let i = 0; i < 6; i++) await page.getByRole("button", { name: i % 2 === 0 ? "Left" : "Right", exact: true }).press("Enter");
  await activate("doorway-hallway");
  await page.keyboard.press("m");
  for (const id of ["noticed", "helped", "uncertain"]) await activate(`memory-review-${id}`);
  await activate("memory-review-context-link");
  await activate("research-context-read");
  await page.keyboard.press("Escape");
  await activate("hotspot-frontdoor");
  await sort(id => id.startsWith("k:"));
  await expect(page.getByText("Readiness — what comes with you?")).toBeVisible();
  await sort(id => ["phone", "kettle", "note"].includes(id));
  await activate("choice-smaller");
  await skip("threshold");
  await expect(page.getByRole("heading", { name: "Smaller Morning" })).toBeVisible();
});

test("supports an optional room story and saves its progress", async ({ page }) => {
  await page.goto("./");
  await page.getByTestId("begin-button").click();
  await finishCutscene(page, "waking");
  await page.getByTestId("tutorial-skip").click();
  await page.getByTestId("hotspot-linger-bedroom").click();
  await expect(page.getByTestId("room-story")).toBeVisible();

  for (let beat = 0; beat < 5; beat += 1) {
    await page.locator('[data-testid^="story-choice-"]').first().click();
    await expect(page.getByTestId("story-copy")).not.toContainText("A square of the quilt hangs");
    if (beat < 4) await page.getByTestId("story-continue").click();
  }
  await expect(page.getByText("This moment is in the Memory Book now.")).toBeVisible();
  await page.getByRole("button", { name: /Leave this moment/ }).click();
  await expect(page.getByTestId("room-story")).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("soft-recall.save.v5") ?? "{}").storyProgress?.bedroom))
    .toBe(5);
  await page.keyboard.press("m");
  await expect(
    page.getByTestId("memory-book").getByRole("listitem").getByText("Quilt: the green square"),
  ).toBeVisible();
});

for (const response of ["snap", "smaller-step"] as const) {
test(`keeps the ${response} frustration response stable across Continue`, async ({ page }) => {
  await page.goto("./");
  await page.getByTestId("begin-button").click();
  await finishCutscene(page, "waking");
  await page.getByTestId("tutorial-skip").click();
  await clickHotspot(page, "note");

  // Wrong drops increase dissonance, but the note interaction remains
  // recoverable until the player places it correctly.
  await dragBetween(page, page.getByTestId("interaction-object"), page.getByTestId("interaction-target-drawer"));
  await dragBetween(page, page.getByTestId("interaction-object"), page.getByTestId("interaction-target-drawer"));
  await dragBetween(page, page.getByTestId("interaction-object"), page.getByTestId("interaction-target-door"));
  await finishCutscene(page, "note");

  await expect(page.getByTestId("confusion-fog")).toBeVisible();
  await expect(page.getByTestId("frustration-beat")).toBeVisible();
  await expect(page.getByTestId("choice-snap")).toBeVisible();
  await expect(page.getByTestId("choice-smaller-step")).toBeVisible();
  await expect(page.getByTestId("confusion-fog")).toHaveCSS("animation-name", "none");
  const noteBefore = await page.getByTestId("hotspot-note").boundingBox();
  await page.getByTestId(`choice-${response}`).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("frustration-beat")).toHaveCount(0);
  const expectedDissonance = response === "snap" ? 3 : 1;
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("soft-recall.save.v5") ?? "{}").dissonance)).toBe(expectedDissonance);
  await page.reload();
  await page.getByTestId("continue-button").click();
  await expect(page.getByTestId("frustration-beat")).toHaveCount(0);
  await expect(page.getByTestId("hotspot-note")).toBeVisible();
  expect(await page.getByTestId("hotspot-note").boundingBox()).toEqual(noteBefore);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("soft-recall.save.v5") ?? "{}").dissonance)).toBe(expectedDissonance);

  await page.keyboard.press(",");
  await page.getByRole("slider", { name: "Visual distortion" }).focus();
  await page.keyboard.press("Home");
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("confusion-fog")).toHaveCount(0);

  // The beat is optional and does not block the existing doorway recovery.
  await clickHotspot(page, "phone");
  await solvePhoneWord(page);
  await page.getByTestId("choice-send").click();
  await page.getByTestId("doorway-hallway").click();
  await expect(page.getByTestId("game-screen")).toHaveAttribute("data-room", "hallway");
});
}

for (const endingChoice of ["go", "support"] as const) {
test(`unlocks the perfect-route clip and reaches the ${endingChoice} ending`, async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("soft-recall.onboarded.v1", "1");
    const taskIds = [
      "glasses", "note", "phone", "alarm", "curtains", "coat", "keys", "mail", "hall-photo",
      "k-kettle", "k-fridge", "k-toast", "b-mirror", "b-meds", "b-tap", "b-teeth",
    ];
    const memoryEntries = Array.from({ length: 8 }, (_, index) => ({
      section: "Fragments",
      title: `Kept detail ${index + 1}`,
      body: "A detail held without a mistake.",
      room: "hallway",
    }));
    localStorage.setItem("soft-recall.save.v5", JSON.stringify({
      schemaVersion: 2,
      currentRoom: "hallway",
      visitedRooms: ["bedroom", "hallway", "kitchen", "bathroom"],
      unlockedRooms: ["bedroom", "hallway", "kitchen", "bathroom"],
      completedInteractions: taskIds,
      interactionOrder: ["note:door"],
      memoryEntries,
      roomVisitOrder: ["bedroom", "hallway", "kitchen", "bathroom", "hallway"],
      confidenceChoices: [3],
      supportCueUseCount: 1,
      packedItems: { keys: true, bag: true, phone: true },
      frontDoorUnlocked: true,
      wrongCount: 0,
      clarity: 8,
      dissonance: 0,
      endingState: null,
      storyProgress: {},
      storyChoices: {},
      viewedCutscenes: ["waking", "note", "corridor", "tea"],
      memoryBookReview: { noticed: true, helped: true, uncertain: true, contextRead: true },
    }));
  });

  await page.goto("./");
  await page.getByTestId("continue-button").click();
  await clickHotspot(page, "frontdoor");
  const recallIds = await page.locator('[data-testid^="check-item-"]').evaluateAll((elements) =>
    elements.map((element) => element.getAttribute("data-testid")?.replace("check-item-", "") ?? ""),
  );
  await sortChecklist(page, recallIds.filter((id) => id.startsWith("k:")), recallIds.filter((id) => id.startsWith("d:")));

  await sortChecklist(page, ["keys", "phone", "bag", "kettle", "note", "meds", "coat"], ["receipt", "wallet"]);
  await expect(page.getByTestId("cutscene-clear-morning")).toBeVisible();
  await finishCutscene(page, "clear-morning");
  await expect(page.getByTestId("choice-smaller")).toBeVisible();
  await page.getByTestId(`choice-${endingChoice}`).click();
  if (endingChoice === "go") {
    for (const [index, digit] of [4, 7, 3].entries()) {
      for (let value = 0; value < digit; value += 1) await page.getByTestId(`combo-up-${index}`).click();
    }
    await page.getByTestId("combo-submit").click();
    await page.getByTestId("door-knob").focus();
    for (let i = 0; i < 6; i += 1) await page.keyboard.press("ArrowRight");
  }
  await expect(page.getByTestId("cutscene-threshold")).toBeVisible();
  await finishCutscene(page, "threshold");
  await expect(page.getByRole("heading", { name: endingChoice === "go" ? "Supported Departure" : "Overloaded but Not Alone" })).toBeVisible();
});
}

test("protects the game layout in an undersized desktop window", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 500 });
  await page.goto("./");
  await expect(page.getByTestId("desktop-viewport-guard")).toBeVisible();
  await expect(page.getByRole("button", { name: "Enter fullscreen" })).toBeVisible();

  await page.setViewportSize({ width: 1000, height: 700 });
  await expect(page.getByTestId("desktop-viewport-guard")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Soft Recall" })).toBeVisible();
});

for (const viewport of [{ width: 1920, height: 1080 }, { width: 1440, height: 900 }, { width: 1280, height: 720 }]) {
  test(`keeps hotspot targets aligned while panning and zooming at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.addInitScript(() => localStorage.setItem("soft-recall.settings.v3", JSON.stringify({ reducedMotion: false, parallax: true })));
    await page.goto("./");
    await page.getByTestId("begin-button").click();
    await finishCutscene(page, "waking");
    await page.getByTestId("tutorial-skip").click();
    await page.getByRole("button", { name: "I've got it" }).click();
    const plane = page.getByTestId("scene-art-plane");
    const hotspot = page.getByTestId("hotspot-glasses");
    const alignmentError = () => hotspot.evaluate((button) => {
      const image = document.querySelector('[data-testid="scene-art-plane"] img')!.getBoundingClientRect();
      const target = button.getBoundingClientRect();
      return Math.hypot(target.x + target.width / 2 - (image.x + image.width * 0.36), target.y + target.height / 2 - (image.y + image.height * 0.56));
    });
    await expect.poll(alignmentError).toBeLessThan(1);
    const before = await plane.getAttribute("style");
    await page.mouse.move(viewport.width * 0.48, viewport.height * 0.35);
    await page.mouse.down();
    await page.mouse.move(viewport.width * 0.57, viewport.height * 0.4, { steps: 8 });
    await expect(plane).not.toHaveAttribute("style", before!);
    await expect.poll(alignmentError).toBeLessThan(1);
    await page.mouse.up();
    await hotspot.focus();
    await page.keyboard.press("+");
    await expect.poll(() => plane.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).a)).toBeGreaterThan(1.15);
    await expect.poll(alignmentError).toBeLessThan(1);
    await page.keyboard.press("Enter");
    await expect(page.getByText("The room sharpens at the edges first.")).toBeVisible();
    await page.keyboard.press("0");
    await expect.poll(() => plane.evaluate((element) => new DOMMatrix(getComputedStyle(element).transform).a)).toBe(1);
    await releaseScreenshot(page, `desktop-${viewport.width}x${viewport.height}`);
    for (const control of ["Memory Book", "Help", "Settings"]) {
      const box = await page.getByRole("button", { name: control, exact: true }).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width);
    }
  });
}

test("plays silent video with timed captions, pause, and automatic return", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem("soft-recall.settings.v3", JSON.stringify({ reducedMotion: false }));
    localStorage.setItem("soft-recall.onboarded.v1", "1");
  });
  await page.goto("./");
  await page.getByTestId("begin-button").click();
  const video = page.getByTestId("cutscene-video");
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeGreaterThan(0.1);
  expect(await video.evaluate((element: HTMLVideoElement) => ({ muted: element.muted, width: element.videoWidth }))).toEqual({ muted: true, width: 1280 });
  const firstCaption = await page.getByTestId("cutscene-caption").textContent();
  await page.getByTestId("cutscene-pause").click();
  const stoppedAt = await video.evaluate((element: HTMLVideoElement) => element.currentTime);
  await page.waitForTimeout(300);
  expect(await video.evaluate((element: HTMLVideoElement) => element.currentTime)).toBeCloseTo(stoppedAt, 1);
  await page.keyboard.press("m");
  await expect(page.getByTestId("memory-book")).toHaveCount(0);
  await page.getByTestId("cutscene-pause").click();
  await video.evaluate((element: HTMLVideoElement) => { element.currentTime = 18; });
  await expect(page.getByTestId("cutscene-caption")).not.toHaveText(firstCaption ?? "");
  await page.screenshot({ path: "/tmp/soft-recall-cinematic-playback.png" });
  await video.evaluate((element: HTMLVideoElement) => { element.currentTime = element.duration - 0.6; });
  await expect(page.getByTestId("cutscene-waking")).toHaveCount(0);
  await expect(page.getByTestId("game-screen")).toHaveAttribute("data-room", "bedroom");
  expect(await page.evaluate(() => (window as Window & { __audioInitCount?: number }).__audioInitCount)).toBe(0);
  expect(errors).toEqual([]);
});

for (const mode of ["reduced motion", "missing video"]) {
  test(`continues captions and returns safely with ${mode}`, async ({ page }) => {
    if (mode === "missing video") {
      await page.addInitScript(() => localStorage.setItem("soft-recall.settings.v3", JSON.stringify({ reducedMotion: false })));
      await page.route("**/media/cutscenes/*.mp4", (route) => route.abort());
    }
    await page.clock.install();
    await page.goto("./");
    await page.getByTestId("begin-button").click();
    await expect(page.getByTestId("cutscene-waking")).toBeVisible();
    await expect(page.getByTestId("cutscene-video")).toHaveCount(0);
    const first = await page.getByTestId("cutscene-caption").textContent();
    await page.getByTestId("cutscene-pause").click();
    await page.clock.runFor(18_000);
    await expect(page.getByTestId("cutscene-caption")).toHaveText(first ?? "");
    await page.getByTestId("cutscene-pause").click();
    await page.clock.runFor(18_000);
    await expect(page.getByTestId("cutscene-caption")).not.toHaveText(first ?? "");
    const duration = cutsceneTimeline(CUTSCENE_COPY.waking.lines).at(-1)!.end;
    await page.clock.runFor(duration * 1000);
    await expect(page.getByTestId("cutscene-waking")).toHaveCount(0);
    await expect(page.getByTestId("game-screen")).toHaveAttribute("data-room", "bedroom");
  });
}

test("cancels a dropped object outside a target and keeps keyboard alternatives", async ({ page }) => {
  await page.goto("./");
  await page.getByTestId("begin-button").click();
  await finishCutscene(page, "waking");
  await page.getByTestId("tutorial-skip").click();
  await clickHotspot(page, "note");
  const object = page.getByTestId("interaction-object");
  const rect = await object.boundingBox();
  if (!rect) throw new Error("Note is missing");
  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await page.mouse.down();
  await page.mouse.move(15, 15, { steps: 12 });
  await page.mouse.up();
  await expect(object).toBeVisible();
  await expect(page.getByTestId("carry-ghost")).toHaveCount(0);
  await page.getByTestId("interaction-target-door").focus();
  await page.keyboard.press("Enter");
  await finishCutscene(page, "note");
  await clickHotspot(page, "phone");
  await solvePhoneWord(page);
  await page.getByTestId("choice-send").click();
  await page.getByTestId("doorway-hallway").click();
  await finishCutscene(page, "corridor");
  await clickHotspot(page, "keys");
  await dragBetween(page, page.getByTestId("interaction-object"), page.getByTestId("interaction-target-bag"));
  await page.getByTestId("doorway-kitchen").click();
  await clickHotspot(page, "k-kettle");
  await page.screenshot({ path: "/tmp/soft-recall-tea-drag.png" });
  for (const [source, target] of [["kettle", "cup"], ["warm-cup", "hands"], ["empty-cup", "saucer"]]) {
    await page.getByTestId(`tea-source-${source}`).focus();
    await page.keyboard.press("Enter");
    await page.getByTestId(`tea-target-${target}`).focus();
    await page.keyboard.press("Enter");
  }
  await expect(page.getByTestId("mini-sip")).toHaveCount(0);
});
