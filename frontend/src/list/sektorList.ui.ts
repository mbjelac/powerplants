import { getSektorList, SektorListItem } from "./sektorList.api";
import { arrowRightIcon } from "../icons";

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
