import {
  FormControl,
  FormField,
  FormHint,
  FormItem,
  FormLabel,
  FormMessage,
  RadioGroup,
  type RadioGroupProps,
  type RadioOptionGeneric,
  type RadioValue,
} from "@zstack/design";
import { cn } from "@zstack/utils";
import React from "react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

/**
 * RadioGroupField props interface
 * @template TFieldValues - Type of form values
 * @template TContext - Type of form context
 */
interface RadioGroupFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TOptionValue extends RadioValue = string,
> extends Omit<
  RadioGroupProps<TOptionValue>,
  "value" | "defaultValue" | "onValueChange" | "onChange" | "options"
> {
  /** Form instance from react-hook-form */
  form: UseFormReturn<TFieldValues, TContext>;
  /** Whether the field is required */
  required?: boolean;
  /** Field name in the form */
  name: Path<TFieldValues>;
  /** Label text for the radio group field */
  label: React.ReactNode;
  /** Optional tooltip content for the label */
  labelTooltip?: React.ReactNode;
  /** Radio options to display */
  options: RadioOptionGeneric<TOptionValue>[];
  /** Optional hint text displayed below the radio group */
  hint?: React.ReactNode;
  /** Optional variant for the radio group */
  variant?: "basic" | "button";
  /** Optional className for the radio group. */
  className?: string;
  /** Optional className for the field row. */
  rowClassName?: string;
  /** Optional className for the label. */
  labelClassName?: string;
}

/**
 * RadioGroupField component
 *
 * A form field component that renders a labeled radio group with validation support.
 * It integrates with react-hook-form for form state management and validation.
 *
 * @template TFieldValues - Type of form values
 * @template TContext - Type of form context
 * @param {RadioGroupFieldProps<TFieldValues, TContext>} props - Component props
 * @returns {React.ReactNode} Rendered RadioGroupField component
 *
 * @example
 * ```tsx
 * <RadioGroupField
 *   form={form}
 *   name="preference"
 *   label="User Preference"
 *   required={true}
 *   options={[
 *     { label: "Email", value: "email" },
 *     { label: "SMS", value: "sms" },
 *     { label: "Push", value: "push" }
 *   ]}
 *   hint="Select your preferred notification method"
 *   variant="basic"
 * />
 * ```
 */
export const RadioGroupField = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TOptionValue extends RadioValue = string,
>(
  props: RadioGroupFieldProps<TFieldValues, TContext, TOptionValue>,
): React.ReactNode => {
  const {
    form,
    name,
    label,
    labelTooltip,
    required = false,
    options,
    hint,
    variant = "basic",
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
          <FormItem
            className={cn(
              "flex min-h-8 flex-row items-center gap-2",
              rowClassName,
            )}
          >
            <FormLabel
              info={labelTooltip}
              required={required}
              className={cn("flex h-8", labelClassName)}
            >
              {label}
            </FormLabel>
            <div className="flex flex-col">
              <FormControl>
                <RadioGroup
                  {...rest}
                  className={cn("min-h-8 items-center", className)}
                  options={options}
                  value={field.value}
                  onValueChange={field.onChange}
                  variant={variant}
                />
              </FormControl>
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
