import type { SubpanelState } from "./editorPanel";

export function getTextarea(): HTMLTextAreaElement {
  return document.querySelector("#editor textarea") as HTMLTextAreaElement;
}

export function createSlider(min: number, max: number, value: number): HTMLInputElement {
  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = String(min);
  slider.max = String(max);
  slider.value = String(value);
  slider.className = "panel-slider";
  return slider;
}

export function updateFunctionOnLine(
  subpanels: SubpanelState[],
  panel: SubpanelState,
  regex: RegExp,
  newValue: string,
) {
  const textarea = getTextarea();
  const lines = textarea.value.split("\n");
  const idx = subpanels.indexOf(panel);
  if (idx < 0 || idx >= lines.length) return;

  let line = lines[idx];
  if (regex.test(line)) {
    line = line.replace(regex, newValue);
  } else {
    line = line + ` ${newValue}`;
  }

  lines[idx] = line;
  textarea.value = lines.join("\n");
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}
