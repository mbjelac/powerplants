import { test, setup, expectScreenshot, type TestCaseTemplate } from "./test-utils";

setup();

const translateCases: { axis: string; template: TestCaseTemplate }[] = [
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
