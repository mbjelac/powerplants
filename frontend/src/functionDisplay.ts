
import { getResourceIcon } from "./resources";
import { BuildingFunction, ResourceThroughput } from "./sektor/buildings/parseBuildingDefinitions";

export function createFunctionDisplay(buildingFunction: BuildingFunction, imports: ResourceThroughput[]): HTMLElement {
  const functionDisplay = document.createElement("div");
  functionDisplay.className = "bf-function";

  functionDisplay.appendChild(createInputsColumn(buildingFunction.inputs, imports));

  const equalsEl = document.createElement("div");
  equalsEl.className = "bf-equals";
  equalsEl.textContent = "=";
  functionDisplay.appendChild(equalsEl);

  functionDisplay.appendChild(createColumn(buildingFunction.outputs));

  return functionDisplay;
}

function createInputsColumn(inputs: ResourceThroughput[], imports: ResourceThroughput[]): HTMLElement {
  const column = document.createElement("div");
  column.className = "bf-col";
  for (const input of inputs) {
    const row = document.createElement("div");
    const icon = getResourceIcon(input.name);
    row.textContent = `${input.name} ${icon ?? ""} ${input.value}`;
    column.appendChild(row);

    const importEntry = imports.find(entry => entry.name === input.name);
    if (importEntry) {
      const importRow = document.createElement("div");
      importRow.className = "bf-import";
      importRow.textContent = `${importEntry.value}`;
      column.appendChild(importRow);
    }
  }
  return column;
}

function createColumn(items: ResourceThroughput[]): HTMLElement {
  const column = document.createElement("div");
  column.className = "bf-col";
  for (const item of items) {
    const row = document.createElement("div");
    const icon = getResourceIcon(item.name);
    row.textContent = `${item.name} ${icon ?? ""} ${item.value}`;
    column.appendChild(row);
  }
  return column;
}
