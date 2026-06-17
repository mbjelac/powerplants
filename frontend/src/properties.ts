import propertiesMd from "./assets/properties.md?raw";

export interface PropertyDefinition {
  name: string;
  minColor: string;
  maxColor: string;
}

export const propertyDefinitions: PropertyDefinition[] = [];

for (const line of propertiesMd.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed) continue;
  const parts = trimmed.split(/\s+/);
  if (parts.length < 3) continue;
  propertyDefinitions.push({
    name: parts[0],
    minColor: parts[1],
    maxColor: parts[2],
  });
}
