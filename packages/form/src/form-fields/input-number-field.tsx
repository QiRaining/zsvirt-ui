import {
  FormControl,
  FormField,
  FormHint,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  InputNumber,
  SmartTip,
} from "@zstack/design";
import { Icon } from "@zstack/icon";
import { cn } from "@zstack/utils";
import React, { useEffect, useRef, useState } from "react";
import type {
  ControllerRenderProps,
  FieldValues,
  Path,
  PathValue,
  UseFormReturn,
} from "react-hook-form";

/**
 * InputNumberField props interface
 * @template TFieldValues - Type of form values
 * @template TContext - Type of form context
 */
interface InputNumberFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
> extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "form" | "name" | "onChange" | "value"
> {
  /** Form instance from react-hook-form */
  form: UseFormReturn<TFieldValues, TContext>;
  /** Whether the field is required */
  required?: boolean;
  /** Field name in the form */
  name: Path<TFieldValues>;
  /** Label text for the input field */
  label: React.ReactNode;
  /** Optional tooltip content for the label */
  labelTooltip?: React.ReactNode;
  /** Optional tooltip content for the input */
  inputTooltip?: React.ReactNode;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Optional hint text displayed below the input */
  hint?: React.ReactNode;
  /** Optional content displayed inline after the input control. */
  suffix?: React.ReactNode;
  /** Maximum allowed value */
  max?: number;
  /** Minimum allowed value */
  min?: number;
  /** Step value for increment/decrement */
  step?: number;
  /** Whether to show the controls (up/down buttons) */
  controls?: boolean;
  /** Decimal precision used by text-preserving step controls. */
  precision?: number;
  /** Render as the old ZSV horizontal "- input +" number control. */
  variant?: "default" | "legacy";
  /**
   * Preserve the raw text in form state. Use this for legacy numeric inputs
   * that must keep intermediate values like "0.", "0.0" or "-0.0001".
   */
  valueMode?: "number" | "string";
  /** Optional className for the field row. */
  rowClassName?: string;
  /** Optional className for the label. */
  labelClassName?: string;
}

const normalizeNumericText = (text: string) => text.trim();

const formatStepValue = (value: number, step: number, precision?: number) => {
  const digits =
    precision ??
    (step.toString().split(".")[1] || "").replace(/0+$/, "").length;

  return digits > 0 ? value.toFixed(digits) : String(value);
};

const getStepValue = (
  currentText: string,
  direction: 1 | -1,
  step: number,
  min?: number,
  max?: number,
  precision?: number,
) => {
  const trimmed = currentText.trim();
  const current = trimmed === "" ? 0 : Number(trimmed);
  const next = trimmed === "" ? direction * step : current + direction * step;

  if (!Number.isFinite(next)) {
    return currentText;
  }

  const limited = Math.min(Math.max(next, min ?? -Infinity), max ?? Infinity);

  return formatStepValue(limited, step, precision);
};

interface TextInputNumberControlProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
> extends Omit<
  InputNumberFieldProps<TFieldValues, TContext>,
  | "form"
  | "name"
  | "label"
  | "labelTooltip"
  | "inputTooltip"
  | "required"
  | "hint"
  | "suffix"
  | "valueMode"
  | "variant"
  | "rowClassName"
  | "labelClassName"
> {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  form: UseFormReturn<TFieldValues, TContext>;
  name: Path<TFieldValues>;
}

const TextInputNumberControl = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
>({
  field,
  form,
  name,
  className,
  max,
  min,
  step = 1,
  precision,
  controls = true,
  ...rest
}: TextInputNumberControlProps<TFieldValues, TContext>) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(
    field.value == null ? "" : String(field.value),
  );

  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setInputValue(field.value == null ? "" : String(field.value));
    }
  }, [field.value]);

  const syncValue = (text: string, shouldValidate = true) => {
    const normalized = normalizeNumericText(text);

    setInputValue(text);
    form.setValue(name, normalized as PathValue<TFieldValues, typeof name>, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate,
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { selectionStart, selectionEnd, value } = event.target;

    syncValue(value);
    requestAnimationFrame(() => {
      if (
        inputRef.current &&
        selectionStart !== null &&
        selectionEnd !== null
      ) {
        inputRef.current.setSelectionRange(selectionStart, selectionEnd);
      }
    });
  };

  const handleStep = (direction: 1 | -1) => {
    const nextValue = getStepValue(
      inputValue,
      direction,
      step,
      min,
      max,
      precision,
    );

    inputRef.current?.focus();
    syncValue(nextValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    rest.onKeyDown?.(event);

    if (event.defaultPrevented) {
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      handleStep(1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      handleStep(-1);
    }
  };

  return (
    <FormControl>
      <div
        className={cn(
          "group bg-neutral-0 relative box-border inline-block overflow-hidden rounded-xs before:box-border after:box-border",
          className || "w-20",
        )}
      >
        {controls && (
          <div className="!border-l-solid pointer-events-none absolute top-px right-px z-1000 m-0 flex h-[calc(100%-2px)] w-5.5 flex-col !border-0 !border-l !border-neutral-300 p-0 !opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:!opacity-100">
            <button
              aria-label="increase"
              className="!border-b-solid hover:!text-theme-600 relative block flex h-1/2 cursor-pointer items-center justify-center !border-0 !border-b !border-neutral-300 bg-transparent !text-neutral-400"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleStep(1)}
              type="button"
            >
              <Icon type="arrow-ios-up" className="h-3 w-3" />
            </button>
            <button
              aria-label="decrease"
              className="hover:!text-theme-600 relative block flex h-1/2 cursor-pointer items-center justify-center !border-0 bg-transparent !text-neutral-400"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleStep(-1)}
              type="button"
            >
              <Icon type="arrow-ios-down" className="h-3 w-3" />
            </button>
          </div>
        )}
        <Input
          {...rest}
          className={cn(
            "group-hover:border-theme-600 z-999 box-border block w-full bg-transparent",
            controls && "pr-6",
          )}
          data-testid={`field-input-number-${name}`}
          name={field.name}
          onBlur={field.onBlur}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          ref={inputRef}
          value={inputValue}
        />
      </div>
    </FormControl>
  );
};

const LegacyInputNumberControl = <
  TFieldValues extends FieldValues = FieldValues,
>({
  field,
  className,
  max = 10000,
  min = 1,
  step = 1,
  style,
  disabled,
  ...rest
}: {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  className?: string;
  max?: number;
  min?: number;
  step?: number;
} & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "form" | "name" | "onChange" | "value"
>) => {
  const currentValue = field.value === undefined ? "" : field.value;
  const currentNumber = Number(currentValue);
  const isValidNumber = Number.isFinite(currentNumber);
  const isDecreaseDisabled =
    disabled || (isValidNumber && currentNumber <= min);
  const isIncreaseDisabled =
    disabled || (isValidNumber && currentNumber >= max);

  const updateValue = (value: number | "") => {
    field.onChange(value);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    if (value === "") {
      updateValue("");
      return;
    }

    const nextValue = Number(value);

    if (Number.isFinite(nextValue)) {
      updateValue(nextValue);
    }
  };

  const decrease = () => {
    if (disabled || !isValidNumber || currentNumber <= min) {
      return;
    }

    updateValue(currentNumber - step < min ? min : currentNumber - step);
  };

  const increase = () => {
    if (disabled) {
      return;
    }

    if (!isValidNumber) {
      updateValue(min);
      return;
    }

    if (currentNumber >= max) {
      return;
    }

    updateValue(currentNumber + step > max ? max : currentNumber + step);
  };

  return (
    <FormControl>
      <div
        className={cn(
          "hover:border-theme-600 bg-neutral-0 flex h-8 w-40 items-center overflow-hidden rounded-xs border border-neutral-400",
          className,
        )}
      >
        <button
          aria-label="decrease"
          className={cn(
            "flex h-8 w-10 shrink-0 cursor-pointer items-center justify-center border-0 bg-neutral-200 text-neutral-700",
            isDecreaseDisabled && "cursor-not-allowed opacity-50",
          )}
          disabled={isDecreaseDisabled}
          onClick={decrease}
          type="button"
        >
          <Icon type="minus" className="h-3 w-3" />
        </button>
        <input
          {...rest}
          className="box-border h-8 min-w-0 flex-1 rounded-none border-0 bg-transparent px-0 text-center text-sm text-neutral-700 focus-visible:outline-none disabled:cursor-not-allowed disabled:text-neutral-500"
          data-testid={`field-input-number-${field.name}`}
          name={field.name}
          onBlur={field.onBlur}
          onChange={handleChange}
          disabled={disabled}
          style={style}
          type="text"
          value={currentValue}
        />
        <button
          aria-label="increase"
          className={cn(
            "flex h-8 w-10 shrink-0 cursor-pointer items-center justify-center border-0 bg-neutral-200 text-neutral-700",
            isIncreaseDisabled && "cursor-not-allowed opacity-50",
          )}
          disabled={isIncreaseDisabled}
          onClick={increase}
          type="button"
        >
          <Icon type="plus" className="h-3 w-3" />
        </button>
      </div>
    </FormControl>
  );
};

/**
 * InputNumberField component
 *
 * A form field component that renders a labeled number input with validation support.
 * It integrates with react-hook-form for form state management and validation.
 *
 * @template TFieldValues - Type of form values
 * @template TContext - Type of form context
 * @param {InputNumberFieldProps<TFieldValues, TContext>} props - Component props
 * @returns {React.ReactNode} Rendered InputNumberField component
 *
 * @example
 * ```tsx
 * <InputNumberField
 *   form={form}
 *   name="quantity"
 *   label="Quantity"
 *   required={true}
 *   min={1}
 *   max={100}
 *   step={1}
 *   controls={true}
 *   hint="Enter a value between 1 and 100"
 * />
 * ```
 */
export const InputNumberField = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
>(
  props: InputNumberFieldProps<TFieldValues, TContext>,
): React.ReactNode => {
  const {
    form,
    name,
    label,
    labelTooltip,
    inputTooltip,
    required = false,
    hint,
    suffix,
    className,
    max,
    min,
    step,
    controls,
    precision,
    variant = "default",
    valueMode = "number",
    rowClassName,
    labelClassName,
    ...rest
  } = props;

  return (
    <FormField
      control={form.control}
      render={({ field }) => {
        // Handle the value conversion between form value and InputNumber component
        const handleValueChange = (value: number | "") => {
          field.onChange(value);
        };
        const inputControl =
          variant === "legacy" ? (
            <LegacyInputNumberControl
              {...rest}
              className={className}
              field={field}
              max={max}
              min={min}
              step={step}
            />
          ) : valueMode === "string" ? (
            <TextInputNumberControl
              {...rest}
              className={className}
              controls={controls}
              field={field}
              form={form}
              max={max}
              min={min}
              name={name}
              precision={precision}
              step={step}
            />
          ) : (
            <FormControl>
              <InputNumber
                {...rest}
                className={cn("w-20", className)}
                data-testid={`field-input-number-${name}`}
                value={field.value === undefined ? "" : field.value}
                onValueChange={handleValueChange}
                max={max}
                min={min}
                step={step}
                controls={controls}
                onBlur={field.onBlur}
                name={field.name}
              />
            </FormControl>
          );
        const input = inputTooltip ? (
          <SmartTip
            content={inputTooltip}
            popoverTriggerMode="hover"
            infoIconMode="replace"
          >
            {inputControl}
          </SmartTip>
        ) : (
          inputControl
        );

        return (
          <FormItem className={cn("flex flex-row gap-2", rowClassName)}>
            {/* input场景下单行高度32px，文字行高22px，所以设置mt-[5px]即可实现居中 */}
            <FormLabel
              info={labelTooltip}
              required={required}
              className={cn("mt-[5px] flex", labelClassName)}
            >
              {label}
            </FormLabel>
            <div className="flex flex-col">
              <div className="flex h-8 items-center gap-2">
                {input}
                {suffix}
              </div>
              {hint && <FormHint className="mt-1">{hint}</FormHint>}
              <FormMessage />
            </div>
          </FormItem>
        );
      }}
      name={name}
    />
  );
};
