import { describe, expect, it } from "vitest";

import { createSuspenseWrapperErrorPayload } from "./suspense-error-diagnostics";

describe("createSuspenseWrapperErrorPayload", () => {
  it("serializes error and browser diagnostics without requiring browser globals", () => {
    const error = new Error("Cannot read properties of null");
    error.name = "TypeError";
    error.stack =
      "TypeError: Cannot read properties of null\n    at appendChild";

    const payload = createSuspenseWrapperErrorPayload(error, {
      componentStack: "\n    at Chart\n    at Suspense",
      now: () => "2026-05-25T06:00:00.000Z",
      getLocation: () => ({
        href: "https://example.test/virtualization-monitoring-om/alarm-message?x=1#hash",
        pathname: "/virtualization-monitoring-om/alarm-message",
        search: "?x=1",
        hash: "#hash",
      }),
      getDocumentDiagnostics: () => ({
        canvasCount: 2,
        bizchartsElementCount: 2,
        activeElement: "button.reload",
      }),
      getResourceEntries: () => [
        {
          name: "https://example.test/1471.ebebef4f.js",
          initiatorType: "script",
        },
      ],
    });

    expect(payload).toMatchObject({
      source: "SuspenseWrapper",
      timestamp: "2026-05-25T06:00:00.000Z",
      location: {
        href: "https://example.test/virtualization-monitoring-om/alarm-message?x=1#hash",
        pathname: "/virtualization-monitoring-om/alarm-message",
        search: "?x=1",
        hash: "#hash",
      },
      error: {
        name: "TypeError",
        message: "Cannot read properties of null",
        stack: "TypeError: Cannot read properties of null\n    at appendChild",
      },
      componentStack: "\n    at Chart\n    at Suspense",
      dom: {
        canvasCount: 2,
        bizchartsElementCount: 2,
        activeElement: "button.reload",
      },
      resources: [
        {
          name: "https://example.test/1471.ebebef4f.js",
          initiatorType: "script",
        },
      ],
    });
  });
});
