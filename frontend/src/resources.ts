import resourcesMd from "./assets/resources.md?raw";
import testResourcesMd from "./assets/resources.test.md?raw";

const isTestMode = import.meta.env.DEV && new URLSearchParams(window.location.search).get("test") === "true";
const source = isTestMode ? testResourcesMd : resourcesMd;

const resourceIcons: Map<string, string> = new Map();

for (const line of source.split("\n")) {
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
