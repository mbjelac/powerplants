import { SektorStatus } from "../sektor/Sektor";

export interface SektorListItem {
  name: string;
  status: SektorStatus;
}

export function getSektorList(): SektorListItem[] {
  const stored = localStorage.getItem("sektors");
  if (!stored) return [];
  return JSON.parse(stored);
}
