import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React, { useState } from "react";
import { IntlProvider } from "react-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  createErrorBoundaryPayload,
  ErrorBoundary,
  isChunkLoadError,
  PanicFallback,
  SuspenseBoundary,
} from "./index";

const renderWithIntl = (children: React.ReactNode) =>
  render(<IntlProvider locale="en-US">{children}</IntlProvider>);

const ThrowingComponent = ({ error }: { error: Error }) => {
  throw error;
};

const preventExpectedReactError = (event: ErrorEvent) => {
  event.preventDefault();
};

beforeEach(() => {
  window.addEventListener("error", preventExpectedReactError);
});

afterEach(() => {
  window.removeEventListener("error", preventExpectedReactError);
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("PanicFallback", () => {
  it("renders the default panic fallback actions", () => {
    renderWithIntl(
      <PanicFallback
        title="Custom error title"
        description="Custom error description"
        reloadText="Try again"
        backText="Go previous"
      />,
    );

    expect(screen.getByText("Custom error title")).toBeInTheDocument();
    expect(screen.getByText("Custom error description")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Try again" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Go previous" }),
    ).toBeInTheDocument();
  });
});

describe("SuspenseBoundary", () => {
  it("exports an unprefixed ErrorBoundary component", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    renderWithIntl(
      <ErrorBoundary>
        <ThrowingComponent error={new Error("render failed")} />
      </ErrorBoundary>,
    );

    expect(await screen.findByText("出错了")).toBeInTheDocument();
  });

  it("renders the default fallback when a child throws while rendering", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    renderWithIntl(
      <SuspenseBoundary>
        <ThrowingComponent error={new Error("render failed")} />
      </SuspenseBoundary>,
    );

    expect(await screen.findByText("出错了")).toBeInTheDocument();
  });

  it("prefers custom fallbackRender over the default fallback", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    renderWithIntl(
      <SuspenseBoundary
        fallbackRender={({ error }) => (
          <div role="alert">Custom fallback: {error.message}</div>
        )}
      >
        <ThrowingComponent error={new Error("product failed")} />
      </SuspenseBoundary>,
    );

    expect(
      await screen.findByText("Custom fallback: product failed"),
    ).toBeInTheDocument();
  });

  it("resets the error state when resetKeys change", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    const TestHarness = () => {
      const [routeKey, setRouteKey] = useState("broken");

      return (
        <>
          <button type="button" onClick={() => setRouteKey("healthy")}>
            Change route
          </button>
          <SuspenseBoundary resetKeys={[routeKey]}>
            {routeKey === "broken" ? (
              <ThrowingComponent error={new Error("route failed")} />
            ) : (
              <div>Healthy route</div>
            )}
          </SuspenseBoundary>
        </>
      );
    };

    renderWithIntl(<TestHarness />);

    expect(await screen.findByText("出错了")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Change route" }));

    expect(await screen.findByText("Healthy route")).toBeInTheDocument();
  });

  it("shows loading fallback and schedules reset for chunk load errors", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");

    renderWithIntl(
      <SuspenseBoundary loadingFallback={<div>Retrying chunk</div>}>
        <ThrowingComponent
          error={Object.assign(new Error("Loading chunk 42 failed"), {
            name: "ChunkLoadError",
          })}
        />
      </SuspenseBoundary>,
    );

    expect(await screen.findByText("Retrying chunk")).toBeInTheDocument();
    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 100);
  });
});

describe("createErrorBoundaryPayload", () => {
  it("serializes error and diagnostics", () => {
    const error = new Error("Cannot read properties of null");
    error.name = "TypeError";
    error.stack = "TypeError: Cannot read properties of null";

    const payload = createErrorBoundaryPayload(error, {
      source: "SuspenseWrapper",
      componentStack: "\n    at EmailServer",
      now: () => "2026-05-25T06:00:00.000Z",
      getLocation: () => ({
        href: "https://example.test/virtualization-administration/email-server",
        pathname: "/virtualization-administration/email-server",
        search: "",
        hash: "",
      }),
      getDocumentDiagnostics: () => ({
        canvasCount: 1,
        bizchartsElementCount: 0,
        activeElement: "button.reload",
      }),
      getResourceEntries: () => [
        {
          name: "https://example.test/remote.js",
          initiatorType: "script",
        },
      ],
    });

    expect(payload).toMatchObject({
      source: "SuspenseWrapper",
      timestamp: "2026-05-25T06:00:00.000Z",
      location: {
        href: "https://example.test/virtualization-administration/email-server",
        pathname: "/virtualization-administration/email-server",
      },
      error: {
        name: "TypeError",
        message: "Cannot read properties of null",
        stack: "TypeError: Cannot read properties of null",
      },
      componentStack: "\n    at EmailServer",
      dom: {
        canvasCount: 1,
        bizchartsElementCount: 0,
        activeElement: "button.reload",
      },
      resources: [
        {
          name: "https://example.test/remote.js",
          initiatorType: "script",
        },
      ],
    });
  });
});

describe("isChunkLoadError", () => {
  it("matches known dynamic import failure shapes", () => {
    expect(
      isChunkLoadError(
        Object.assign(new Error("Loading chunk 1 failed"), {
          name: "ChunkLoadError",
        }),
      ),
    ).toBe(true);
    expect(
      isChunkLoadError(
        new Error("Failed to fetch dynamically imported module"),
      ),
    ).toBe(true);
    expect(isChunkLoadError(new Error("business render failed"))).toBe(false);
  });
});
