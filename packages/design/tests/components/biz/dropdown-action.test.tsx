import { act, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

type CapturedDropdownProps = {
  items: unknown[];
  children: ReactNode;
  onSelect: (event: { key: string | number }) => void;
};

const { dropdownPropsSpy } = vi.hoisted(() => ({
  dropdownPropsSpy: vi.fn<(props: CapturedDropdownProps) => void>(),
}));

vi.mock("../../../src/components/primitive/dropdown-menu.tsx", async () => {
  const React = await import("react");

  return {
    Dropdown: (props: CapturedDropdownProps) => {
      dropdownPropsSpy(props);

      return React.createElement(
        "div",
        { "data-testid": "dropdown-action" },
        props.children,
      );
    },
  };
});

vi.mock("@zstack/icon", async () => {
  const React = await import("react");

  return {
    Icon: () => React.createElement("span", null),
    IconArrowIosDown: () => React.createElement("span", null),
  };
});

vi.mock("react-intl", () => ({
  useIntl: () => ({
    formatMessage: ({
      defaultMessage,
      id,
    }: {
      defaultMessage?: string;
      id: string;
    }) => defaultMessage ?? id,
  }),
}));

import { Action } from "../../../src/components/biz/dropdown-action";

type TestRow = {
  uuid: string;
};

describe("Dropdown Action", () => {
  beforeEach(() => {
    dropdownPropsSpy.mockClear();
  });

  it("preserves grouped action children for the primitive Dropdown", () => {
    render(
      <Action<TestRow>
        items={[
          {
            key: "group-0-1",
            type: "group",
            children: [
              { key: "sync", label: "同步", type: "item" },
              { key: "delete", label: "删除", type: "item", disabled: true },
            ],
          },
        ]}
        refetch={vi.fn()}
        selectedList={[]}
        trigger={<button type="button">批量操作</button>}
      />,
    );

    expect(dropdownPropsSpy.mock.calls[0]?.[0].items).toMatchObject([
      {
        key: "group-0-1",
        type: "group",
        children: [
          { key: "sync", label: "同步", type: "item" },
          { key: "delete", label: "删除", type: "item", disabled: true },
        ],
      },
    ]);
  });

  it("opens dialogs attached to grouped child actions", async () => {
    const DeleteDialog = ({ visible }: { visible: boolean }) => (
      <div data-testid="delete-dialog">{visible ? "open" : "closed"}</div>
    );

    render(
      <Action<TestRow>
        items={[
          {
            key: "group-0-1",
            type: "group",
            children: [
              {
                key: "delete",
                label: "删除",
                type: "item",
                dialog: DeleteDialog,
              },
            ],
          },
        ]}
        refetch={vi.fn()}
        selectedList={[]}
        trigger={<button type="button">批量操作</button>}
      />,
    );

    expect(screen.getByTestId("delete-dialog")).toHaveTextContent("closed");

    const dropdownProps = dropdownPropsSpy.mock.calls[0]?.[0];
    expect(dropdownProps).toBeDefined();

    act(() => {
      dropdownProps?.onSelect({ key: "delete" });
    });

    await waitFor(() => {
      expect(screen.getByTestId("delete-dialog")).toHaveTextContent("open");
    });
  });
});
