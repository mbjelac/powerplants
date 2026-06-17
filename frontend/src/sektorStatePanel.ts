import { type SektorState } from "./sektor/Sektor";
import { getResourceIcon } from "./resources";
import { ResourceThroughput } from "./sektor/buildings/parseBuildingDefinitions";

let panelEl: HTMLElement | null = null;

export function updateSektorStatePanel(sektorState: SektorState) {
  ensurePanel();

  panelEl!.innerHTML = "";

  panelEl!.appendChild(createColumn("Imports", sektorState.imports));
  panelEl!.appendChild(createColumn("Exports", sektorState.exports));
}

function ensurePanel() {
  if (panelEl) return;

  panelEl = document.createElement("div");
  panelEl.id = "sektor-state-panel";
  document.getElementById("canvas-container")!.appendChild(panelEl);
}

function createColumn(title: string, items: ResourceThroughput[]): HTMLElement {
  const col = document.createElement("div");
  col.className = "ss-col";

  const header = document.createElement("div");
  header.className = "ss-header";
  header.textContent = title;
  col.appendChild(header);

  for (const item of items.filter(item => item.value !== 0)) {
    const row = document.createElement("div");
    row.className = "ss-row";
    const icon = getResourceIcon(item.name);
    row.textContent = `${item.name} ${icon ?? ""} ${item.value}`;
    col.appendChild(row);
  }

  return col;
}
