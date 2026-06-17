import { type SektorState } from "./sektor/Sektor";
import { getResourceIcon } from "./resources";
import { ResourceThroughput } from "./sektor/buildings/parseBuildingDefinitions";

let panelEl: HTMLElement | null = null;

export function updateSektorStatePanel(sektorState: SektorState) {
  ensurePanel();

  panelEl!.innerHTML = "";

  panelEl!.appendChild(createImportColumn(sektorState.imports, sektorState.importRestrictions));
  panelEl!.appendChild(createExportColumn(sektorState.exports, sektorState.exportRequirements));
}

function ensurePanel() {
  if (panelEl) return;

  panelEl = document.createElement("div");
  panelEl.id = "sektor-state-panel";
  document.getElementById("canvas-container")!.appendChild(panelEl);
}

function createImportColumn(imports: ResourceThroughput[], restrictions: ResourceThroughput[]): HTMLElement {
  const col = document.createElement("div");
  col.className = "ss-col";

  const header = document.createElement("div");
  header.className = "ss-header";

  const resourceHeader = document.createElement("span");
  resourceHeader.className = "ss-header-resource";
  header.appendChild(resourceHeader);

  const importHeader = document.createElement("span");
  importHeader.className = "ss-header-value";
  importHeader.innerHTML = arrowDownTrayIcon;
  importHeader.title = "Amount imported";
  header.appendChild(importHeader);

  if (restrictions.length > 0) {
    const restrictionHeader = document.createElement("span");
    restrictionHeader.className = "ss-header-value";
    restrictionHeader.innerHTML = exclamationTriangleIcon;
    restrictionHeader.title = "Maximum";
    header.appendChild(restrictionHeader);
  }

  col.appendChild(header);

  const resourceNames = mergedResourceNames(imports, restrictions);

  for (const name of resourceNames) {
    const importValue = imports.find(item => item.name === name)?.value ?? 0;
    const restriction = restrictions.find(item => item.name === name);

    const row = document.createElement("div");
    row.className = "ss-row";

    const nameCell = document.createElement("span");
    nameCell.className = "ss-cell-resource";
    const icon = getResourceIcon(name);
    nameCell.textContent = `${name} ${icon ?? ""}`;
    row.appendChild(nameCell);

    const valueCell = document.createElement("span");
    valueCell.className = "ss-cell-value";
    valueCell.textContent = `${importValue}`;
    if (restriction !== undefined && importValue > restriction.value) {
      valueCell.classList.add("ss-exceeded");
    }
    row.appendChild(valueCell);

    if (restrictions.length > 0) {
      const restrictionCell = document.createElement("span");
      restrictionCell.className = "ss-cell-value";
      restrictionCell.textContent = restriction !== undefined ? `${restriction.value}` : "";
      row.appendChild(restrictionCell);
    }

    col.appendChild(row);
  }

  return col;
}

function createExportColumn(exports: ResourceThroughput[], requirements: ResourceThroughput[]): HTMLElement {
  const col = document.createElement("div");
  col.className = "ss-col";

  const header = document.createElement("div");
  header.className = "ss-header";

  const resourceHeader = document.createElement("span");
  resourceHeader.className = "ss-header-resource";
  header.appendChild(resourceHeader);

  const exportHeader = document.createElement("span");
  exportHeader.className = "ss-header-value";
  exportHeader.innerHTML = arrowUpTrayIcon;
  exportHeader.title = "Amount exported";
  header.appendChild(exportHeader);

  if (requirements.length > 0) {
    const requirementHeader = document.createElement("span");
    requirementHeader.className = "ss-header-value";
    requirementHeader.innerHTML = checkCircleIcon;
    requirementHeader.title = "Minimum";
    header.appendChild(requirementHeader);
  }

  col.appendChild(header);

  const resourceNames = mergedResourceNames(exports, requirements);

  for (const name of resourceNames) {
    const exportValue = exports.find(item => item.name === name)?.value ?? 0;
    const requirement = requirements.find(item => item.name === name);

    const row = document.createElement("div");
    row.className = "ss-row";

    const nameCell = document.createElement("span");
    nameCell.className = "ss-cell-resource";
    const icon = getResourceIcon(name);
    nameCell.textContent = `${name} ${icon ?? ""}`;
    row.appendChild(nameCell);

    const valueCell = document.createElement("span");
    valueCell.className = "ss-cell-value";
    valueCell.textContent = `${exportValue}`;
    if (requirement !== undefined && exportValue >= requirement.value) {
      valueCell.classList.add("ss-met");
    }
    row.appendChild(valueCell);

    if (requirements.length > 0) {
      const requirementCell = document.createElement("span");
      requirementCell.className = "ss-cell-value";
      requirementCell.textContent = requirement !== undefined ? `${requirement.value}` : "";
      row.appendChild(requirementCell);
    }

    col.appendChild(row);
  }

  return col;
}

function mergedResourceNames(values: ResourceThroughput[], thresholds: ResourceThroughput[]): string[] {
  const names = new Set<string>();
  for (const item of values) {
    if (item.value !== 0) names.add(item.name);
  }
  for (const item of thresholds) {
    names.add(item.name);
  }
  return Array.from(names);
}

const arrowDownTrayIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>`;

const arrowUpTrayIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>`;

const exclamationTriangleIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="orange" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>`;

const checkCircleIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="green" width="14" height="14"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`;
