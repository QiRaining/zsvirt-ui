"use client";

import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import type { PopoverPortal } from "@radix-ui/react-popover";

import * as React from "react";
import { useIntl } from "react-intl";

import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

/** Moment-like 接口（与 TimePicker 保持一致） */
interface MomentLike {
  clone: () => MomentLike;
  toDate: () => Date;
  year: (...args: number[]) => MomentLike & number;
  month: (...args: number[]) => MomentLike & number;
  date: (...args: number[]) => MomentLike & number;
  hour: (...args: number[]) => MomentLike & number;
  minute: (...args: number[]) => MomentLike & number;
  second: (...args: number[]) => MomentLike & number;
  format: (fmt: string) => string;
  [key: string]: unknown;
}

export interface DisabledTimeConfig {
  disabledHours?: () => number[];
  disabledMinutes?: () => number[];
  disabledSeconds?: () => number[];
}

export interface DatePickerProps {
  /** 当前值 — 支持 Date / Moment-like / undefined */
  value?: unknown;
  /** 值变更回调，返回类型与输入类型一致 */
  onChange?: (val: unknown) => void;
  /**
   * 首次选择时用于创建初始值的工厂函数。
   * 传入 `() => moment()` 即可让返回值始终是 moment 对象。
   */
  createValue?: () => unknown;
  /** 是否显示时间选择面板 */
  showTime?: boolean;
  /** 是否显示秒选择列（仅在 showTime 为 true 时生效，默认 true） */
  showSecond?: boolean;
  /** 是否显示「此刻」按钮 */
  showNow?: boolean;
  /** 日期禁用判断（接收 Date 对象） */
  disabledDate?: (date: Date) => boolean;
  /** 时间禁用配置（接收 Date 对象） */
  disabledTime?: (date: Date) => DisabledTimeConfig;
  /** 占位文本 */
  placeholder?: string;
  /** 显示格式 — 仅用于 trigger 文本展示 */
  format?: string;
  /** 禁用 */
  disabled?: boolean;
  /** 允许清除 */
  allowClear?: boolean;
  /** 自定义 className */
  className?: string;
  /** 宽度 */
  width?: number | string;
  /** 是否使用 modal 模式（在 Dialog 内使用时需设为 true） */
  modal?: boolean;
  /** 自定义 Popover 的 z-index（在 Dialog 内使用时可指定更高值） */
  zIndex?: number;
  /** Popover portal props */
  popoverPortalProps?: React.ComponentPropsWithoutRef<typeof PopoverPortal>;
}

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

function isMomentLike(val: unknown): val is MomentLike {
  return (
    !!val &&
    typeof val === "object" &&
    typeof (val as Record<string, unknown>).clone === "function" &&
    typeof (val as Record<string, unknown>).hour === "function" &&
    typeof (val as Record<string, unknown>).toDate === "function"
  );
}

/** 将外部值统一转为 Date */
function toDate(val: unknown): Date | undefined {
  if (!val) {
    return undefined;
  }
  if (val instanceof Date) {
    return val;
  }
  if (isMomentLike(val)) {
    return val.toDate();
  }
  return undefined;
}

/**
 * 根据选中的 Date 构造输出值，保持与原始 value 相同的类型。
 * - 原始值是 moment → 返回 moment
 * - 原始值是 Date → 返回 Date
 * - 无原始值但有 createValue → 用工厂创建
 * - fallback → 返回 Date
 */
function buildFromDate(
  selected: Date,
  originalValue: unknown,
  createValue?: () => unknown,
): unknown {
  if (isMomentLike(originalValue)) {
    return originalValue
      .clone()
      .year(selected.getFullYear())
      .month(selected.getMonth())
      .date(selected.getDate())
      .hour(selected.getHours())
      .minute(selected.getMinutes())
      .second(selected.getSeconds());
  }

  if (createValue) {
    const base = createValue();
    if (isMomentLike(base)) {
      return base
        .clone()
        .year(selected.getFullYear())
        .month(selected.getMonth())
        .date(selected.getDate())
        .hour(selected.getHours())
        .minute(selected.getMinutes())
        .second(selected.getSeconds());
    }
  }

  return new Date(selected);
}

const pad = (n: number) => String(n).padStart(2, "0");

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const SECONDS = Array.from({ length: 60 }, (_, i) => i);

/* -------------------------------------------------------------------------- */
/*                              TimeColumn 子组件                              */
/* -------------------------------------------------------------------------- */

const ITEM_HEIGHT = 28;
const COLUMN_MAX_HEIGHT = 196;
const VISIBLE_ITEMS = Math.floor(COLUMN_MAX_HEIGHT / ITEM_HEIGHT);

interface TimeColumnProps {
  items: number[];
  selected: number;
  onSelect: (v: number) => void;
  disabledItems?: number[];
}

const TimeColumn = React.memo(function TimeColumn({
  items,
  selected,
  onSelect,
  disabledItems,
}: TimeColumnProps) {
  const listRef = React.useRef<HTMLDivElement>(null);
  const isFirstScroll = React.useRef(true);

  React.useEffect(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }
    const top = selected * ITEM_HEIGHT;
    const behavior = isFirstScroll.current ? "auto" : "smooth";
    isFirstScroll.current = false;
    list.scrollTo({ top, behavior });
  }, [selected]);

  return (
    <div className="flex min-w-10 flex-col">
      <div
        ref={listRef}
        className="scrollbar-none overflow-y-auto overscroll-contain"
        style={{ maxHeight: COLUMN_MAX_HEIGHT }}
      >
        {items.map((item) => {
          const isDisabled = disabledItems?.includes(item);
          return (
            <div
              key={item}
              className={cn(
                "flex cursor-pointer items-center justify-center text-xs transition-colors select-none",
                item === selected
                  ? "bg-theme-100 text-theme-700 font-medium"
                  : "text-neutral-600 hover:bg-neutral-100",
                isDisabled && "cursor-not-allowed opacity-30",
              )}
              style={{ height: ITEM_HEIGHT }}
              onClick={() => !isDisabled && onSelect(item)}
            >
              {pad(item)}
            </div>
          );
        })}
        <div
          style={{ height: (VISIBLE_ITEMS - 1) * ITEM_HEIGHT }}
          aria-hidden
        />
      </div>
    </div>
  );
});

/* -------------------------------------------------------------------------- */
/*                                DatePicker                                  */
/* -------------------------------------------------------------------------- */

export function DatePicker({
  value,
  onChange,
  createValue,
  showTime = false,
  showSecond = true,
  showNow = true,
  disabledDate,
  disabledTime,
  placeholder,
  format: _format,
  disabled = false,
  allowClear = true,
  className,
  width,
  modal = false,
  zIndex,
  popoverPortalProps,
}: DatePickerProps) {
  const intl = useIntl();
  const [open, setOpen] = React.useState(false);

  // 将外部 value 转为内部 Date
  const externalDate = toDate(value);

  // 内部日期状态（独立管理，确认后同步给外部）
  const [internalDate, setInternalDate] = React.useState<Date | undefined>(
    externalDate,
  );
  const [hour, setHour] = React.useState(externalDate?.getHours() ?? 0);
  const [minute, setMinute] = React.useState(externalDate?.getMinutes() ?? 0);
  const [second, setSecond] = React.useState(externalDate?.getSeconds() ?? 0);

  // 外部 value 变化时同步内部状态
  React.useEffect(() => {
    const d = toDate(value);
    if (d) {
      setInternalDate(d);
      setHour(d.getHours());
      setMinute(d.getMinutes());
      setSecond(d.getSeconds());
    }
  }, [value]);

  // Popover 打开时重新同步
  React.useEffect(() => {
    if (open) {
      const d = toDate(value);
      if (d) {
        setInternalDate(d);
        setHour(d.getHours());
        setMinute(d.getMinutes());
        setSecond(d.getSeconds());
      }
    }
  }, [open]);

  // 合并日期 + 时间为完整的 Date
  const mergedDate = React.useMemo(() => {
    if (!internalDate) {
      return;
    }
    const d = new Date(internalDate);
    if (showTime) {
      d.setHours(hour, minute, showSecond ? second : 0, 0);
    }
    return d;
  }, [internalDate, hour, minute, second, showTime, showSecond]);

  // disabledTime 配置
  const disabledTimeConfig = React.useMemo(() => {
    if (!disabledTime || !mergedDate) {
      return;
    }
    return disabledTime(mergedDate);
  }, [disabledTime, mergedDate]);

  // 日历禁用适配（react-day-picker 的 disabled matcher）
  const calendarDisabled = React.useMemo(() => {
    if (!disabledDate) {
      return;
    }
    return (date: Date) => disabledDate(date);
  }, [disabledDate]);

  // 选择日期
  const handleDaySelect = React.useCallback(
    (day: Date | undefined) => {
      if (!day) {
        return;
      }
      setInternalDate(day);
      if (!showTime) {
        // 无时间选择，直接确认
        const result = new Date(day);
        result.setHours(hour, minute, showSecond ? second : 0, 0);
        onChange?.(buildFromDate(result, value, createValue));
        setOpen(false);
      }
    },
    [showTime, showSecond, hour, minute, second, onChange, value, createValue],
  );

  // 时间列选择
  const handleTimeChange = React.useCallback(
    (field: "hour" | "minute" | "second", val: number) => {
      if (field === "hour") {
        setHour(val);
      }
      if (field === "minute") {
        setMinute(val);
      }
      if (field === "second") {
        setSecond(val);
      }
    },
    [],
  );

  // 「此刻」
  const handleNow = React.useCallback(() => {
    const now = new Date();
    setInternalDate(now);
    setHour(now.getHours());
    setMinute(now.getMinutes());
    setSecond(now.getSeconds());
  }, []);

  // 「确定」（showTime 模式）
  const handleConfirm = React.useCallback(() => {
    if (!internalDate) {
      return;
    }
    const d = new Date(internalDate);
    d.setHours(hour, minute, showSecond ? second : 0, 0);
    onChange?.(buildFromDate(d, value, createValue));
    setOpen(false);
  }, [
    internalDate,
    hour,
    minute,
    second,
    showSecond,
    onChange,
    value,
    createValue,
  ]);

  // 清除
  const handleClear = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onChange?.(undefined);
    },
    [onChange],
  );

  // 显示文本
  const displayValue = React.useMemo(() => {
    const d = toDate(value);
    if (!d) {
      return "";
    }
    // 如果传入了 format 且 value 是 moment，优先用 moment.format
    if (_format && isMomentLike(value)) {
      return value.format(_format);
    }
    const datePart = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    if (!showTime) {
      return datePart;
    }
    const timePart = showSecond
      ? `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
      : `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return `${datePart} ${timePart}`;
  }, [value, showTime, showSecond, _format]);

  const resolvedPlaceholder =
    placeholder ??
    intl.formatMessage({
      id: "datePicker.placeholder",
      defaultMessage: "请选择日期",
    });

  const triggerRef = React.useRef<HTMLDivElement>(null);

  const resolvedPopoverPortalProps = React.useMemo(() => {
    if (popoverPortalProps) {
      return popoverPortalProps;
    }
    if (modal) {
      return {
        container:
          (triggerRef.current?.closest('[role="dialog"]') as HTMLElement) ??
          document.body,
      };
    }
    return;
  }, [modal, popoverPortalProps, open]);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={modal}>
      <PopoverTrigger asChild>
        <div
          ref={triggerRef}
          tabIndex={disabled ? -1 : 0}
          className={cn(
            "group/dp bg-neutral-0 relative box-border inline-flex h-8 cursor-pointer items-center rounded-xs border border-solid border-neutral-400 px-2",
            "focus-visible:ring-theme-50 focus-visible:border-theme-600 focus-visible:ring-2 focus-visible:outline-none",
            "hover:border-theme-600",
            open && "border-theme-600 ring-theme-50 ring-2",
            disabled && "pointer-events-none cursor-not-allowed opacity-50",
            className,
          )}
          style={{ width: width ?? "auto", minWidth: showTime ? 200 : 140 }}
        >
          <span
            className={cn(
              "flex-1 truncate text-sm",
              displayValue ? "text-neutral-700" : "text-neutral-400",
            )}
          >
            {displayValue || resolvedPlaceholder}
          </span>

          {allowClear && displayValue && !disabled && (
            <div
              className="mr-1 opacity-0 transition-opacity group-hover/dp:opacity-100"
              onPointerDown={handleClear}
            >
              <Icon type="close-circle-fill" className="h-3.5 w-3.5 text-neutral-400 hover:text-neutral-600" />
            </div>
          )}

          <Icon type="calendar" className="h-4 w-4 shrink-0 text-neutral-400" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="bg-neutral-0 w-auto p-0"
        align="start"
        onEscapeKeyDown={() => setOpen(false)}
        onOpenAutoFocus={(e) => e.preventDefault()}
        popoverPortalProps={resolvedPopoverPortalProps}
        {...(zIndex !== undefined ? { zIndex, disableAutoZIndex: true } : {})}
      >
        <div className={cn(showTime ? "flex flex-col" : "flex")}>
          <div className="flex">
            {/* 日历面板 */}
            <div
              className={cn(
                showTime && "border-r-solid border-r border-r-neutral-200",
              )}
            >
              <Calendar
                mode="single"
                selected={internalDate}
                onSelect={handleDaySelect}
                defaultMonth={internalDate}
                disabled={calendarDisabled}
              />
            </div>

            {/* 时间选择面板 */}
            {showTime && (
              <div
                className={cn(
                  "flex flex-col",
                  showSecond ? "w-[120px]" : "w-[80px]",
                )}
              >
                {/* 当前时间显示 */}
                <div className="border-b-solid flex h-10 items-center justify-center border-b border-b-neutral-100 text-xs font-medium text-neutral-700">
                  {showSecond
                    ? `${pad(hour)}:${pad(minute)}:${pad(second)}`
                    : `${pad(hour)}:${pad(minute)}`}
                </div>

                {/* 时 / 分 / 秒 列 */}
                <div className="flex flex-1 items-stretch">
                  <TimeColumn
                    items={HOURS}
                    selected={hour}
                    onSelect={(v) => handleTimeChange("hour", v)}
                    disabledItems={disabledTimeConfig?.disabledHours?.()}
                  />
                  <div className="w-px shrink-0 bg-neutral-200" />
                  <TimeColumn
                    items={MINUTES}
                    selected={minute}
                    onSelect={(v) => handleTimeChange("minute", v)}
                    disabledItems={disabledTimeConfig?.disabledMinutes?.()}
                  />
                  {showSecond && (
                    <>
                      <div className="w-px shrink-0 bg-neutral-200" />
                      <TimeColumn
                        items={SECONDS}
                        selected={second}
                        onSelect={(v) => handleTimeChange("second", v)}
                        disabledItems={disabledTimeConfig?.disabledSeconds?.()}
                      />
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 底部操作栏 */}
          {showTime && (
            <div
              className={cn(
                "border-t-solid flex items-center border-t border-t-neutral-200 px-2 py-1",
                showNow ? "justify-between" : "justify-end",
              )}
            >
              {showNow && (
                <Button variant="link" size="sm" onClick={handleNow}>
                  {intl.formatMessage({
                    id: "timePicker.now",
                    defaultMessage: "此刻",
                  })}
                </Button>
              )}
              <Button variant="link" size="sm" onClick={handleConfirm}>
                {intl.formatMessage({
                  id: "confirm",
                  defaultMessage: "确定",
                })}
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

DatePicker.displayName = "DatePicker";
