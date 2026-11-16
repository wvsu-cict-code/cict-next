import { describe, expect, it } from "vitest";
import { formatBytes } from "./format";

describe("formatBytes", () => {
  it("formats 0 as 0 MB, 1 MiB as 1 MB, and 1.5 GiB as 1.5 GB", () => {
    expect(formatBytes(0)).toBe("0 MB");
    expect(formatBytes(1048576)).toBe("1 MB");
    expect(formatBytes(1610612736)).toBe("1.5 GB");
  });
});
