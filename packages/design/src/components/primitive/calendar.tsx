"use client";

import { Icon } from "@zstack/icon";
import * as React from "react";
import { DayPicker } from "react-day-picker";
import { enUS, zhCN } from "react-day-picker/locale";
import { useIntl } from "react-intl";

import { Button } from "./button.tsx";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const intl = useIntl();
  return (
    <>
      <DayPicker
        showOutsideDays={showOutsideDays}
        locale={intl.locale === "zh-CN" ? zhCN : enUS}
        classNames={{
          root: "relative",
          month_grid: "border-spacing-0 border-spacing-y-1 px-2",
          weekday: "text-xs font-normal text-neutral-700 p-0",
          nav: "flex items-center absolute right-2 top-1",
          month_caption:
            "flex justify-between items-center py-2 border-b-solid border-b-1 border-b-neutral-100 text-xs font-medium h-10 box-border px-2 text-neutral-900",
          day: "py-1 w-8 h-6 text-sm font-normal hover:bg-theme-100 focus:bg-theme-100 hover:rounded-xs focus:rounded-xs",
          day_button:
            "text-xs p-0 border-none bg-transparent cursor-pointer w-8 h-6 text-inherit font-inherit disabled:cursor-not-allowed disabled:text-neutral-300 disabled:bg-neutral-50 disabled:hover:bg-neutral-50",
          selected:
            "bg-theme-600 text-neutral-0 rounded-xs hover:bg-theme-600 focus:bg-theme-600",
          disabled:
            "text-neutral-300 bg-neutral-50 cursor-not-allowed hover:bg-neutral-50 focus:bg-neutral-50 pointer-events-none",
          range_middle: "bg-theme-100 rounded-0",
          range_start: "bg-theme-600 text-neutral-0 rounded-l-sm",
          range_end: "bg-theme-600 text-neutral-0 rounded-r-sm",
          ...classNames,
        }}
        numberOfMonths={1}
        components={{
          PreviousMonthButton: ({ ...props }) => (
            <Button {...props} variant="ghost" className="p-0">
              <Icon type="arrow-ios-left" className="h-4 w-4" />
            </Button>
          ),
          NextMonthButton: ({ ...props }) => (
            <Button {...props} variant="ghost" className="p-0">
              <Icon type="arrow-ios-right" className="h-4 w-4" />
            </Button>
          ),
        }}
        {...props}
      />
    </>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
