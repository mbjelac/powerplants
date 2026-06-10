import { type BuildingFunctionSpec, type ResourceThroughput } from "./buildings";
import { getResourceIcon } from "./resources";

export function createFunctionDisplay(fn: BuildingFunctionSpec): HTMLElement {
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

function createColumn(items: ResourceThroughput[]): HTMLElement {
  const col = document.createElement("div");
  col.className = "bf-col";
  for (const item of items) {
    const row = document.createElement("div");
    const icon = getResourceIcon(item.name);
    row.textContent = `${item.name} ${icon ?? ""} ${item.value}`;
    col.appendChild(row);
  }
  return col;
}
