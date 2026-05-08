import type { SubpanelState } from "./editorPanel";
import { createSlider, updateFunctionOnLine } from "./editorWidgets";

const SCALE_REGEX = /s\(\s*-?\d+\s*,\s*-?\d+\s*,\s*-?\d+\s*\)/;

const LOCK_UNLOCKED = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#888" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0" /></svg>`;
const LOCK_LOCKED = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ccc" stroke-width="2"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>`;

export function addScaleSliders(
  el: HTMLElement,
  state: SubpanelState,
  subpanels: SubpanelState[],
) {
  const group = document.createElement("div");
  group.className = "slider-group";

  const label = document.createElement("span");
  label.className = "slider-letter";
  label.textContent = "S";
  group.appendChild(label);

  const slidersCol = document.createElement("div");
  slidersCol.className = "sliders-col";

  const sliders = [
    createSliderWithReset(1, 200, 100),
    createSliderWithReset(1, 200, 100),
    createSliderWithReset(1, 200, 100),
  ];

  for (const { row } of sliders) {
    slidersCol.appendChild(row);
  }

  group.appendChild(slidersCol);

  // Lock button
  const lockBtn = document.createElement("button");
  lockBtn.className = "lock-btn";
  lockBtn.innerHTML = LOCK_UNLOCKED;
  lockBtn.addEventListener("click", () => {
    state.scaleLocked = !state.scaleLocked;
    lockBtn.innerHTML = state.scaleLocked ? LOCK_LOCKED : LOCK_UNLOCKED;
    if (state.scaleLocked) {
      const val = sliders[0].slider.value;
      sliders[1].slider.value = val;
      sliders[2].slider.value = val;
      update();
    }
  });
  group.appendChild(lockBtn);

  el.appendChild(group);

  const update = () => {
    state.scaleX = parseInt(sliders[0].slider.value);
    state.scaleY = parseInt(sliders[1].slider.value);
    state.scaleZ = parseInt(sliders[2].slider.value);
    updateFunctionOnLine(
      subpanels,
      state,
      SCALE_REGEX,
      `s(${state.scaleX},${state.scaleY},${state.scaleZ})`,
    );
  };

  for (const { slider } of sliders) {
    slider.addEventListener("input", () => {
      if (state.scaleLocked) {
        const val = slider.value;
        for (const s of sliders) {
          s.slider.value = val;
        }
      }
      update();
    });
  }
}

function createSliderWithReset(
  min: number,
  max: number,
  value: number,
): { row: HTMLElement; slider: HTMLInputElement } {
  const row = document.createElement("div");
  row.className = "slider-row";

  const slider = createSlider(min, max, value);
  row.appendChild(slider);

  const resetBtn = document.createElement("button");
  resetBtn.className = "reset-btn";
  resetBtn.textContent = "⛌";
  resetBtn.addEventListener("click", () => {
    slider.value = String(100);
    slider.dispatchEvent(new Event("input", { bubbles: true }));
  });
  row.appendChild(resetBtn);

  return { row, slider };
}
