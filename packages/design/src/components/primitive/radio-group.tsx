"use client";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { cn } from "@zstack/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import * as React from "react";

import { Label } from "./label";
import { Tooltip } from "./tooltip";

/**
 * 支持的值类型：string | number | boolean
 */
export type RadioValue = string | number | boolean;

/**
 * 将任意 RadioValue 转换为字符串（供 Radix 使用）
 */
function valueToString(value: RadioValue): string {
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  return String(value);
}

/**
 * 将字符串转换回原始类型
 * @param stringValue - Radix 返回的字符串值
 * @param options - 选项数组，用于推断原始类型
 */
function stringToValue<T extends RadioValue>(
  stringValue: string,
  options: RadioOptionGeneric<T>[],
): T {
  // 查找匹配的选项以确定原始类型
  const matchedOption = options.find(
    (opt) => valueToString(opt.value) === stringValue,
  );
  if (matchedOption) {
    return matchedOption.value;
  }

  // 回退：尝试推断类型
  if (stringValue === "true") {
    return true as T;
  }
  if (stringValue === "false") {
    return false as T;
  }

  const numValue = Number(stringValue);
  if (!isNaN(numValue) && stringValue !== "") {
    return numValue as T;
  }

  return stringValue as T;
}

/**
 * 泛型选项类型，支持 string | number | boolean
 */
export type RadioOptionGeneric<T extends RadioValue = string> = {
  value: T;
  label?: React.ReactNode;
  disabled?: boolean;
  checked?: boolean;
  tooltip?: React.ReactNode;
};

/**
 * 保持向后兼容的类型别名
 * @deprecated 请使用 RadioOptionGeneric<T> 以获得更好的类型支持
 */
export type RadioOption = RadioOptionGeneric<string>;

export interface RadioGroupItemProps extends React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Item
> {
  value: string;
  label?: React.ReactNode;
  disabled?: boolean;
  checked?: boolean;
  tooltip?: React.ReactNode;
  variant?: string;
}

const RadioGroupRoot = RadioGroupPrimitive.Root;

// -----------------RadioGroupItems
const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ children, className, variant = "basic", ...props }, ref) => {
  const id = React.useId();

  if (variant === "basic") {
    return (
      <div
        className="group/container flex h-5.5 items-center text-sm !text-neutral-700"
        data-disabled={props.disabled}
      >
        <RadioGroupPrimitive.Item
          ref={ref}
          id={id}
          className={cn(
            "peer !bg-neutral-0 data-[state=checked]:!border-theme-600 group-hover/container:!border-theme-600 flex aspect-square h-4 w-4 cursor-pointer items-center justify-center rounded-full !border !border-solid !border-neutral-400 focus:outline-none disabled:cursor-not-allowed disabled:!border-neutral-300 disabled:!bg-neutral-200",
            className,
          )}
          {...props}
        >
          <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
            <div className="!bg-theme-600 h-2 w-2 rounded-full data-[disabled]:!bg-neutral-400" />
          </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
        {props.label && (
          <Label
            htmlFor={id}
            data-disabled={props.disabled}
            className="cursor-pointer pl-2 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:!text-neutral-500"
          >
            {props.label}
            {children}
          </Label>
        )}
      </div>
    );
  }

  // button样式radio
  if (variant === "button") {
    return (
      <RadioGroupPrimitive.Item
        id={id}
        className={cn(
          "\ data-[state=checked]:!bg-theme-600 data-[state=checked]:!text-neutral-0 \ \ \ flex h-8 cursor-pointer items-center rounded-xs !border-0 !bg-neutral-200 px-5 py-0 text-sm !text-neutral-700 hover:!bg-neutral-300 disabled:cursor-not-allowed disabled:!bg-neutral-100 disabled:!text-neutral-500",
          className,
        )}
        ref={ref}
        {...props}
      >
        <span>
          {props.label}
          {children}
        </span>
      </RadioGroupPrimitive.Item>
    );
  }

  // outline样式radio（描边，适合详情页tab切换等轻量场景）
  if (variant === "outline") {
    return (
      <RadioGroupPrimitive.Item
        id={id}
        className={cn(
          "!bg-transparent py-0 text-sm !text-neutral-700",
          "!border !border-solid !border-neutral-400",
          "data-[state=checked]:!border-theme-600 data-[state=checked]:!text-theme-600",
          "disabled:!border-neutral-300 disabled:!text-neutral-500",
          "disabled:cursor-not-allowed",
          "flex h-8 cursor-pointer items-center px-3",
          "hover:!text-theme-600",
          "-ml-px first:ml-0",
          "first:rounded-l-sm last:rounded-r-sm",
          "relative data-[state=checked]:z-[1]",
          className,
        )}
        ref={ref}
        {...props}
      >
        <span>
          {props.label}
          {children}
        </span>
      </RadioGroupPrimitive.Item>
    );
  }
});

RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

const radioGroupVariants = cva("flex flex-wrap", {
  variants: {
    variant: {
      basic: "gap-x-5 gap-y-2",
      button: "gap-.5",
      outline: "gap-0",
    },
  },
  defaultVariants: {
    variant: "basic",
  },
});

export interface RadioGroupProps<T extends RadioValue = string>
  extends
    Omit<
      React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>,
      "value" | "defaultValue" | "onValueChange" | "onChange"
    >,
    VariantProps<typeof radioGroupVariants> {
  options: RadioOptionGeneric<T>[];
  value?: T;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  /**
   * Ant Design Form.Item 兼容：当被 Form.Item 包裹时会注入 onChange
   * 内部会自动桥接到 onValueChange
   */
  onChange?: (value: T) => void;
}

function RadioGroupInner<T extends RadioValue = string>(
  {
    className,
    options,
    variant = "basic",
    value,
    defaultValue,
    onValueChange,
    onChange,
    ...props
  }: RadioGroupProps<T>,
  ref: React.ForwardedRef<React.ElementRef<typeof RadioGroupPrimitive.Root>>,
) {
  const stringValue = value !== undefined ? valueToString(value) : undefined;
  const stringDefaultValue =
    defaultValue !== undefined ? valueToString(defaultValue) : undefined;

  const handleValueChange = React.useCallback(
    (newStringValue: string) => {
      const typedValue = stringToValue(newStringValue, options);
      onValueChange?.(typedValue);
      onChange?.(typedValue);
    },
    [onValueChange, onChange, options],
  );

  return (
    <RadioGroupRoot
      className={radioGroupVariants({ variant, className })}
      value={stringValue}
      defaultValue={stringDefaultValue}
      onValueChange={handleValueChange}
      {...props}
      ref={ref}
    >
      {options.map((item) => {
        const stringItemValue = valueToString(item.value);
        const itemProps = {
          ...item,
          value: stringItemValue,
          variant: variant!,
        };

        if (item.tooltip) {
          return (
            <Tooltip key={stringItemValue} title={item.tooltip}>
              <span className="inline-flex">
                <RadioGroupItem {...itemProps} />
              </span>
            </Tooltip>
          );
        }
        return <RadioGroupItem key={stringItemValue} {...itemProps} />;
      })}
    </RadioGroupRoot>
  );
}

const RadioGroup = React.forwardRef(RadioGroupInner) as <
  T extends RadioValue = string,
>(
  props: RadioGroupProps<T> &
    React.RefAttributes<React.ElementRef<typeof RadioGroupPrimitive.Root>>,
) => React.ReactElement;

(RadioGroup as React.FC).displayName = "RadioGroup";

export type { RadioGroupProps as RadioGroupRootProps };

export { RadioGroup, RadioGroupRoot, RadioGroupItem };
