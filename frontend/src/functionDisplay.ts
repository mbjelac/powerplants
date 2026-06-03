import { type BuildingFunctionSpec } from "./buildings";
import { type BuildingFunction } from "./sektor/Sektor";
import { getResourceIcon } from "./resources";

type CurrentEntry = { name: string; requiredValue: number; currentValue: number };

export function createFunctionDisplay(fn: BuildingFunctionSpec | BuildingFunction): HTMLElement {
  const fnDisplay = document.createElement("div");
  fnDisplay.className = "bf-function";

  fnDisplay.appendChild(createColumn(fn.inputs));

  const equalsEl = document.createElement("div");
  equalsEl.className = "bf-equals";
  equalsEl.textContent = "=";
  fnDisplay.appendChild(equalsEl);

  fnDisplay.appendChild(createColumn(fn.outputs));

  return fnDisplay;
}

function formatValue(item: SpecEntry | CurrentEntry): string {
  if ("requiredValue" in item) {
    return `${item.currentValue}/${item.requiredValue}`;
  }
  return `${item.value}`;
}

function createColumn(items: (SpecEntry | CurrentEntry)[]): HTMLElement {
  const col = document.createElement("div");
  col.className = "bf-col";
  for (const item of items) {
    const row = document.createElement("div");
    const icon = getResourceIcon(item.name);
    row.textContent = `${item.name} ${icon ?? ""} ${formatValue(item)}`;
    col.appendChild(row);
  }
  return col;
}
