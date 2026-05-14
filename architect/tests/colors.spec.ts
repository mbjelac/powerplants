import { test, setup, expectScreenshot } from "./test-utils";

setup();

test("pyr3 with color", async ({ page }) => {
  await page.locator("#editor textarea").fill("pyr3 c(#e03030)");
  await expectScreenshot(page, "pyr3-color");
});

test("multiple pyramids with different colors", async ({ page }) => {
  const commands = [
    "pyr3 s(60) t(-30, -30, 0) c(#e03030)",
    "pyr4 s(60) t(30, -30, 0) c(#30e030)",
    "pyr3 s(60) t(-30, 30, 0) c(#3030e0)",
    "pyr4 s(60) t(30, 30, 0) c(#e0e030)",
  ].join("\n");
  await page.locator("#editor textarea").fill(commands);
  await expectScreenshot(page, "multiple-pyramids-colored");
});
