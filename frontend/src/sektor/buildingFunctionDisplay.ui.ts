
import { getResourceIcon } from "../resources";
import { Booster, BuildingFunction, ResourceThroughput } from "./buildings/parseBuildingDefinitions";
import { arrowDownTrayIcon, arrowUpTrayIcon, linkIcon, arrowRightIcon } from "../icons";

export function createFunctionDisplay({ buildingFunction, modifiedOutputs, imports, exports, onAddInputConnection }: {
  buildingFunction: BuildingFunction,
  modifiedOutputs?: ResourceThroughput[],
  imports: ResourceThroughput[],
  exports?: ResourceThroughput[],
  onAddInputConnection?: (resourceType: string) => void
}): HTMLElement {
  const functionDisplay = document.createElement("div");
  functionDisplay.className = "bf-function";

  functionDisplay.appendChild(createInputsTable({ inputs: buildingFunction.inputs, imports: imports, onAddConnection: onAddInputConnection }));

  const arrowEl = document.createElement("div");
  arrowEl.className = "bf-arrow";
  arrowEl.innerHTML = arrowRightIcon;
  functionDisplay.appendChild(arrowEl);

  functionDisplay.appendChild(createOutputColumn(buildingFunction.outputs, modifiedOutputs, exports));

  return functionDisplay;
}

export function createBoosterList(boosters: Booster[]): HTMLElement {
  const boosterSection = document.createElement("div");
  boosterSection.className = "bf-boosters";

  const header = document.createElement("div");
  header.className = "bf-boosters-header";
  header.textContent = "Improvements +";
  boosterSection.appendChild(header);

  const table = document.createElement("div");
  table.className = "bf-inputs-table bf-inputs-table-simple";

  for (const booster of boosters) {
    const row = document.createElement("div");
    row.className = "bf-inputs-row";

    const icon = getResourceIcon(booster.input.name);
    const resourceCell = document.createElement("div");
    resourceCell.className = "bf-inputs-cell";
    resourceCell.textContent = `${booster.input.name} ${icon ?? ""}`;
    row.appendChild(resourceCell);

    const amountCell = document.createElement("div");
    amountCell.className = "bf-inputs-cell bf-inputs-amount";
    amountCell.textContent = `${booster.input.value}`;
    row.appendChild(amountCell);

    table.appendChild(row);
  }

  boosterSection.appendChild(table);

  return boosterSection;
}

function createInputsTable({ inputs, imports, onAddConnection }: {
  inputs: ResourceThroughput[],
  imports: ResourceThroughput[],
  onAddConnection?: (resourceType: string) => void
}): HTMLElement {
  const table = document.createElement("div");
  table.className = onAddConnection ? "bf-inputs-table" : "bf-inputs-table bf-inputs-table-simple";

  const headerRow = document.createElement("div");
  headerRow.className = "bf-inputs-row bf-inputs-header";

  if (onAddConnection) {
    const connectHeader = document.createElement("div");
    connectHeader.className = "bf-inputs-cell bf-inputs-connect";
    headerRow.appendChild(connectHeader);
  }

  const resourceHeader = document.createElement("div");
  resourceHeader.className = "bf-inputs-cell";
  resourceHeader.textContent = "Inputs";
  headerRow.appendChild(resourceHeader);

  const amountHeader = document.createElement("div");
  amountHeader.className = "bf-inputs-cell";
  headerRow.appendChild(amountHeader);

  if (onAddConnection) {
    const importHeader = document.createElement("div");
    importHeader.className = "bf-inputs-cell bf-inputs-import-header";
    importHeader.innerHTML = arrowDownTrayIcon;
    importHeader.title = "Imported";
    headerRow.appendChild(importHeader);
  }

  table.appendChild(headerRow);

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

function createOutputColumn(outputs: ResourceThroughput[], modifiedOutputs?: ResourceThroughput[], exports?: ResourceThroughput[]): HTMLElement {
  const table = document.createElement("div");
  table.className = exports ? "bf-outputs-table" : "bf-outputs-table bf-outputs-table-simple";

  const headerRow = document.createElement("div");
  headerRow.className = "bf-outputs-row bf-outputs-header";

  if (exports) {
    const spacerHeader = document.createElement("div");
    spacerHeader.className = "bf-outputs-cell bf-outputs-spacer";
    headerRow.appendChild(spacerHeader);
  }

  const resourceHeader = document.createElement("div");
  resourceHeader.className = "bf-outputs-cell";
  resourceHeader.textContent = "Outputs";
  headerRow.appendChild(resourceHeader);

  const amountHeader = document.createElement("div");
  amountHeader.className = "bf-outputs-cell";
  headerRow.appendChild(amountHeader);

  if (exports) {
    const exportHeader = document.createElement("div");
    exportHeader.className = "bf-outputs-cell bf-outputs-export-header";
    exportHeader.innerHTML = arrowUpTrayIcon;
    exportHeader.title = "Exported";
    headerRow.appendChild(exportHeader);
  }

  table.appendChild(headerRow);

  for (const output of outputs) {
    const row = document.createElement("div");
    row.className = "bf-outputs-row";

    if (exports) {
      const spacerCell = document.createElement("div");
      spacerCell.className = "bf-outputs-cell bf-outputs-spacer";
      row.appendChild(spacerCell);
    }

    const resourceCell = document.createElement("div");
    resourceCell.className = "bf-outputs-cell";
    const icon = getResourceIcon(output.name);
    resourceCell.textContent = `${output.name} ${icon ?? ""}`;
    row.appendChild(resourceCell);

    const amountCell = document.createElement("div");
    amountCell.className = "bf-outputs-cell bf-outputs-amount";
    const modified = modifiedOutputs?.find(modifiedOutput => modifiedOutput.name === output.name);
    if (modified && modified.value !== output.value) {
      const modifiedValue = document.createElement("span");
      modifiedValue.textContent = `${modified.value}`;
      modifiedValue.className = modified.value > output.value ? "bf-output-boosted" : "bf-output-reduced";
      amountCell.append(modifiedValue, ` (${output.value})`);
    } else {
      amountCell.textContent = `${output.value}`;
    }
    row.appendChild(amountCell);

    if (exports) {
      const exportEntry = exports.find(entry => entry.name === output.name);
      const exportCell = document.createElement("div");
      exportCell.className = "bf-outputs-cell bf-outputs-export";
      exportCell.textContent = exportEntry ? `${exportEntry.value}` : "";
      row.appendChild(exportCell);
    }

    table.appendChild(row);
  }

  return table;
}
