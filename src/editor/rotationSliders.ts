import type { SubpanelState } from "./editorPanel";
import { createSlider, updateFunctionOnLine } from "./editorWidgets";

const ROTATE_REGEX = /r\(\s*-?\d+\s*,\s*-?\d+\s*\)/;

export function addRotationSliders(
  el: HTMLElement,
  state: SubpanelState,
  subpanels: SubpanelState[],
) {
  const rotGroup = document.createElement("div");
  rotGroup.className = "slider-group";

  const rotLabel = document.createElement("span");
  rotLabel.className = "slider-letter";
  rotLabel.textContent = "R";
  rotGroup.appendChild(rotLabel);

  const slidersCol = document.createElement("div");
  slidersCol.className = "sliders-col";

  const sliderX = createSlider(0, 360, 0);
  const sliderY = createSlider(0, 360, 0);
  slidersCol.appendChild(sliderX);
  slidersCol.appendChild(sliderY);
  rotGroup.appendChild(slidersCol);
  el.appendChild(rotGroup);

  sliderX.addEventListener("input", () => {
    state.rotateX = parseInt(sliderX.value);
    updateRotateOnLine(state, subpanels);
  });
  sliderY.addEventListener("input", () => {
    state.rotateY = parseInt(sliderY.value);
    updateRotateOnLine(state, subpanels);
  });
}

function updateRotateOnLine(panel: SubpanelState, subpanels: SubpanelState[]) {
  updateFunctionOnLine(
    subpanels,
    panel,
    ROTATE_REGEX,
    `r(${panel.rotateX},${panel.rotateY})`,
  );
}
