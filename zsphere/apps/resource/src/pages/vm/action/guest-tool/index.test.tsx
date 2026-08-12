import { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock(
  "@zstack/virtualization-resource/src/pages/vm/components/configuration-info",
  () => ({
    GuestTools: ({ visible, setVisible }: any) => (
      <button
        type="button"
        data-testid="guest-tools-dialog"
        onClick={() => setVisible(false)}
      >
        {String(visible)}
      </button>
    ),
  }),
);

import GuestToolAction from ".";

const containers: HTMLDivElement[] = [];

function renderAction() {
  const container = document.createElement("div");
  const root = createRoot(container);
  containers.push(container);

  function TestHarness() {
    const [visible, setVisible] = useState(false);

    return (
      <>
        <button
          type="button"
          data-testid="open-action"
          onClick={() => setVisible(true)}
        >
          Open
        </button>
        <GuestToolAction
          visible={visible}
          setVisible={setVisible}
          selectedList={[{} as any]}
          view=""
          position="header"
        />
      </>
    );
  }

  act(() => root.render(<TestHarness />));

  return {
    container,
    unmount: () => act(() => root.unmount()),
  };
}

function click(element: Element) {
  act(() => {
    element.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });
}

afterEach(() => {
  containers.splice(0).forEach((container) => container.remove());
});

describe("GuestToolAction", () => {
  it("can reopen the dialog after it is closed", () => {
    const { container, unmount } = renderAction();
    const openAction = container.querySelector('[data-testid="open-action"]')!;
    const dialog = container.querySelector(
      '[data-testid="guest-tools-dialog"]',
    )!;

    click(openAction);
    expect(dialog.textContent).toBe("true");

    click(dialog);
    expect(dialog.textContent).toBe("false");

    click(openAction);
    expect(dialog.textContent).toBe("true");

    unmount();
  });
});
