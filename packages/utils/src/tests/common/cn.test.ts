import { describe, it, expect } from "vitest";

import { cn } from "../../common/cn";

describe("Tailwind Class Merger", () => {
  it("should merge classes correctly", () => {
    expect(cn("text-red-500", "bg-blue-500")).toBe("text-red-500 bg-blue-500");
  });

  it("should handle conflicting truncate classes", () => {
    expect(cn("truncate", "line-clamp-2")).toBe("line-clamp-2");
  });

  it("should handle font size conflicts", () => {
    expect(cn("text-xs", "text-sm")).toBe("text-sm");
  });

  it("should handle conditional classes", () => {
    expect(cn("base", true && "active", false && "inactive")).toBe(
      "base active",
    );
  });
});
