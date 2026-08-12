"use client";

import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import * as SelectPrimitive from "@radix-ui/react-select";

import * as React from "react";
import { useMemo } from "react";
import { useIntl } from "react-intl";

import { useOverlay } from "../../utils/use-overlay";

const SelectRoot = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "group bg-neutral-0 relative box-border flex h-8 w-full items-center gap-1 rounded-xs border border-solid border-neutral-400 " +
        " box-border px-3 py-1 text-sm focus-visible:outline-none [&>span]:block [&>span]:truncate " +
        " focus-visible:border-theme-600 hover:border-theme-600 cursor-pointer text-sm focus-visible:ring-2 disabled:hover:border-neutral-400 " +
        " focus-visible:ring-theme-50 data-[state=open]:border-theme-600 data-[state=open]:text-opacity-50 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-500 " +
        " data-[state=open]:ring-theme-50 data-[placeholder]:text-neutral-500 data-[state=open]:ring-2 " +
        "aria-[invalid=true]:border-danger-500 aria-[invalid=true]:focus-visible:border-danger-500 aria-[invalid=true]:focus-visible:ring-danger-50 aria-[invalid=true]:hover:border-danger-500 " +
        "aria-[invalid=true]:data-[state=open]:border-danger-500 aria-[invalid=true]:data-[state=open]:focus-visible:border-danger-500 aria-[invalid=true]:data-[state=open]:ring-danger-50",
      className,
    )}
    {...props}
  >
    <div className="flex min-w-0 flex-grow truncate">{children}</div>
    <SelectPrimitive.Icon asChild>
      <div className="flex h-full items-center">
        <Icon type="arrow-ios-down" className="text-neutral-700 group-data-[state=open]:rotate-180" />
      </div>
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <Icon type="arrow-ios-up" className="opacity-50" />
  </SelectPrimitive.ScrollUpButton>
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className,
    )}
    {...props}
  >
    <Icon type="arrow-ios-down" />
  </SelectPrimitive.ScrollDownButton>
));
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

/**
 * @interface SelectContentProps
 * @description Select内容组件的属性接口，扩展自Radix UI的Select.Content组件属性
 * @property {React.ComponentPropsWithoutRef<typeof SelectPrimitive.Portal>} [selectPortalProps] - 传递给SelectPrimitive.Portal组件的属性
 * @property {boolean} [open] - 是否打开（用于自动 z-index 管理）
 * @property {number} [zIndex] - 自定义 z-index（覆盖自动计算）
 * @property {boolean} [disableAutoZIndex] - 是否禁用自动 z-index 管理
 */
export interface SelectContentProps extends React.ComponentPropsWithoutRef<
  typeof SelectPrimitive.Content
> {
  selectPortalProps?: React.ComponentPropsWithoutRef<
    typeof SelectPrimitive.Portal
  >;
  selectViewportProps?: React.ComponentPropsWithoutRef<
    typeof SelectPrimitive.Viewport
  >;
  hideScrollButtons?: boolean;
  open?: boolean;
  zIndex?: number;
  disableAutoZIndex?: boolean;
}

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  SelectContentProps
>(
  (
    {
      className,
      children,
      position = "popper",
      selectPortalProps,
      selectViewportProps,
      hideScrollButtons = false,
      open = true,
      zIndex: customZIndex,
      disableAutoZIndex = false,
      ...props
    },
    ref,
  ) => {
    // 自动管理 z-index
    const { zIndex: autoZIndex } = useOverlay({
      type: "popover",
      open: open && !disableAutoZIndex,
      customZIndex,
    });

    // 最终使用的 z-index：优先使用自定义值，其次使用自动计算值
    const finalZIndex = customZIndex ?? (disableAutoZIndex ? 1030 : autoZIndex);

    return (
      <SelectPrimitive.Portal {...selectPortalProps}>
        <SelectPrimitive.Content
          ref={ref}
          className={cn(
            "bg-popover text-popover-foreground relative max-h-96 min-w-32 overflow-hidden rounded-xs border border-solid border-neutral-300 " +
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 box-border shadow-md " +
              "data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 " +
              "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 " +
              "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 " +
              "bg-neutral-0 py-0.5",
            position === "popper" &&
              "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 " +
                "data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
            className,
          )}
          style={{ zIndex: finalZIndex }}
          position={position}
          {...props}
        >
          {!hideScrollButtons && <SelectScrollUpButton />}
          <SelectPrimitive.Viewport
            {...selectViewportProps}
            className={cn(
              "",
              position === "popper" &&
                "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
              selectViewportProps?.className,
            )}
          >
            {children}
          </SelectPrimitive.Viewport>
          {!hideScrollButtons && <SelectScrollDownButton />}
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    );
  },
);
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("py-1.5 pr-2 pl-3 text-sm font-semibold", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative box-border cursor-default rounded-xs text-sm select-none " +
        "data-[state=checked]:bg-theme-50 cursor-pointer outline-none hover:bg-neutral-100 " +
        "max-w-120 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    {typeof children === "string" || typeof children === "number" ? (
      <div className="flex items-center justify-between gap-1 py-1.5 pr-2 pl-2 [&>span]:truncate">
        <SelectPrimitive.ItemText
          className=""
          asChild={typeof children !== "string" && typeof children !== "number"}
        >
          {children}
        </SelectPrimitive.ItemText>
        <SelectPrimitive.ItemIndicator className="flex items-center justify-center">
          <Icon type="checkmark" className="text-theme-600 min-h-4 min-w-4" />
        </SelectPrimitive.ItemIndicator>
      </div>
    ) : (
      <SelectPrimitive.ItemText
        className="px-2 py-1.5"
        asChild={typeof children !== "string" && typeof children !== "number"}
      >
        {children}
      </SelectPrimitive.ItemText>
    )}
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("bg-muted -mx-1 my-1 h-px", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

/**
 * @interface SelectEmptyPlaceholderProps
 * @description 当Select没有选项时显示的空状态占位符组件的属性接口
 * @property {string} [text] - 空状态下显示的文本，如果未提供则使用默认的"暂无数据"
 */
interface SelectEmptyPlaceholderProps {
  text?: string;
}

const SelectEmptyPlaceholder = (props: SelectEmptyPlaceholderProps) => {
  const { text } = props;
  const intl = useIntl();
  return (
    <div className="flex h-42 flex-col items-center justify-center">
      <div className="flex h-15 w-15 items-center justify-center rounded-full bg-neutral-100">
        <Icon type="inbox" className="h-6 w-6 text-neutral-300" />
      </div>
      <span className="mt-2 text-xs text-neutral-500">
        {text ||
          intl.formatMessage({
            id: "select.empty",
            defaultMessage: "暂无数据",
          })}
      </span>
    </div>
  );
};

/**
 * @interface SelectOptions
 * @description 定义Select组件的选项结构
 * @property {React.ReactNode} label - 选项在下拉列表中显示的内容
 * @property {React.ReactNode} [selectedLabel] - 选项被选中后在Select触发器中显示的内容，如果未提供则使用label
 * @property {string} value - 选项的唯一标识值
 */
export interface SelectOptions {
  label: React.ReactNode;
  selectedLabel?: React.ReactNode;
  value: string;
  disabled?: boolean;
}

/**
 * @interface SelectProps
 * @description Select组件的属性接口
 * @property {SelectOptions[]} options - 可选项数组
 * @property {string} [defaultValue] - 默认选中的值
 * @property {string} [value] - 当前选中的值（受控模式）
 * @property {(value: string) => void} onValueChange - 选中值变化时的回调函数
 * @property {string} [className] - 应用于Select触发器的自定义CSS类名
 * @property {React.CSSProperties} [style] - 应用于Select触发器的自定义内联样式
 * @property {string} [placeholder] - 未选择任何选项时显示的占位符文本
 * @property {string} [emptyPlaceholderText] - 当options为空数组时显示的文本
 * @property {boolean} [disabled] - 是否禁用Select组件
 * @property {boolean} [allowClear] - 是否允许清除已选择的值
 * @property {() => void} [onClear] - 清除值时的回调函数
 */
export interface SelectProps {
  options: SelectOptions[];
  defaultValue?: string;
  value?: string;
  onValueChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  emptyPlaceholderText?: string;
  disabled?: boolean;
  allowClear?: boolean;
  onClear?: () => void;
  selectPortalProps?: React.ComponentPropsWithoutRef<
    typeof SelectPrimitive.Portal
  >;
  selectContentProps?: Omit<
    SelectContentProps,
    "selectPortalProps" | "selectViewportProps"
  >;
  selectViewportProps?: SelectContentProps["selectViewportProps"];
}

const Select = (props: SelectProps) => {
  const {
    options,
    defaultValue,
    value,
    onValueChange,
    className,
    placeholder,
    emptyPlaceholderText,
    disabled,
    allowClear,
    onClear,
    selectPortalProps,
    selectContentProps,
    selectViewportProps,
    ...rest
  } = props;

  // 用于在清除后强制重置 Radix UI Select 内部状态
  const [clearKey, setClearKey] = React.useState(0);

  const selectedOption = useMemo(
    () => options.find((option) => value === option.value),
    [value, options],
  );

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // 先增加 key 来强制重置 Select 内部状态
    setClearKey((prev) => prev + 1);
    // 然后通知外部
    onValueChange("");
    onClear?.();
  };

  const showClearButton = allowClear && value && !disabled;

  return (
    <SelectRoot
      key={clearKey}
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={cn("group/select", className)} {...rest}>
        <SelectValue placeholder={placeholder} asChild>
          {selectedOption?.selectedLabel ? (
            <div className="truncate">{selectedOption?.selectedLabel}</div>
          ) : (
            <div className="truncate">{selectedOption?.label}</div>
          )}
        </SelectValue>
        {showClearButton && (
          <div
            className="bg-neutral-0 absolute inset-y-0 right-2 flex items-center opacity-0 transition-opacity group-hover/select:opacity-100"
            onPointerDown={handleClear}
          >
            <Icon type="close" className="h-4 w-4 text-neutral-500 hover:text-neutral-700" />
          </div>
        )}
      </SelectTrigger>
      <SelectContent
        selectPortalProps={selectPortalProps}
        selectViewportProps={selectViewportProps}
        {...selectContentProps}
      >
        {options.length > 0 ? (
          options.map(({ label, value, disabled: optionDisabled }) => (
            <SelectItem key={value} value={value} disabled={optionDisabled}>
              {label}
            </SelectItem>
          ))
        ) : (
          <SelectEmptyPlaceholder text={emptyPlaceholderText} />
        )}
      </SelectContent>
    </SelectRoot>
  );
};

export {
  Select,
  SelectRoot,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
