import { getTextarea } from "./editorWidgets";
import { addRotationSliders } from "./rotationSliders";
import { addTranslateSliders } from "./translateSliders";
import { addScaleSliders } from "./scaleSliders";
import { addColorPicker } from "./colorPicker";

interface ShapeDef {
  command: string;
  label: string;
  svg: string;
}

export interface SubpanelState {
  shape: ShapeDef;
  element: HTMLElement;
  shapeBtn: HTMLElement;
  rotateX: number;
  rotateY: number;
  translateX: number;
  translateY: number;
  translateZ: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  scaleLocked: boolean;
  color: string | null;
}

const shapes: ShapeDef[] = [
  { command: "pyr", label: "pyr4", svg: pyrSvg(4) },
  { command: "pyr3", label: "pyr3", svg: pyrSvg(3) },
  { command: "pyr5", label: "pyr5", svg: pyrSvg(5) },
  { command: "pyr6", label: "pyr6", svg: pyrSvg(6) },
  { command: "pyr7", label: "pyr7", svg: pyrSvg(7) },
  { command: "pyr8", label: "pyr8", svg: pyrSvg(8) },
  { command: "pyr9", label: "pyr9", svg: pyrSvg(9) },
  { command: "pri3", label: "pri3", svg: priSvg(3) },
  { command: "pri4", label: "pri4", svg: priSvg(4) },
  { command: "pri5", label: "pri5", svg: priSvg(5) },
  { command: "pri6", label: "pri6", svg: priSvg(6) },
  { command: "pri7", label: "pri7", svg: priSvg(7) },
  { command: "pri8", label: "pri8", svg: priSvg(8) },
  { command: "pri9", label: "pri9", svg: priSvg(9) },
  { command: "sph", label: "sph", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="9" ry="4"/></svg>` },
  { command: "cyl", label: "cyl", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><ellipse cx="12" cy="6" rx="8" ry="3"/><line x1="4" y1="6" x2="4" y2="18"/><line x1="20" y1="6" x2="20" y2="18"/><path d="M4 18 Q12 24 20 18"/></svg>` },
  { command: "con", label: "con", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><line x1="12" y1="4" x2="4" y2="18"/><line x1="12" y1="4" x2="20" y2="18"/><path d="M4 18 Q12 24 20 18"/></svg>` },
  { command: "tor", label: "tor", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><ellipse cx="12" cy="12" rx="10" ry="5"/><ellipse cx="12" cy="12" rx="4" ry="2"/></svg>` },
];

function pyrSvg(sides: number): string {
  const cx = 12, cy = 14, r = 8, apex = 4;
  const points: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / sides;
    points.push(`${cx + r * Math.cos(angle) * 0.6},${cy + r * Math.sin(angle) * 0.4}`);
  }
  const base = `<polygon points="${points.join(" ")}" fill="none" stroke="#ccc" stroke-width="1.5"/>`;
  const lines = points.map(p => `<line x1="${cx}" y1="${apex}" x2="${p.split(",")[0]}" y2="${p.split(",")[1]}" stroke="#ccc" stroke-width="1.5"/>`).join("");
  return `<svg viewBox="0 0 24 24">${base}${lines}</svg>`;
}

function priSvg(sides: number): string {
  const cx = 12, r = 7, topY = 6, botY = 18;
  const topPts: string[] = [];
  const botPts: string[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / sides;
    const x = cx + r * Math.cos(angle) * 0.6;
    topPts.push(`${x},${topY + r * Math.sin(angle) * 0.3}`);
    botPts.push(`${x},${botY + r * Math.sin(angle) * 0.3}`);
  }
  const topPoly = `<polygon points="${topPts.join(" ")}" fill="none" stroke="#ccc" stroke-width="1.5"/>`;
  const botPoly = `<polygon points="${botPts.join(" ")}" fill="none" stroke="#ccc" stroke-width="1.5"/>`;
  const lines = topPts.map((tp, i) => {
    const [tx, ty] = tp.split(",");
    const [bx, by] = botPts[i].split(",");
    return `<line x1="${tx}" y1="${ty}" x2="${bx}" y2="${by}" stroke="#ccc" stroke-width="1.5"/>`;
  }).join("");
  return `<svg viewBox="0 0 24 24">${topPoly}${botPoly}${lines}</svg>`;
}

const defaultShape = shapes[0];

const subpanels: SubpanelState[] = [];

function syncTextarea() {
  const textarea = getTextarea();
  const lines = textarea.value.split("\n");
  for (let i = 0; i < subpanels.length; i++) {
    const currentLine = lines[i] ?? "";
    const oldCommand = getShapeCommand(currentLine);
    if (oldCommand !== null) {
      const rest = currentLine.slice(oldCommand.length).trim();
      lines[i] = rest ? `${subpanels[i].shape.command} ${rest}` : subpanels[i].shape.command;
    } else {
      lines[i] = subpanels[i].shape.command;
    }
  }
  textarea.value = lines.join("\n");
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

function getShapeCommand(line: string): string | null {
  const trimmed = line.trim();
  for (const s of shapes) {
    if (trimmed.startsWith(s.command) && (trimmed.length === s.command.length || trimmed[s.command.length] === " ")) {
      return s.command;
    }
  }
  return null;
}

function createSubpanel(shape: ShapeDef): SubpanelState {
  const el = document.createElement("div");
  el.className = "subpanel";

  const shapeBtn = document.createElement("button");
  shapeBtn.className = "shape-btn";
  shapeBtn.innerHTML = shape.svg;
  el.appendChild(shapeBtn);

  const label = document.createElement("span");
  label.className = "shape-label";
  label.textContent = shape.label;
  el.appendChild(label);

  const state: SubpanelState = { shape, element: el, shapeBtn, rotateX: 0, rotateY: 0, translateX: 0, translateY: 0, translateZ: 0, scaleX: 100, scaleY: 100, scaleZ: 100, scaleLocked: false, color: null };

  shapeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    showShapePopup(state, shapeBtn);
  });

  addRotationSliders(el, state, subpanels);
  addTranslateSliders(el, state, subpanels);
  addScaleSliders(el, state, subpanels);
  addColorPicker(el, state, subpanels);

  const dupBtn = document.createElement("button");
  dupBtn.className = "dup-btn";
  dupBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="1.5"><rect x="3" y="7" width="12" height="12" rx="2"/><rect x="9" y="3" width="12" height="12" rx="2"/></svg>`;
  dupBtn.title = "Duplicate";
  dupBtn.addEventListener("click", () => {
    duplicateSubpanel(state);
  });
  el.appendChild(dupBtn);

  const delBtn = document.createElement("button");
  delBtn.className = "del-btn";
  delBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="1.5"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M5 6v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;
  delBtn.title = "Delete";
  delBtn.addEventListener("click", () => {
    deleteSubpanel(state);
  });
  el.appendChild(delBtn);

  return state;
}

function deleteSubpanel(target: SubpanelState) {
  const textarea = getTextarea();
  const lines = textarea.value.split("\n");
  const index = subpanels.indexOf(target);

  // Remove line from textarea
  lines.splice(index, 1);
  textarea.value = lines.join("\n");
  textarea.dispatchEvent(new Event("input", { bubbles: true }));

  // Remove subpanel from array and DOM
  subpanels.splice(index, 1);
  target.element.remove();
}

function duplicateSubpanel(source: SubpanelState) {
  const textarea = getTextarea();
  const lines = textarea.value.split("\n");
  const index = subpanels.indexOf(source);
  const lineToDuplicate = lines[index] ?? source.shape.command;

  // Insert duplicated line in textarea
  lines.splice(index + 1, 0, lineToDuplicate);
  textarea.value = lines.join("\n");
  textarea.dispatchEvent(new Event("input", { bubbles: true }));

  // Create new subpanel with same shape
  const newPanel = createSubpanel(source.shape);
  subpanels.splice(index + 1, 0, newPanel);

  // Insert DOM element after source
  const container = document.getElementById("subpanels")!;
  const nextSibling = source.element.nextSibling;
  container.insertBefore(newPanel.element, nextSibling);
}

function showShapePopup(panel: SubpanelState, anchor: HTMLElement) {
  const popup = document.getElementById("shape-popup")!;
  popup.innerHTML = "";

  for (const shape of shapes) {
    const option = document.createElement("div");
    option.className = "shape-option";
    option.innerHTML = `${shape.svg}<span>${shape.label}</span>`;
    option.addEventListener("click", () => {
      panel.shape = shape;
      panel.shapeBtn.innerHTML = shape.svg;
      const label = panel.element.querySelector(".shape-label")!;
      label.textContent = shape.label;
      popup.style.display = "none";
      syncTextarea();
    });
    popup.appendChild(option);
  }

  const rect = anchor.getBoundingClientRect();
  popup.style.display = "block";
  popup.style.left = `${rect.right + 4}px`;
  popup.style.top = `${rect.top}px`;

  const closePopup = (e: MouseEvent) => {
    if (!popup.contains(e.target as Node)) {
      popup.style.display = "none";
      document.removeEventListener("click", closePopup);
    }
  };
  setTimeout(() => document.addEventListener("click", closePopup), 0);
}

export function initEditorPanel() {
  const addBtn = document.getElementById("add-shape-btn")!;
  const subpanelsContainer = document.getElementById("subpanels")!;

  addBtn.addEventListener("click", () => {
    const panel = createSubpanel(defaultShape);
    subpanels.push(panel);
    subpanelsContainer.appendChild(panel.element);

    const textarea = getTextarea();
    const text = textarea.value;
    if (text && !text.endsWith("\n")) {
      textarea.value = text + "\n" + defaultShape.command;
    } else {
      textarea.value = text + defaultShape.command;
    }
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
