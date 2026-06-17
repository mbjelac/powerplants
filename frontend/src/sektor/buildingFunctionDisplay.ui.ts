
import { getResourceIcon } from "../resources";
import { BuildingFunction, ResourceThroughput } from "./buildings/parseBuildingDefinitions";
import { arrowDownTrayIcon, linkIcon, arrowRightIcon } from "../icons";

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
  arrowEl.innerHTML = arrowRightIcon;
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
    importHeader.innerHTML = arrowDownTrayIcon;
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
      connectCell.innerHTML = linkIcon;
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
