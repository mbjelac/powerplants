import type { SubpanelState } from "./editorPanel";
import { updateFunctionOnLine } from "./editorWidgets";

const COLOR_REGEX = /c\(#[0-9a-fA-F]{6}\)/;

export function addColorPicker(
  el: HTMLElement,
  state: SubpanelState,
  subpanels: SubpanelState[],
) {
  const group = document.createElement("div");
  group.className = "slider-group";

  const label = document.createElement("span");
  label.className = "slider-letter";
  label.textContent = "C";
  group.appendChild(label);

  const input = document.createElement("input");
  input.type = "color";
  input.value = "#808080";
  input.className = "color-input";
  group.appendChild(input);

  const hexLabel = document.createElement("span");
  hexLabel.className = "color-hex";
  hexLabel.textContent = "";
  group.appendChild(hexLabel);

  el.appendChild(group);

  input.addEventListener("input", () => {
    const hex = input.value;
    hexLabel.textContent = hex;
    state.color = hex;
    updateFunctionOnLine(
      subpanels,
      state,
      COLOR_REGEX,
      `c(${hex})`,
    );
  });

  state.setColor = (hex: string | null) => {
    state.color = hex;
    if (hex) {
      input.value = hex;
      hexLabel.textContent = hex;
    } else {
      input.value = "#808080";
      hexLabel.textContent = "";
    }
  };
}
