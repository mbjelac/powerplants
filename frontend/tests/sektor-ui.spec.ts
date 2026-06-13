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

test("displays building panel with few inputs", async ({ page }) => {
  await page.locator('#canvas-container[data-rendered="true"]').waitFor({ timeout: 5000 });
  await page.locator('.building-item[data-building-name="TestMine"]').click();
  await page.waitForTimeout(100);
  const canvas = page.locator("#canvas-container canvas");
  const box = await canvas.boundingBox();
  await canvas.click({ position: { x: box!.width / 2, y: box!.height / 2 } });
  await page.waitForTimeout(200);
  await canvas.click({ position: { x: box!.width / 2, y: box!.height / 2 } });
  await page.waitForTimeout(200);
  await expectScreenshot(page, "building-panel-small", "#building-panel");
});

test("displays building panel with many inputs", async ({ page }) => {
  await page.locator('#canvas-container[data-rendered="true"]').waitFor({ timeout: 5000 });
  await page.locator('.building-item[data-building-name="TestRefinery"]').click();
  await page.waitForTimeout(100);
  const canvas = page.locator("#canvas-container canvas");
  const box = await canvas.boundingBox();
  await canvas.click({ position: { x: box!.width / 2, y: box!.height / 2 } });
  await page.waitForTimeout(200);
  await canvas.click({ position: { x: box!.width / 2, y: box!.height / 2 } });
  await page.waitForTimeout(200);
  await expectScreenshot(page, "building-panel-large", "#building-panel");
});

test("building panel persists after rotating the view", async ({ page }) => {
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
  // Building panel should still be visible
  await expectScreenshot(page, "building-panel-after-rotate", "body");
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

test("displays selection mode with connect buttons", async ({ page }) => {
  await page.locator('#canvas-container[data-rendered="true"]').waitFor({ timeout: 5000 });
  const canvas = page.locator("#canvas-container canvas");
  const box = await canvas.boundingBox();
  const centerX = box!.width / 2;
  const centerY = box!.height / 2;

  // Place TestFactory (outputs Food) — will be a possible connection
  await page.locator('.building-item[data-building-name="TestFactory"]').click();
  await page.waitForTimeout(100);
  await canvas.click({ position: { x: centerX - 60, y: centerY - 20 } });
  await page.waitForTimeout(200);

  // Place TestMine (outputs Ore) — will NOT be a possible connection for Food
  await page.locator('.building-item[data-building-name="TestMine"]').click();
  await page.waitForTimeout(100);
  await canvas.click({ position: { x: centerX + 60, y: centerY - 20 } });
  await page.waitForTimeout(200);

  // Place TestHouse (inputs Food) — target building
  await page.locator('.building-item[data-building-name="TestHouse"]').click();
  await page.waitForTimeout(100);
  await canvas.click({ position: { x: centerX, y: centerY + 30 } });
  await page.waitForTimeout(200);

  // Click TestHouse to open panel
  await canvas.click({ position: { x: centerX, y: centerY + 30 } });
  await page.waitForTimeout(200);

  // Click "+" on the Food input row
  await page.locator(".bf-add-connection").first().click();
  await page.waitForTimeout(300);

  await expectScreenshot(page, "selection-mode", "body");
});

test("cancels selection mode when X is clicked", async ({ page }) => {
  await page.locator('#canvas-container[data-rendered="true"]').waitFor({ timeout: 5000 });
  const canvas = page.locator("#canvas-container canvas");
  const box = await canvas.boundingBox();
  const centerX = box!.width / 2;
  const centerY = box!.height / 2;

  // Place TestFactory and TestHouse
  await page.locator('.building-item[data-building-name="TestFactory"]').click();
  await page.waitForTimeout(100);
  await canvas.click({ position: { x: centerX - 60, y: centerY - 20 } });
  await page.waitForTimeout(200);

  await page.locator('.building-item[data-building-name="TestHouse"]').click();
  await page.waitForTimeout(100);
  await canvas.click({ position: { x: centerX, y: centerY + 30 } });
  await page.waitForTimeout(200);

  // Open panel and enter select mode
  await canvas.click({ position: { x: centerX, y: centerY + 30 } });
  await page.waitForTimeout(200);
  await page.locator(".bf-add-connection").first().click();
  await page.waitForTimeout(300);

  // Click X to cancel
  await page.locator(".select-banner-close").click();
  await page.waitForTimeout(200);

  // Banner and connect buttons should be gone, panel should still be visible
  await expectScreenshot(page, "selection-cancelled", "body");
});

test("displays connection arc on map after connecting buildings", async ({ page }) => {
  await page.locator('#canvas-container[data-rendered="true"]').waitFor({ timeout: 5000 });
  const canvas = page.locator("#canvas-container canvas");
  const box = await canvas.boundingBox();
  const centerX = box!.width / 2;
  const centerY = box!.height / 2;

  // Place first TestFactory (outputs Food) — nearby
  await page.locator('.building-item[data-building-name="TestFactory"]').click();
  await page.waitForTimeout(100);
  await canvas.click({ position: { x: centerX - 60, y: centerY - 20 } });
  await page.waitForTimeout(200);

  // Place second TestFactory (outputs Food) — further away
  await page.locator('.building-item[data-building-name="TestFactory"]').click();
  await page.waitForTimeout(100);
  await canvas.click({ position: { x: centerX + 100, y: centerY - 60 } });
  await page.waitForTimeout(200);

  // Place TestHouse (inputs Food 2) — target building
  await page.locator('.building-item[data-building-name="TestHouse"]').click();
  await page.waitForTimeout(100);
  await canvas.click({ position: { x: centerX, y: centerY + 30 } });
  await page.waitForTimeout(200);

  // Click TestHouse to open panel
  await canvas.click({ position: { x: centerX, y: centerY + 30 } });
  await page.waitForTimeout(200);

  // Connect Food from first TestFactory
  await page.locator(".bf-add-connection").first().click();
  await page.waitForTimeout(300);
  await page.locator(".connect-button").first().click();
  await page.waitForTimeout(300);

  // Connect Food from second TestFactory (further away)
  await page.locator(".bf-add-connection").first().click();
  await page.waitForTimeout(300);
  await page.locator(".connect-button").last().click();
  await page.waitForTimeout(300);

  await expectScreenshot(page, "connection-arc", "body");
});

test("increases connection amount when up button is clicked", async ({ page }) => {
  await page.locator('#canvas-container[data-rendered="true"]').waitFor({ timeout: 5000 });
  const canvas = page.locator("#canvas-container canvas");
  const box = await canvas.boundingBox();
  const centerX = box!.width / 2;
  const centerY = box!.height / 2;

  // Place TestFactory (outputs Food) and TestHouse (inputs Food 2)
  await page.locator('.building-item[data-building-name="TestFactory"]').click();
  await page.waitForTimeout(100);
  await canvas.click({ position: { x: centerX - 60, y: centerY - 20 } });
  await page.waitForTimeout(200);

  await page.locator('.building-item[data-building-name="TestHouse"]').click();
  await page.waitForTimeout(100);
  await canvas.click({ position: { x: centerX, y: centerY + 30 } });
  await page.waitForTimeout(200);

  // Open panel, create connection
  await canvas.click({ position: { x: centerX, y: centerY + 30 } });
  await page.waitForTimeout(200);
  await page.locator(".bf-add-connection").first().click();
  await page.waitForTimeout(300);
  await page.locator(".connect-button").click();
  await page.waitForTimeout(300);

  // Click up button to increase amount
  await page.locator(".connection-amount-button").first().click();
  await page.waitForTimeout(300);

  await expectScreenshot(page, "connection-amount-increased", "body");
});

test("decreases connection amount when down button is clicked", async ({ page }) => {
  await page.locator('#canvas-container[data-rendered="true"]').waitFor({ timeout: 5000 });
  const canvas = page.locator("#canvas-container canvas");
  const box = await canvas.boundingBox();
  const centerX = box!.width / 2;
  const centerY = box!.height / 2;

  // Place TestFactory (outputs Food) and TestHouse (inputs Food 2)
  await page.locator('.building-item[data-building-name="TestFactory"]').click();
  await page.waitForTimeout(100);
  await canvas.click({ position: { x: centerX - 60, y: centerY - 20 } });
  await page.waitForTimeout(200);

  await page.locator('.building-item[data-building-name="TestHouse"]').click();
  await page.waitForTimeout(100);
  await canvas.click({ position: { x: centerX, y: centerY + 30 } });
  await page.waitForTimeout(200);

  // Open panel, create connection, increase to 2
  await canvas.click({ position: { x: centerX, y: centerY + 30 } });
  await page.waitForTimeout(200);
  await page.locator(".bf-add-connection").first().click();
  await page.waitForTimeout(300);
  await page.locator(".connect-button").click();
  await page.waitForTimeout(300);
  await page.locator(".connection-amount-button").first().click();
  await page.waitForTimeout(300);

  // Click down button to decrease amount back to 1
  await page.locator(".connection-amount-button").last().click();
  await page.waitForTimeout(300);

  await expectScreenshot(page, "connection-amount-decreased", "body");
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
