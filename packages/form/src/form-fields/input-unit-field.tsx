import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
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

interface UnitOption {
  value: string;
  displayName: React.ReactNode;
}

export interface InputUnitValue {
  number?: string | number;
  unit?: string;
}

interface InputUnitFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
> extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "onBlur" | "name" | "form" | "ref"
> {
  form: UseFormReturn<TFieldValues, TContext>;
  name: Path<TFieldValues>;
  label?: React.ReactNode;
  labelTooltip?: React.ReactNode;
  inputTooltip?: React.ReactNode;
  required?: boolean;
  unitList?: UnitOption[];
  suffix?: React.ReactNode;
  controls?: boolean;
  max?: number;
  min?: number;
  step?: number;
  precision?: number;
  unitClassName?: string;
  rowClassName?: string;
  labelClassName?: string;
}

const getValueObject = (value: unknown): InputUnitValue => {
  if (value && typeof value === "object") {
    return value as InputUnitValue;
  }

  return {};
};

const normalizeNumericText = (text: string) => {
  const trimmed = text.trim();

  if (!trimmed) {
    return "";
  }

  if (trimmed === "-" || trimmed === "." || trimmed === "-.") {
    return trimmed;
  }

  const value = Number(trimmed);

  if (!Number.isFinite(value)) {
    return trimmed;
  }

  return trimmed;
};

const toInputText = (value: InputUnitValue["number"]) =>
  value === undefined || value === null ? "" : String(value);

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

interface InputUnitControlProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
> extends Omit<
  InputUnitFieldProps<TFieldValues, TContext>,
  | "form"
  | "name"
  | "label"
  | "labelTooltip"
  | "inputTooltip"
  | "required"
  | "rowClassName"
  | "labelClassName"
> {
  field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>;
  form: UseFormReturn<TFieldValues, TContext>;
  name: Path<TFieldValues>;
}

const InputUnitControl = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
>({
  field,
  form,
  name,
  className,
  unitList,
  unitClassName,
  suffix,
  controls = true,
  max,
  min,
  step = 1,
  precision,
  ...rest
}: InputUnitControlProps<TFieldValues, TContext>) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const valueObject = getValueObject(field.value);
  const defaultUnit = valueObject.unit ?? unitList?.[0]?.value ?? "";
  const [inputValue, setInputValue] = useState(toInputText(valueObject.number));

  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setInputValue(toInputText(getValueObject(field.value).number));
    }
  }, [field.value]);

  const setUnitValue = (number: string, unit = defaultUnit) => {
    form.setValue(
      name,
      { number: normalizeNumericText(number), unit } as PathValue<
        TFieldValues,
        typeof name
      >,
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      },
    );
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { selectionStart, selectionEnd, value } = event.target;
    const unit = getValueObject(field.value).unit ?? defaultUnit;

    setInputValue(value);
    setUnitValue(value, unit);
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
    const unit = getValueObject(field.value).unit ?? defaultUnit;
    const nextValue = getStepValue(
      inputValue,
      direction,
      step,
      min,
      max,
      precision,
    );

    inputRef.current?.focus();
    setInputValue(nextValue);
    setUnitValue(nextValue, unit);
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

  const unitOptions =
    unitList?.map((unit) => ({
      label: unit.displayName,
      value: unit.value,
    })) ?? [];

  return (
    <FormControl>
      <div className="flex h-8 items-center">
        <div
          className={cn(
            "group bg-neutral-0 relative box-border inline-block overflow-hidden rounded-xs before:box-border after:box-border",
            className || "w-[100px]",
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
            data-testid={`field-input-unit-${name}`}
            name={field.name}
            onBlur={field.onBlur}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            ref={inputRef}
            value={inputValue}
          />
        </div>
        {unitList && unitList.length > 1 ? (
          <Select
            className={cn("ml-2 w-20", unitClassName)}
            options={unitOptions}
            value={getValueObject(field.value).unit ?? defaultUnit}
            onValueChange={(unit) => {
              setUnitValue(inputValue, unit);
            }}
          />
        ) : (
          suffix
        )}
      </div>
    </FormControl>
  );
};

export const InputUnitField = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
>({
  form,
  name,
  label,
  labelTooltip,
  inputTooltip,
  required = false,
  rowClassName,
  labelClassName,
  ...rest
}: InputUnitFieldProps<TFieldValues, TContext>): React.ReactNode => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => {
      const input = (
        <InputUnitControl field={field} form={form} name={name} {...rest} />
      );

      return (
        <FormItem className={cn("flex flex-row gap-2", rowClassName)}>
          <FormLabel
            info={labelTooltip}
            required={required}
            className={cn("mt-[5px] flex", labelClassName)}
          >
            {label}
          </FormLabel>
          <div className="flex flex-col">
            {inputTooltip ? (
              <SmartTip
                content={inputTooltip}
                popoverTriggerMode="hover"
                infoIconMode="replace"
              >
                {input}
              </SmartTip>
            ) : (
              input
            )}
            <FormMessage />
          </div>
        </FormItem>
      );
    }}
  />
);
