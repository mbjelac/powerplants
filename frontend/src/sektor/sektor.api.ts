import { SektorData } from "../../../shared/sektorData";

export type { SektorData };

export function getSektorData(name: string): SektorData | null {
  const stored = localStorage.getItem(`sektor_${name}`);
  if (!stored) return null;
  return JSON.parse(stored);
}

export function saveSektorData(name: string, data: SektorData): void {
  localStorage.setItem(`sektor_${name}`, JSON.stringify(data));
}
