import { test, setup, expectScreenshot, type TestCaseTemplate } from "./test-utils";

setup();

const scaleCases: { axis: string; template: TestCaseTemplate }[] = [
  { axis: "x", template: (v) => `pyr3 s(${v},100,100)` },
  { axis: "y", template: (v) => `pyr3 s(100,${v},100)` },
  { axis: "z", template: (v) => `pyr3 s(100,100,${v})` },
  { axis: "uniform", template: (v) => `pyr3 s(${v})` },
];

for (const { axis, template } of scaleCases) {
  for (const value of [-10, 0, 1, 50, 100, 150, 500]) {
    const cmd = template(value);
    test(`scale ${axis} ${value}: ${cmd}`, async ({ page }) => {
      await page.locator("#editor textarea").fill(cmd);
      await expectScreenshot(page, `scale-${axis}-${value}`);
    });
  }
}
