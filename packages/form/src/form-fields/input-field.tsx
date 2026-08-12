import {
  FormControl,
  FormField,
  FormHint,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  SmartTip,
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

/**
 * InputField props interface
 * @template TFieldValues - Type of form values
 * @template TContext - Type of form context
 */
interface InputFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
> extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "form" | "name" | "size"
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
  /** ZStack field width size. */
  size?: FieldSize;
  /** Optional className for the field row. */
  rowClassName?: string;
  /** Optional className for the label. */
  labelClassName?: string;
}

/**
 * InputField component
 *
 * A form field component that renders a labeled input with validation support.
 * It integrates with react-hook-form for form state management and validation.
 *
 * @template TFieldValues - Type of form values
 * @template TContext - Type of form context
 * @param {InputFieldProps<TFieldValues, TContext>} props - Component props
 * @returns {React.ReactElement} Rendered InputField component
 *
 * @example
 * ```tsx
 * <InputField
 *   form={form}
 *   name="username"
 *   label="Username"
 *   required={true}
 *   placeholder="Enter your username"
 *   hint="Username must be at least 3 characters"
 * />
 * ```
 */
export const InputField = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
>(
  props: InputFieldProps<TFieldValues, TContext>,
): React.ReactNode => {
  const {
    form,
    name,
    label,
    labelTooltip,
    inputTooltip,
    required = false,
    hint,
    size,
    style,
    className,
    rowClassName,
    labelClassName,
    ...rest
  } = props;
  return (
    <FormField
      control={form.control}
      render={({ field }) => {
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
            <div className="flex flex-1 flex-col">
              {inputTooltip ? (
                <SmartTip
                  content={inputTooltip}
                  popoverTriggerMode="hover"
                  infoIconMode="replace"
                >
                  <FormControl>
                    <Input
                      {...rest}
                      style={getFieldSizeStyle(className, size, style)}
                      className={cn(
                        getFieldSizeClass(className, size),
                        stripLegacySizeClass(className),
                      )}
                      data-testid={`field-input-${name}`}
                      {...field}
                    />
                  </FormControl>
                </SmartTip>
              ) : (
                <FormControl>
                  <Input
                    {...rest}
                    style={getFieldSizeStyle(className, size, style)}
                    className={cn(
                      getFieldSizeClass(className, size),
                      stripLegacySizeClass(className),
                    )}
                    data-testid={`field-input-${name}`}
                    {...field}
                  />
                </FormControl>
              )}
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
