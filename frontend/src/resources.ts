import resourcesMd from "./assets/resources.md?raw";
import testResourcesMd from "./assets/resources.test.md?raw";

const isTestMode = import.meta.env.DEV && new URLSearchParams(window.location.search).get("test") === "true";
const source = isTestMode ? testResourcesMd : resourcesMd;

const resourceIcons: Map<string, string> = new Map();
const resourceColors: Map<string, string> = new Map();

for (const line of source.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed) continue;
  const parts = trimmed.split(" ");
  if (parts.length < 2) continue;
  const name = parts[0];
  const icon = parts[1];
  resourceIcons.set(name, icon);
  if (parts.length >= 3) {
    resourceColors.set(name, parts[2]);
  }
}

export function getResourceIcon(name: string): string | null {
  return resourceIcons.get(name) ?? null;
}

export function getResourceColor(name: string): string {
  return resourceColors.get(name) ?? "#ffffff";
}
