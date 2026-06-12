
import { getResourceIcon } from "./resources";
import { BuildingConnection } from "./sektor/Sektor";
import { BuildingFunction, ResourceThroughput } from "./sektor/buildings/parseBuildingDefinitions";

export function createFunctionDisplay({ buildingFunction, imports, inputConnections = [], onAddInputConnection }: {
  buildingFunction: BuildingFunction,
  imports: ResourceThroughput[],
  inputConnections?: BuildingConnection[],
  onAddInputConnection?: (resourceType: string) => void
}): HTMLElement {
  const functionDisplay = document.createElement("div");
  functionDisplay.className = "bf-function";

  functionDisplay.appendChild(createInputsColumn({ inputs: buildingFunction.inputs, imports: imports, connections: inputConnections, onAddConnection: onAddInputConnection }));

  const equalsEl = document.createElement("div");
  equalsEl.className = "bf-equals";
  equalsEl.textContent = "=";
  functionDisplay.appendChild(equalsEl);

  functionDisplay.appendChild(createColumn(buildingFunction.outputs));

  return functionDisplay;
}

function createInputsColumn({ inputs, imports, connections, onAddConnection }: {
  inputs: ResourceThroughput[],
  imports: ResourceThroughput[],
  connections: BuildingConnection[],
  onAddConnection?: (resourceType: string) => void
}): HTMLElement {
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

      const connectionsForInput = connections.filter(connection => connection.resourceType === input.name);
      for (const connection of connectionsForInput) {
        const connectionLabel = document.createElement("span");
        connectionLabel.className = "bf-connection";
        connectionLabel.textContent = `${connection.amount}`;
        importRow.appendChild(connectionLabel);
      }

      if (onAddConnection) {
        const addButton = document.createElement("button");
        addButton.className = "bf-add-connection";
        addButton.textContent = "+";
        addButton.addEventListener("click", () => onAddConnection(input.name));
        importRow.appendChild(addButton);
      }

      const importLabel = document.createElement("span");
      importLabel.textContent = `${importEntry.value}`;
      importRow.appendChild(importLabel);

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
