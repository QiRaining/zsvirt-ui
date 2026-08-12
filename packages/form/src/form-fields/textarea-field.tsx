import {
  FormControl,
  FormField,
  FormHint,
  FormItem,
  FormLabel,
  FormMessage,
  SmartTip,
  Textarea,
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
 * TextareaField props interface
 * @template TFieldValues - Type of form values
 * @template TContext - Type of form context
 */
interface TextareaFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
> extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "form" | "name"
> {
  /** Form instance from react-hook-form */
  form: UseFormReturn<TFieldValues, TContext>;
  /** Whether the field is required */
  required?: boolean;
  /** Field name in the form */
  name: Path<TFieldValues>;
  /** Label text for the textarea field */
  label: React.ReactNode;
  /** Optional tooltip content for the label */
  labelTooltip?: React.ReactNode;
  /** Optional tooltip content for the textarea */
  textareaTooltip?: React.ReactNode;
  /** Placeholder text for the textarea */
  placeholder?: string;
  /** Optional hint text displayed below the textarea */
  hint?: React.ReactNode;
  /** Whether to show character count */
  showCount?: boolean;
  /** Character count limit. Keeps old ZSV isShowLimit/limit behavior. */
  limit?: number;
  /** ZStack field width size. */
  size?: FieldSize;
  /** Optional className for the field row. */
  rowClassName?: string;
}

/**
 * TextareaField component
 *
 * A form field component that renders a labeled textarea with validation support.
 * It integrates with react-hook-form for form state management and validation.
 *
 * @template TFieldValues - Type of form values
 * @template TContext - Type of form context
 * @param {TextareaFieldProps<TFieldValues, TContext>} props - Component props
 * @returns {React.ReactElement} Rendered TextareaField component
 *
 * @example
 * ```tsx
 * <TextareaField
 *   form={form}
 *   name="description"
 *   label="Description"
 *   required={true}
 *   placeholder="Enter your description"
 *   hint="Description must be at least 10 characters"
 *   showCount={true}
 * />
 * ```
 */
export const TextareaField = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
>(
  props: TextareaFieldProps<TFieldValues, TContext>,
): React.ReactNode => {
  const {
    form,
    name,
    label,
    labelTooltip,
    textareaTooltip,
    required = false,
    hint,
    limit,
    className,
    maxLength,
    showCount = true,
    size,
    style,
    rowClassName,
    ...rest
  } = props;
  return (
    <FormField
      control={form.control}
      render={({ field }) => {
        const value = String(field.value ?? "");
        const countLimit = limit ?? maxLength;

        return (
          <FormItem className={cn("flex flex-row gap-2", rowClassName)}>
            <FormLabel
              info={labelTooltip}
              required={required}
              className="mt-[5px] flex"
            >
              {label}
            </FormLabel>
            <div className="flex flex-col">
              {textareaTooltip ? (
                <SmartTip
                  content={textareaTooltip}
                  popoverTriggerMode="hover"
                  infoIconMode="replace"
                >
                  <FormControl>
                    <Textarea
                      {...rest}
                      {...field}
                      style={getFieldSizeStyle(className, size, style)}
                      className={cn(
                        getFieldSizeClass(className, size),
                        stripLegacySizeClass(className),
                      )}
                      data-testid={`field-textarea-${name}`}
                      showCount={false}
                      value={value}
                    />
                  </FormControl>
                </SmartTip>
              ) : (
                <FormControl>
                  <Textarea
                    {...rest}
                    {...field}
                    style={getFieldSizeStyle(className, size, style)}
                    className={cn(
                      getFieldSizeClass(className, size),
                      stripLegacySizeClass(className),
                    )}
                    data-testid={`field-textarea-${name}`}
                    showCount={false}
                    value={value}
                  />
                </FormControl>
              )}
              {showCount && countLimit ? (
                <div className="mt-1 flex justify-start text-xs leading-4 text-neutral-500">
                  {value.length}/{countLimit}
                </div>
              ) : null}
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
