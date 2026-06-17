
import { getResourceIcon } from "../resources";
import { BuildingFunction, ResourceThroughput } from "./buildings/parseBuildingDefinitions";

const ARROW_DOWN_TRAY_SVG = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>';
const LINK_SVG = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>';
const ARROW_RIGHT_SVG = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="16" height="16"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>';

export function createFunctionDisplay({ buildingFunction, imports, onAddInputConnection }: {
  buildingFunction: BuildingFunction,
  imports: ResourceThroughput[],
  onAddInputConnection?: (resourceType: string) => void
}): HTMLElement {
  const functionDisplay = document.createElement("div");
  functionDisplay.className = "bf-function";

  functionDisplay.appendChild(createInputsTable({ inputs: buildingFunction.inputs, imports: imports, onAddConnection: onAddInputConnection }));

  const arrowEl = document.createElement("div");
  arrowEl.className = "bf-arrow";
  arrowEl.innerHTML = ARROW_RIGHT_SVG;
  functionDisplay.appendChild(arrowEl);

  functionDisplay.appendChild(createColumn(buildingFunction.outputs));

  return functionDisplay;
}

function createInputsTable({ inputs, imports, onAddConnection }: {
  inputs: ResourceThroughput[],
  imports: ResourceThroughput[],
  onAddConnection?: (resourceType: string) => void
}): HTMLElement {
  const table = document.createElement("div");
  table.className = onAddConnection ? "bf-inputs-table" : "bf-inputs-table bf-inputs-table-simple";

  if (onAddConnection) {
    const headerRow = document.createElement("div");
    headerRow.className = "bf-inputs-row bf-inputs-header";

    const connectHeader = document.createElement("div");
    connectHeader.className = "bf-inputs-cell bf-inputs-connect";
    headerRow.appendChild(connectHeader);

    const resourceHeader = document.createElement("div");
    resourceHeader.className = "bf-inputs-cell";
    resourceHeader.textContent = "Resource";
    headerRow.appendChild(resourceHeader);

    const amountHeader = document.createElement("div");
    amountHeader.className = "bf-inputs-cell";
    headerRow.appendChild(amountHeader);

    const importHeader = document.createElement("div");
    importHeader.className = "bf-inputs-cell bf-inputs-import-header";
    importHeader.innerHTML = ARROW_DOWN_TRAY_SVG;
    importHeader.title = "Imported";
    headerRow.appendChild(importHeader);

    table.appendChild(headerRow);
  }

  for (const input of inputs) {
    const row = document.createElement("div");
    row.className = "bf-inputs-row";

    if (onAddConnection) {
      const connectCell = document.createElement("div");
      connectCell.className = "bf-inputs-cell bf-inputs-connect";
      connectCell.innerHTML = LINK_SVG;
      row.appendChild(connectCell);
    }

    const icon = getResourceIcon(input.name);
    const resourceCell = document.createElement("div");
    resourceCell.className = "bf-inputs-cell";
    resourceCell.textContent = `${input.name} ${icon ?? ""}`;
    row.appendChild(resourceCell);

    const amountCell = document.createElement("div");
    amountCell.className = "bf-inputs-cell bf-inputs-amount";
    amountCell.textContent = `${input.value}`;
    row.appendChild(amountCell);

    if (onAddConnection) {
      const importEntry = imports.find(entry => entry.name === input.name);
      const importCell = document.createElement("div");
      importCell.className = "bf-inputs-cell bf-inputs-import";
      importCell.textContent = importEntry ? `${importEntry.value}` : "";
      row.appendChild(importCell);
    }

    if (onAddConnection) {
      row.classList.add("bf-input-clickable");
      row.addEventListener("click", () => onAddConnection(input.name));
    }

    table.appendChild(row);
  }

  return table;
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
