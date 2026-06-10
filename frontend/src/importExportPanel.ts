import { type ImportsExports } from "./sektor/Sektor";
import { getResourceIcon } from "./resources";
import { ResourceThroughput } from "./sektor/buildings/parseBuildingDefinitions";

let panelEl: HTMLElement | null = null;

export function updateImportExportPanel(importsExports: ImportsExports) {
  ensurePanel();

  panelEl!.innerHTML = "";

  panelEl!.appendChild(createColumn("Imports", importsExports.imports));
  panelEl!.appendChild(createColumn("Exports", importsExports.exports));
}

function ensurePanel() {
  if (panelEl) return;

  panelEl = document.createElement("div");
  panelEl.id = "import-export-panel";
  document.getElementById("canvas-container")!.appendChild(panelEl);
}

function createColumn(title: string, items: ResourceThroughput[]): HTMLElement {
  const col = document.createElement("div");
  col.className = "ie-col";

  const header = document.createElement("div");
  header.className = "ie-header";
  header.textContent = title;
  col.appendChild(header);

  for (const item of items) {
    const row = document.createElement("div");
    row.className = "ie-row";
    const icon = getResourceIcon(item.name);
    row.textContent = `${item.name} ${icon ?? ""} ${item.value}`;
    col.appendChild(row);
  }

  return col;
}
