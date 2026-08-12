import { render } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Icon } from "../src/icon";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Icon ref forwarding", () => {
  it("forwards refs to the rendered svg element without React warnings", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const iconRef = createRef<SVGSVGElement>();

    render(<Icon ref={iconRef} type="refresh" data-testid="refresh-icon" />);

    expect(iconRef.current).toBeInstanceOf(SVGSVGElement);
    expect(iconRef.current?.tagName.toLowerCase()).toBe("svg");

    const hasRefWarning = consoleError.mock.calls.some(([message]) =>
      String(message).includes("Function components cannot be given refs"),
    );
    expect(hasRefWarning).toBe(false);
  });
});
