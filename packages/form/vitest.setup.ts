import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

const MockIcon = ({ className }: { className?: string }) =>
  React.createElement("span", {
    "aria-hidden": true,
    className,
    "data-testid": "mock-icon",
  });

vi.mock("@zstack/icon", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();

  return {
    ...actual,
    Icon: MockIcon,
    IconArrowIosDown: MockIcon,
    IconArrowIosUp: MockIcon,
    IconMinus: MockIcon,
    IconPlus: MockIcon,
  };
});
