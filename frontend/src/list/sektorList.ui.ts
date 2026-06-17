import { getSektorList, SektorListItem } from "./sektorList.api";

const arrowRightIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" width="18" height="18"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>`;

function renderList() {
  const container = document.getElementById("sektor-list")!;
  const sektors = getSektorList();

  for (const sektor of sektors) {
    container.appendChild(createListItem(sektor));
  }
}

function createListItem(sektor: SektorListItem): HTMLElement {
  const item = document.createElement("div");
  item.className = "sektor-list-item";

  const name = document.createElement("span");
  name.className = "sektor-list-name";
  name.textContent = sektor.name;
  item.appendChild(name);

  const status = document.createElement("span");
  status.className = "sektor-list-status";
  status.textContent = formatStatus(sektor.status);
  item.appendChild(status);

  const button = document.createElement("button");
  button.className = "sektor-list-go";
  button.innerHTML = arrowRightIcon;
  button.addEventListener("click", () => {
    window.location.href = `/sektor.html?name=${encodeURIComponent(sektor.name)}`;
  });
  item.appendChild(button);

  return item;
}

function formatStatus(status: SektorListItem["status"]): string {
  if (status === "InProgress") return "In progress";
  if (status === "Done") return "Done";
  return "Restrictions exceeded";
}

renderList();
