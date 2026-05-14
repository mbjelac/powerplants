import { test, setup, expectScreenshot } from "./test-utils";

setup();

test("wireframe off hides wireframe on red sphere", async ({ page }) => {
  await page.locator("#editor textarea").fill("sph c(#e03030)");
  await page.locator("#wireframe-toggle").click();
  await expectScreenshot(page, "wireframe-off-red-sphere");
});
