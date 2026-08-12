import {
  FormControl,
  FormField,
  FormHint,
  FormItem,
  FormLabel,
  FormMessage,
  InputPassword,
  type InputPasswordProps,
} from "@zstack/design";
import { cn } from "@zstack/utils";
import React from "react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

import {
  type FieldSize,
  getFieldSizeClass,
  getFieldSizeStyle,
  stripLegacySizeClass,
} from "./field-size";

interface InputPasswordFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
> extends Omit<
  InputPasswordProps,
  | "value"
  | "defaultValue"
  | "onChange"
  | "onBlur"
  | "name"
  | "form"
  | "ref"
  | "size"
> {
  form: UseFormReturn<TFieldValues, TContext>;
  name: Path<TFieldValues>;
  label: React.ReactNode;
  labelTooltip?: React.ReactNode;
  required?: boolean;
  hint?: React.ReactNode;
  size?: FieldSize;
  rowClassName?: string;
  labelClassName?: string;
}

export const InputPasswordField = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
>({
  form,
  name,
  label,
  labelTooltip,
  required = false,
  hint,
  size,
  style,
  className,
  rowClassName,
  labelClassName,
  ...rest
}: InputPasswordFieldProps<TFieldValues, TContext>): React.ReactNode => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem className={cn("flex flex-row gap-2", rowClassName)}>
        <FormLabel
          info={labelTooltip}
          required={required}
          className={cn("mt-[5px] flex", labelClassName)}
        >
          {label}
        </FormLabel>
        <div className="flex flex-1 flex-col items-start">
          <FormControl>
            <InputPassword
              {...field}
              {...rest}
              style={getFieldSizeStyle(className, size, style)}
              className={cn(
                getFieldSizeClass(className, size),
                stripLegacySizeClass(className),
              )}
              autoComplete={rest.autoComplete ?? "new-password"}
              data-testid={`field-password-${name}`}
            />
          </FormControl>
          {hint && <FormHint className="mt-1">{hint}</FormHint>}
          <FormMessage />
        </div>
      </FormItem>
    )}
  />
);
