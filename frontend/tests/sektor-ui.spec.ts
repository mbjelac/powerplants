import { test, expect, setup, expectScreenshot } from "./test-utils";

setup();

test("renders empty grid of floors", async ({ page }) => {
  await expectScreenshot(page, "empty-grid");
});

test("highlights selected building in toolbar", async ({ page }) => {
  await page.locator('#canvas-container[data-rendered="true"]').waitFor({ timeout: 5000 });
  await page.locator('.building-item[data-building-name="TestFactory"]').click();
  await page.waitForTimeout(100);
  await expectScreenshot(page, "building-selected", "#toolbar");
});

test("removes highlight when selected building is clicked again", async ({ page }) => {
  await page.locator('#canvas-container[data-rendered="true"]').waitFor({ timeout: 5000 });
  await page.locator('.building-item[data-building-name="TestFactory"]').click();
  await page.waitForTimeout(100);
  await page.locator('.building-item[data-building-name="TestFactory"]').click();
  await page.waitForTimeout(100);
  await expectScreenshot(page, "building-deselected", "#toolbar");
});

test("renders building on floor after placement", async ({ page }) => {
  await page.locator('#canvas-container[data-rendered="true"]').waitFor({ timeout: 5000 });
  await page.locator('.building-item[data-building-name="TestFactory"]').click();
  await page.waitForTimeout(100);
  // Click on center of the canvas (should hit a floor tile near the middle of the grid)
  const canvas = page.locator("#canvas-container canvas");
  const box = await canvas.boundingBox();
  await canvas.click({ position: { x: box!.width / 2, y: box!.height / 2 } });
  await page.waitForTimeout(200);
  await expectScreenshot(page, "building-placed");
});

test("displays building function panel with few inputs", async ({ page }) => {
  await page.locator('#canvas-container[data-rendered="true"]').waitFor({ timeout: 5000 });
  await page.locator('.building-item[data-building-name="TestMine"]').click();
  await page.waitForTimeout(100);
  const canvas = page.locator("#canvas-container canvas");
  const box = await canvas.boundingBox();
  await canvas.click({ position: { x: box!.width / 2, y: box!.height / 2 } });
  await page.waitForTimeout(200);
  await canvas.click({ position: { x: box!.width / 2, y: box!.height / 2 } });
  await page.waitForTimeout(200);
  await expectScreenshot(page, "building-function-panel-small", "#building-function-panel");
});

test("displays building function panel with many inputs", async ({ page }) => {
  await page.locator('#canvas-container[data-rendered="true"]').waitFor({ timeout: 5000 });
  await page.locator('.building-item[data-building-name="TestRefinery"]').click();
  await page.waitForTimeout(100);
  const canvas = page.locator("#canvas-container canvas");
  const box = await canvas.boundingBox();
  await canvas.click({ position: { x: box!.width / 2, y: box!.height / 2 } });
  await page.waitForTimeout(200);
  await canvas.click({ position: { x: box!.width / 2, y: box!.height / 2 } });
  await page.waitForTimeout(200);
  await expectScreenshot(page, "building-function-panel-large", "#building-function-panel");
});

test("function panel persists after rotating the view", async ({ page }) => {
  await page.locator('#canvas-container[data-rendered="true"]').waitFor({ timeout: 5000 });
  // Place and click a building
  await page.locator('.building-item[data-building-name="TestFactory"]').click();
  await page.waitForTimeout(100);
  const canvas = page.locator("#canvas-container canvas");
  const box = await canvas.boundingBox();
  await canvas.click({ position: { x: box!.width / 2, y: box!.height / 2 } });
  await page.waitForTimeout(200);
  await canvas.click({ position: { x: box!.width / 2, y: box!.height / 2 } });
  await page.waitForTimeout(200);
  // Drag to rotate the view
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x + box!.width / 2 + 80, box!.y + box!.height / 2 - 40, { steps: 5 });
  await page.mouse.up();
  await page.waitForTimeout(200);
  // Function panel should still be visible
  await expectScreenshot(page, "function-panel-after-rotate", "body");
});

test("displays function panel when building tool is selected", async ({ page }) => {
  await page.locator('#canvas-container[data-rendered="true"]').waitFor({ timeout: 5000 });
  await page.locator('.building-item[data-building-name="TestHouse"]').click();
  await page.waitForTimeout(100);
  const panel = page.locator("#toolbar-function-panel");
  await expect(panel).toBeVisible();
  await expect(panel).toHaveScreenshot("toolbar-function-panel.png", {
    maxDiffPixelRatio: 0,
    timeout: 10000,
  });
});

test("shows error when placing building on occupied location", async ({ page }) => {
  await page.locator('#canvas-container[data-rendered="true"]').waitFor({ timeout: 5000 });
  await page.locator('.building-item[data-building-name="TestFactory"]').click();
  await page.waitForTimeout(100);
  const canvas = page.locator("#canvas-container canvas");
  const box = await canvas.boundingBox();
  const clickPos = { x: box!.width / 2, y: box!.height / 2 };
  // Place first building
  await canvas.click({ position: clickPos });
  await page.waitForTimeout(200);
  // Re-select the building tool (it gets deselected after successful placement)
  await page.locator('.building-item[data-building-name="TestFactory"]').click();
  await page.waitForTimeout(100);
  // Try to place again on same spot
  await canvas.click({ position: clickPos });
  await page.waitForTimeout(200);
  await expectScreenshot(page, "building-error", "body");
});
