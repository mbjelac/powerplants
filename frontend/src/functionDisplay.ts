
import { getResourceIcon } from "./resources";
import { BuildingFunction, ResourceThroughput } from "./sektor/buildings/parseBuildingDefinitions";

export function createFunctionDisplay({ buildingFunction, imports, onAddInputConnection }: {
  buildingFunction: BuildingFunction,
  imports: ResourceThroughput[],
  onAddInputConnection?: (resourceType: string) => void
}): HTMLElement {
  const functionDisplay = document.createElement("div");
  functionDisplay.className = "bf-function";

  functionDisplay.appendChild(createInputsColumn({ inputs: buildingFunction.inputs, imports: imports, onAddConnection: onAddInputConnection }));

  const equalsEl = document.createElement("div");
  equalsEl.className = "bf-equals";
  equalsEl.textContent = "=";
  functionDisplay.appendChild(equalsEl);

  functionDisplay.appendChild(createColumn(buildingFunction.outputs));

  return functionDisplay;
}

function createInputsColumn({ inputs, imports, onAddConnection }: {
  inputs: ResourceThroughput[],
  imports: ResourceThroughput[],
  onAddConnection?: (resourceType: string) => void
}): HTMLElement {
  const column = document.createElement("div");
  column.className = "bf-col";
  for (const input of inputs) {
    const row = document.createElement("div");
    const icon = getResourceIcon(input.name);
    const importEntry = imports.find(entry => entry.name === input.name);
    const importText = importEntry ? ` (${importEntry.value})` : "";
    row.textContent = `${input.name} ${icon ?? ""} ${input.value}${importText}`;

    if (onAddConnection) {
      row.className = "bf-input-clickable";
      row.addEventListener("click", () => onAddConnection(input.name));
    }

    column.appendChild(row);
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
