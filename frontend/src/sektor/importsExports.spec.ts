import { describe, it, expect } from "vitest";
import { Sektor } from "./Sektor";

describe("getImportsExports", () => {
  it("returns empty imports and exports when there are no buildings", () => {
    const sektor = new Sektor([[50]]);

    const result = sektor.getImportsExports();

    expect(result).toEqual({
      imports: [],
      exports: [],
    });
  });
});
