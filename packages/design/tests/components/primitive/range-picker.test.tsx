import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import type { DateRange } from "react-day-picker";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { RangePicker } from "../../../src/components/primitive/range-picker";

const calendarRange = vi.hoisted(() => ({
  value: undefined as DateRange | undefined,
}));

vi.mock("../../../src/components/primitive/calendar", async () => {
  const React = await import("react");

  return {
    Calendar: ({
      onSelect,
    }: {
      onSelect?: (range: DateRange | undefined) => void;
    }) =>
      React.createElement(
        "button",
        {
          "data-testid": "mock-calendar-select",
          onClick: () => onSelect?.(calendarRange.value),
          type: "button",
        },
        "select date",
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
        "date.end": "结束日期",
        "date.endTime": "结束时间",
        "date.start": "开始日期",
        "date.startTime": "开始时间",
      }}
    >
      {ui}
    </IntlProvider>,
  );
}

describe("RangePicker", () => {
  it("同一天补选结束日期后，应能编辑结束时间并保留开始时间", () => {
    const selectedRanges: Array<DateRange | undefined> = [];

    function Wrapper() {
      const [selected, setSelected] = React.useState<DateRange>({
        from: new Date(2026, 5, 9, 11, 0),
      });

      return (
        <RangePicker
          selected={selected}
          onSelect={(range) => {
            selectedRanges.push(range);
            setSelected(range);
          }}
        />
      );
    }

    renderWithIntl(<Wrapper />);

    fireEvent.click(screen.getByText("2026-06-09 11:00"));

    calendarRange.value = {
      from: new Date(2026, 5, 9, 0, 0),
      to: new Date(2026, 5, 9, 0, 0),
    };
    fireEvent.click(screen.getByTestId("mock-calendar-select"));
    fireEvent.click(screen.getAllByText("12")[0]);

    const latestRange = selectedRanges.at(-1);
    expect(latestRange?.from?.getHours()).toBe(11);
    expect(latestRange?.to?.getHours()).toBe(12);
  });

  it("应支持手动切换当前编辑的是开始时间还是结束时间", () => {
    const selectedRanges: Array<DateRange | undefined> = [];

    function Wrapper() {
      const [selected, setSelected] = React.useState<DateRange>();

      return (
        <RangePicker
          selected={selected}
          onSelect={(range) => {
            selectedRanges.push(range);
            setSelected(range);
          }}
        />
      );
    }

    renderWithIntl(<Wrapper />);

    fireEvent.click(screen.getByText("开始日期"));

    calendarRange.value = {
      from: new Date(2026, 5, 9, 0, 0),
      to: new Date(2026, 5, 9, 0, 0),
    };
    fireEvent.click(screen.getByTestId("mock-calendar-select"));
    fireEvent.click(screen.getAllByText("11")[0]);

    fireEvent.click(screen.getByRole("button", { name: "结束时间" }));
    fireEvent.click(screen.getAllByText("12")[0]);

    const latestRange = selectedRanges.at(-1);
    expect(latestRange?.from?.getHours()).toBe(11);
    expect(latestRange?.to?.getHours()).toBe(12);
  });
});
