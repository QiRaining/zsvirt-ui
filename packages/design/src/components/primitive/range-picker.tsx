"use client";

import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import type { PopoverPortal } from "@radix-ui/react-popover";

import * as React from "react";
import type { DateRange } from "react-day-picker";
import { useIntl } from "react-intl";

import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
interface RangePickerProps {
  className?: string;
  selected?: DateRange;
  onSelect?: (range: DateRange | undefined) => void;
  disabled?: boolean;
  /** 日期不可选判断（接收 Date 对象） */
  disabledDates?: (date: Date) => boolean;
  placeholder?: string;
  onConfirm?: () => void;
  onClear?: () => void;
  popoverPortalProps?: React.ComponentPropsWithoutRef<typeof PopoverPortal>;
}

interface TimeValue {
  hours: string;
  minutes: string;
}

const toTimeValue = (date?: Date): TimeValue => ({
  hours: String(date?.getHours() ?? 0).padStart(2, "0"),
  minutes: String(date?.getMinutes() ?? 0).padStart(2, "0"),
});

const isSameCalendarDate = (dateA?: Date, dateB?: Date) => {
  if (!dateA || !dateB) {
    return dateA === dateB;
  }

  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
};

const withTimeValue = (date: Date, time: TimeValue, fallbackDate?: Date) => {
  const nextDate = new Date(date);
  nextDate.setHours(
    parseInt(time.hours, 10),
    parseInt(time.minutes, 10),
    fallbackDate?.getSeconds() ?? date.getSeconds(),
    fallbackDate?.getMilliseconds() ?? date.getMilliseconds(),
  );
  return nextDate;
};

type RangeEndpoint = "from" | "to";

export function RangePicker({
  className,
  selected,
  onSelect,
  disabled,
  disabledDates,
  onConfirm,
  placeholder: _placeholder = "选择日期范围",
  onClear,
  popoverPortalProps,
}: RangePickerProps) {
  const intl = useIntl();

  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
  const [startTime, setStartTime] = React.useState(() =>
    toTimeValue(selected?.from),
  );
  const [endTime, setEndTime] = React.useState(() => toTimeValue(selected?.to));
  const [lastSelectedType, setLastSelectedType] =
    React.useState<RangeEndpoint>("from");

  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0"),
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0"),
  );

  const selectedFromTime = selected?.from?.getTime();
  const selectedToTime = selected?.to?.getTime();

  React.useEffect(() => {
    setStartTime(toTimeValue(selected?.from));
    setEndTime(toTimeValue(selected?.to));
  }, [selectedFromTime, selectedToTime, selected?.from, selected?.to]);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const handleTimeChange = (field: "hours" | "minutes", value: string) => {
    if (!selected) {
      return;
    }

    const newRange = { ...selected };
    const setTime = lastSelectedType === "from" ? setStartTime : setEndTime;

    setTime((prev) => ({ ...prev, [field]: value }));

    if (lastSelectedType === "from" && selected.from) {
      const newDate = new Date(selected.from);
      if (field === "hours") {
        newDate.setHours(parseInt(value, 10));
      }
      if (field === "minutes") {
        newDate.setMinutes(parseInt(value, 10));
      }
      newRange.from = newDate;
    } else if (lastSelectedType === "to" && selected.to) {
      const newDate = new Date(selected.to);
      if (field === "hours") {
        newDate.setHours(parseInt(value, 10));
      }
      if (field === "minutes") {
        newDate.setMinutes(parseInt(value, 10));
      }
      newRange.to = newDate;
    }

    onSelect?.(newRange);
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    if (!range) {
      onSelect?.(undefined);
      return;
    }

    const fromChanged = !isSameCalendarDate(selected?.from, range.from);
    const toChanged = !isSameCalendarDate(selected?.to, range.to);

    if (range.to && !fromChanged && toChanged) {
      setLastSelectedType("to");
    } else if (fromChanged) {
      setLastSelectedType("from");
    } else if (toChanged) {
      setLastSelectedType("to");
    }

    onSelect?.({
      from: range.from
        ? withTimeValue(range.from, startTime, selected?.from)
        : undefined,
      to: range.to ? withTimeValue(range.to, endTime, selected?.to) : undefined,
    });
  };

  const handleEditingTypeChange = (type: RangeEndpoint) => {
    setLastSelectedType(type);

    if (type === "to" && selected?.from && !selected.to) {
      onSelect?.({
        ...selected,
        to: withTimeValue(selected.from, endTime, selected.from),
      });
    }

    if (type === "from" && selected?.to && !selected.from) {
      onSelect?.({
        ...selected,
        from: withTimeValue(selected.to, startTime, selected.to),
      });
    }
  };

  const handleClear = () => {
    onSelect?.(undefined);
    setStartTime(toTimeValue());
    setEndTime(toTimeValue());
    onClear?.();
  };

  // 获取当前编辑的时间
  const getCurrentEditingTime = () => {
    if (!selected) {
      return null;
    }

    if (lastSelectedType === "from" && selected.from) {
      return formatDate(selected.from);
    } else if (lastSelectedType === "to" && selected.to) {
      return formatDate(selected.to);
    }
    return null;
  };

  const startTimeLabel = intl.formatMessage({
    id: "date.startTime",
    defaultMessage: "Start time",
  });
  const endTimeLabel = intl.formatMessage({
    id: "date.endTime",
    defaultMessage: "End time",
  });

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <div
          tabIndex={disabled ? -1 : 0}
          className={cn(
            "bg-neutral-0 box-border flex h-8 w-80 cursor-pointer items-center rounded-xs border border-solid border-neutral-400 pl-2",
            "focus:ring-theme-600 focus:border-theme-600 focus:ring-theme-50 focus:ring-2 focus:ring-offset-0 focus:outline-none",
            "hover:border-theme-600",
            disabled && "cursor-not-allowed opacity-50",
            className,
          )}
        >
          <div className="flex flex-1 items-center justify-between text-sm">
            <span
              className={cn(
                !selected?.from ? "text-neutral-400" : "text-neutral-700",
                "flex-1",
              )}
            >
              {selected?.from
                ? formatDate(selected.from)
                : intl.formatMessage({
                    id: "date.start",
                    defaultMessage: "开始日期",
                  })}
            </span>
            <span className="mx-1 text-neutral-400">~</span>
            <span
              className={cn(
                !selected?.to ? "text-neutral-400" : "text-neutral-700",
                "flex-1",
              )}
            >
              {selected?.to
                ? formatDate(selected.to)
                : intl.formatMessage({
                    id: "date.end",
                    defaultMessage: "结束日期",
                  })}
            </span>
          </div>
          <div className="flex w-8 items-center justify-center">
            {selected?.from || selected?.to ? (
              <Icon type="close-circle-fill"
                onClick={handleClear}
                className="parent svg:h-4 svg:w-4 svg:fill-current flex cursor-pointer text-neutral-400 hover:text-neutral-500"
              />
            ) : (
              <Icon type="calendar" className="text-neutral-400" />
            )}
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="bg-neutral-0 w-auto p-0"
        align="start"
        onEscapeKeyDown={() => setIsPopoverOpen(false)}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
        }}
        popoverPortalProps={popoverPortalProps}
      >
        <div className="flex">
          <div className=" ">
            <div className="border-b-solid border-r-solid border-r border-b-1 border-r-neutral-100 border-b-neutral-100">
              <Calendar
                mode="range"
                defaultMonth={selected?.from}
                selected={selected}
                onSelect={handleCalendarSelect}
                numberOfMonths={1}
                disabled={disabledDates}
              />
            </div>
          </div>
          <div className="w-34 border-l border-neutral-200">
            <div className="border-b-solid box-border border-b-1 border-b-neutral-100">
              <div className="flex h-8 items-center">
                {(
                  [
                    ["from", startTimeLabel],
                    ["to", endTimeLabel],
                  ] as const
                ).map(([type, label]) => (
                  <button
                    key={type}
                    type="button"
                    className={cn(
                      "h-8 flex-1 cursor-pointer border-0 bg-transparent px-1 text-xs text-neutral-600 hover:bg-neutral-100",
                      lastSelectedType === type &&
                        "bg-theme-100 text-theme-700 font-medium",
                    )}
                    onClick={() => handleEditingTypeChange(type)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex h-8 items-center justify-center px-1 text-center">
                <div className="truncate text-xs text-neutral-900">
                  {getCurrentEditingTime()}
                </div>
              </div>
            </div>
            <div className="border-b-solid flex h-45 border-b border-b-neutral-100">
              <div className="border-r-solid flex-1 overflow-y-auto border-r border-r-neutral-100">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className={cn(
                      "flex h-8 cursor-pointer items-center justify-center text-xs hover:bg-neutral-100",
                      ((lastSelectedType === "from" &&
                        startTime.hours === hour) ||
                        (lastSelectedType === "to" &&
                          endTime.hours === hour)) &&
                        "bg-theme-100",
                    )}
                    onClick={() => handleTimeChange("hours", hour)}
                  >
                    {hour}
                  </div>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto">
                {minutes.map((minute) => (
                  <div
                    key={minute}
                    className={cn(
                      "flex h-8 cursor-pointer items-center justify-center text-xs hover:bg-neutral-100",
                      ((lastSelectedType === "from" &&
                        startTime.minutes === minute) ||
                        (lastSelectedType === "to" &&
                          endTime.minutes === minute)) &&
                        "bg-theme-100",
                    )}
                    onClick={() => handleTimeChange("minutes", minute)}
                  >
                    {minute}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex h-10 items-center justify-end pr-5">
              <Button
                variant="link"
                onClick={() => {
                  setIsPopoverOpen(false);
                  onConfirm?.();
                }}
              >
                {intl.formatMessage({
                  id: "confirm",
                  defaultMessage: "确定",
                })}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

RangePicker.displayName = "RangePicker";
