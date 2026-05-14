import { test, setup, expectScreenshot } from "./test-utils";

setup();

test("default scene", async ({ page }) => {
  await expectScreenshot(page, "default-scene");
});

test("pyr3 produces 3-sided pyramid", async ({ page }) => {
  await page.locator("#editor textarea").fill("pyr3");
  await expectScreenshot(page, "pyr3");
});

test("pyr4 produces 4-sided pyramid", async ({ page }) => {
  await page.locator("#editor textarea").fill("pyr4");
  await expectScreenshot(page, "pyr4");
});

test("pyr produces 4-sided pyramid", async ({ page }) => {
  await page.locator("#editor textarea").fill("pyr");
  await expectScreenshot(page, "pyr");
});

for (const sides of [5, 6, 7, 8, 9]) {
  test(`pyr${sides} produces ${sides}-sided pyramid`, async ({ page }) => {
    await page.locator("#editor textarea").fill(`pyr${sides}`);
    await expectScreenshot(page, `pyr${sides}`);
  });
}

for (const sides of [3, 4, 5, 6, 7, 8, 9]) {
  test(`pri${sides} produces ${sides}-sided prism`, async ({ page }) => {
    await page.locator("#editor textarea").fill(`pri${sides}`);
    await expectScreenshot(page, `pri${sides}`);
  });
}

test("sph produces a sphere", async ({ page }) => {
  await page.locator("#editor textarea").fill("sph");
  await expectScreenshot(page, "sph");
});

test("sphere with transforms", async ({ page }) => {
  await page.locator("#editor textarea").fill("sph c(#3080e0) s(80) t(20, -10, 30)");
  await expectScreenshot(page, "sph-transformed");
});

test("cyl produces a cylinder", async ({ page }) => {
  await page.locator("#editor textarea").fill("cyl");
  await expectScreenshot(page, "cyl");
});

test("cylinder with transforms", async ({ page }) => {
  await page.locator("#editor textarea").fill("cyl c(#e05030) s(80) t(20, -10, 30)");
  await expectScreenshot(page, "cyl-transformed");
});

test("con produces a cone", async ({ page }) => {
  await page.locator("#editor textarea").fill("con");
  await expectScreenshot(page, "con");
});

test("cone with transforms", async ({ page }) => {
  await page.locator("#editor textarea").fill("con c(#30e050) s(80) t(20, -10, 30)");
  await expectScreenshot(page, "con-transformed");
});

test("tor produces a torus", async ({ page }) => {
  await page.locator("#editor textarea").fill("tor");
  await expectScreenshot(page, "tor");
});

test("torus with transforms", async ({ page }) => {
  await page.locator("#editor textarea").fill("tor c(#e0a030) s(80) t(20, -10, 30)");
  await expectScreenshot(page, "tor-transformed");
});

test("multiple pyramids, mixed 3-sided and 4-sided", async ({ page }) => {
  const commands = [
    "pyr3 s(55) t(-30, -30, -20)",
    "pyr s(40) t(30, -30, 0)",
    "pyr3 s(70) t(-30, 30, 10)",
    "pyr4 s(60) t(30, 30, 0)",
  ].join("\n");
  await page.locator("#editor textarea").fill(commands);
  await expectScreenshot(page, "multiple-mixed-pyramids");
});
