import { test, setup, expectScreenshot, type TestCaseTemplate } from "./test-utils";

setup();

const rotateCases: { axis: string; template: TestCaseTemplate }[] = [
  { axis: "horizontal", template: (v) => `pyr3 r(${v},0,0)` },
  { axis: "vertical", template: (v) => `pyr3 r(0,${v},0)` },
];

for (const { axis, template } of rotateCases) {
  for (const value of [-40, 40, -90, 90, -175, 175]) {
    const cmd = template(value);
    test(`rotate ${axis} ${value}: ${cmd}`, async ({ page }) => {
      await page.locator("#editor textarea").fill(cmd);
      await expectScreenshot(page, `rotate-${axis}-${value}`);
    });
  }
}
