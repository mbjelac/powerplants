import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.waitForSelector("canvas");
});

test("default scene", async ({ page }) => {
  await expectScreenshot(page, "default-scene");
});

test("pyr3 produces 3-sided pyramid", async ({ page }) => {
  await page.locator("#editor textarea").fill("pyr3");
  await expectScreenshot(page, "pyr3");
});

const translateCases = [
  { axis: "left-right", template: (v) => `pyr3 t(${v},0,0)` },
  { axis: "forward-backward", template: (v) => `pyr3 t(0,${v},0)` },
  { axis: "up-down", template: (v) => `pyr3 t(0,0,${v})` },
];

for (const { axis, template } of translateCases) {
  for (const value of [-50, 50, -100, 100]) {
    const cmd = template(value);
    test(`translate ${axis} ${value}: ${cmd}`, async ({ page }) => {
      await page.locator("#editor textarea").fill(cmd);
      await expectScreenshot(page, `translate-${axis}-${value}`);
    });
  }
}

async function expectScreenshot(page, name) {
  await page.waitForTimeout(1000);
  const canvas = page.locator("#canvas-container");
  await expect(canvas).toHaveScreenshot(`${name}.png`, {
    maxDiffPixelRatio: 0.01,
  });
}
