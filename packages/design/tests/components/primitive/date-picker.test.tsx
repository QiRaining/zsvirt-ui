import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { IntlProvider } from "react-intl";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { DatePicker } from "../../../src/components/primitive/date-picker";

vi.mock("../../../src/components/primitive/calendar", async () => {
  const React = await import("react");

  return {
    Calendar: () =>
      React.createElement(
        "div",
        { "data-testid": "mock-calendar" },
        "calendar",
      ),
  };
});

vi.mock("@zstack/icon", async () => {
  const React = await import("react");

  return {
    Icon: (props: React.HTMLAttributes<HTMLSpanElement>) =>
      React.createElement("span", props),
    IconCalendar: () => React.createElement("span", null),
    IconCloseCircleFill: (props: React.HTMLAttributes<HTMLSpanElement>) =>
      React.createElement("span", props),
  };
});

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <IntlProvider
      locale="zh-CN"
      messages={{
        confirm: "确定",
        "datePicker.placeholder": "请选择日期",
        "timePicker.now": "此刻",
      }}
    >
      {ui}
    </IntlProvider>,
  );
}

describe("DatePicker", () => {
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, "scrollTo", {
      configurable: true,
      value: vi.fn(),
    });
  });

  it("showSecond=false 时底部操作栏应横跨弹层而不是放在时间列内", () => {
    renderWithIntl(
      <DatePicker
        value={new Date(2026, 4, 1, 12, 54)}
        showTime
        showSecond={false}
        showNow
      />,
    );

    fireEvent.click(screen.getByText("2026-05-01 12:54"));

    const footer = screen.getByRole("button", { name: "确定" }).parentElement;
    expect(footer).toHaveClass("border-t", "justify-between");

    const confirmButton = screen.getByRole("button", { name: "确定" });
    expect(confirmButton).toHaveClass("bg-transparent", "text-theme-600");
    expect(confirmButton).not.toHaveClass("bg-theme-600");

    const panelBody = footer?.previousElementSibling;
    expect(panelBody).toHaveClass("flex");

    const timePanel = panelBody?.lastElementChild;
    expect(timePanel).toHaveClass("w-[80px]");
    expect(timePanel).not.toContainElement(footer);
  });

  it("showNow=false 时只右对齐确认按钮", () => {
    renderWithIntl(
      <DatePicker
        value={new Date(2026, 4, 1, 12, 54)}
        showTime
        showSecond={false}
        showNow={false}
      />,
    );

    fireEvent.click(screen.getByText("2026-05-01 12:54"));

    expect(
      screen.queryByRole("button", { name: "此刻" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "确定" }).parentElement,
    ).toHaveClass("justify-end");
  });
});
