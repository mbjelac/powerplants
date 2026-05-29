import resourcesMd from "./assets/resources.md?raw";

const resourceIcons: Map<string, string> = new Map();

for (const line of resourcesMd.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed) continue;
  const spaceIdx = trimmed.indexOf(" ");
  if (spaceIdx === -1) continue;
  const name = trimmed.slice(0, spaceIdx);
  const icon = trimmed.slice(spaceIdx + 1).trim();
  resourceIcons.set(name, icon);
}

export function getResourceIcon(name: string): string | null {
  return resourceIcons.get(name) ?? null;
}
