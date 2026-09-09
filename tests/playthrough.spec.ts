import { expect, test, type Page } from "@playwright/test";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const TARGET_WORD = "THURSDAY";

async function clickHotspot(page: Page, id: string) {
  await page.getByTestId(`hotspot-${id}`).click();
}

async function solvePhoneWord(page: Page) {
  for (let position = 0; position < TARGET_WORD.length; position += 1) {
    const tiles = page.locator('[data-testid^="phone-tile-"]');
    const letters = (await tiles.allTextContents()).map(letter => letter.trim());
    if (letters[position] === TARGET_WORD[position]) continue;
    const swapPosition = letters.findIndex((letter, index) => index > position && letter === TARGET_WORD[position]);
    expect(swapPosition).toBeGreaterThan(position);
    const selected = tiles.nth(position);
    await selected.click({ force: true });
    await expect(selected).toHaveAttribute("aria-pressed", "true");
    await tiles.nth(swapPosition).click({ force: true });
    await expect(tiles.nth(position)).toHaveText(TARGET_WORD[position]);
  }
  await page.getByTestId("phone-word-submit").click();
}

async function sortChecklist(page: Page, yesIds: string[], noIds: string[]) {
  for (const id of yesIds) {
    const item = page.getByTestId(`check-item-${id}`);
    await item.click({ force: true });
    await expect(item).toHaveAttribute("aria-pressed", "true");
    await page.getByTestId("check-bin-yes").evaluate((element: HTMLElement) => element.click());
    await expect(item).toHaveCount(0);
  }
  for (const id of noIds) {
    const item = page.getByTestId(`check-item-${id}`);
    await item.click({ force: true });
    await expect(item).toHaveAttribute("aria-pressed", "true");
    await page.getByTestId("check-bin-no").evaluate((element: HTMLElement) => element.click());
    await expect(item).toHaveCount(0);
  }
  await expect(page.getByTestId("check-submit")).toBeEnabled();
  await page.getByTestId("check-submit").click();
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem("soft-recall.test-initialized")) {
      localStorage.clear();
      localStorage.setItem("soft-recall.settings.v3", JSON.stringify({ reducedMotion: true }));
      sessionStorage.setItem("soft-recall.test-initialized", "1");
      sessionStorage.setItem("soft-recall.test-audio-count", "0");
    }
    (window as Window & { __audioInitCount?: number }).__audioInitCount = Number(sessionStorage.getItem("soft-recall.test-audio-count") ?? 0);
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
  const consoleErrors: string[] = [];
  page.on("console", message => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", error => consoleErrors.push(error.message));

  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Soft Recall" })).toBeVisible();
  await page.getByTestId("begin-button").click();
  await page.getByTestId("tutorial-skip").click();
  await expect(page.getByTestId("game-screen")).toHaveAttribute("data-room", "bedroom");

  await clickHotspot(page, "glasses");
  await clickHotspot(page, "note");
  await page.getByTestId("interaction-target-door").click();
  await clickHotspot(page, "phone");
  await solvePhoneWord(page);
  await page.getByTestId("choice-send").click();

  await page.getByTestId("doorway-hallway").click();
  await expect(page.getByTestId("game-screen")).toHaveAttribute("data-room", "hallway");
  await expect(page.locator("[aria-hidden].pointer-events-none.absolute.inset-0.z-50")).toHaveCount(0);
  await clickHotspot(page, "coat");

  await page.getByTestId("doorway-kitchen").click();
  await expect(page.getByTestId("game-screen")).toHaveAttribute("data-room", "kitchen");
  await clickHotspot(page, "k-kettle");
  const hold = page.getByTestId("hold-action");
  await hold.focus();
  await page.keyboard.down("Space");
  await page.waitForTimeout(3_200);
  await page.keyboard.up("Space");
  await expect(page.getByTestId("mini-sip")).toHaveCount(0);

  await clickHotspot(page, "k-toast");
  for (const [index, id] of ["bread", "toaster", "butter", "plate"].entries()) {
    await page.getByTestId(`sequence-item-${id}`).click({ force: true });
    await page.getByTestId(`sequence-slot-${index}`).click({ force: true });
  }
  await page.getByRole("button", { name: "That's the order" }).click({ force: true });
  await page.getByTestId("doorway-hallway").click();
  await expect(page.getByTestId("game-screen")).toHaveAttribute("data-room", "hallway");

  await page.getByTestId("doorway-bathroom").click();
  await expect(page.getByTestId("game-screen")).toHaveAttribute("data-room", "bathroom");
  await clickHotspot(page, "b-tap");
  for (let i = 0; i < 4; i += 1) await page.getByTestId("water-target").click();
  await expect(page.getByTestId("mini-splash")).toHaveCount(0);

  await clickHotspot(page, "b-teeth");
  for (let i = 0; i < 4; i += 1) {
    await page.getByRole("button", { name: "Left" }).click();
    await page.getByRole("button", { name: "Right" }).click();
  }
  await expect(page.getByTestId("mini-brush")).toHaveCount(0);
  await page.getByTestId("doorway-hallway").click();
  await expect(page.getByTestId("game-screen")).toHaveAttribute("data-room", "hallway");

  await expect.poll(() => page.evaluate(() => {
    const raw = localStorage.getItem("soft-recall.save.v5");
    return raw ? JSON.parse(raw).currentRoom : null;
  })).toBe("hallway");
  await page.reload();
  await page.getByTestId("continue-button").click();
  await expect(page.getByTestId("game-screen")).toHaveAttribute("data-room", "hallway");

  await page.keyboard.press("m");
  await expect(page.getByTestId("memory-book")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("memory-book")).toHaveCount(0);

  await clickHotspot(page, "frontdoor");
  const recallItems = page.locator('[data-testid^="check-item-"]');
  const recallIds = await recallItems.evaluateAll(elements =>
    elements.map(element => element.getAttribute("data-testid")?.replace("check-item-", "") ?? ""),
  );
  await sortChecklist(
    page,
    recallIds.filter(id => id.startsWith("k:")),
    recallIds.filter(id => id.startsWith("d:")),
  );

  await expect(page.getByText("Readiness — what comes with you?")).toBeVisible();
  const readinessIds = await page.locator('[data-testid^="check-item-"]').evaluateAll(elements =>
    elements.map(element => element.getAttribute("data-testid")?.replace("check-item-", "") ?? ""),
  );
  const readinessYes = readinessIds.filter(id => ["phone", "kettle", "note"].includes(id));
  const readinessNo = readinessIds.filter(id => !readinessYes.includes(id));
  await sortChecklist(page, readinessYes, readinessNo);

  await page.getByTestId("choice-smaller").click();
  await expect(page.getByTestId("ending-screen")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Smaller Morning" })).toBeVisible();
  await page.waitForTimeout(500);

  const savedEnding = await page.evaluate(() => {
    const raw = localStorage.getItem("soft-recall.save.v5");
    return raw ? JSON.parse(raw).endingState : null;
  });
  expect(savedEnding).toBe("smaller");
  await page.reload();
  await page.getByTestId("continue-button").click();
  await expect(page.getByRole("heading", { name: "Smaller Morning" })).toBeVisible();
  expect(await page.evaluate(() => (window as Window & { __audioInitCount?: number }).__audioInitCount)).toBe(0);
  expect(consoleErrors).toEqual([]);
  expect(existsSync(resolve(process.cwd(), "dist/index.html"))).toBe(true);
});

test("supports keyboard entry and Memory Book access", async ({ page }) => {
  await page.goto("./");
  await page.keyboard.press("Tab");
  await expect(page.getByTestId("begin-button")).toBeFocused();
  await page.keyboard.press("Enter");
  await page.getByTestId("tutorial-skip").click();
  await page.keyboard.press("m");
  await expect(page.getByTestId("memory-book")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("memory-book")).toHaveCount(0);
});
