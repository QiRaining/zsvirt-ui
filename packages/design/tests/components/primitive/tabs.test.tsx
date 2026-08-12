import { render, screen } from "@testing-library/react";
import * as React from "react";
import "@testing-library/jest-dom";
import { beforeAll, describe, expect, it, vi } from "vitest";

import {
  TabsContent,
  TabsList,
  TabsRoot,
  TabsTrigger,
} from "../../../src/components/primitive/tabs/tabs";

describe("Tabs", () => {
  beforeAll(() => {
    class ResizeObserverMock {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }

    global.ResizeObserver =
      ResizeObserverMock as unknown as typeof ResizeObserver;
  });

  it("does not draw a full-width focus ring on tab panels", () => {
    render(
      <TabsRoot defaultValue="all">
        <TabsContent value="all">所有任务</TabsContent>
      </TabsRoot>,
    );

    const panel = screen.getByRole("tabpanel");

    expect(panel).toHaveClass("focus-visible:outline-none");
    expect(panel).not.toHaveClass("focus-visible:ring-2");
    expect(panel).not.toHaveClass("focus-visible:ring-offset-2");
  });

  it("does not draw the browser default outline on tab triggers", () => {
    render(
      <TabsRoot defaultValue="all">
        <TabsList>
          <TabsTrigger value="all" label="所有任务" />
        </TabsList>
      </TabsRoot>,
    );

    const trigger = screen.getByRole("tab", { name: "所有任务" });

    expect(trigger).toHaveClass("focus-visible:outline-none");
  });
});
