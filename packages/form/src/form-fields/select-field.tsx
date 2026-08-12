import {
  FormControl,
  FormField,
  FormHint,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SmartTip,
  SelectOptions,
} from "@zstack/design";
import { cn } from "@zstack/utils";
import React, { type CSSProperties } from "react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

import {
  type FieldSize,
  getFieldSizeClass,
  getFieldSizeStyle,
  stripLegacySizeClass,
} from "./field-size";

/**
 * SelectField props interface
 * @template TFieldValues - Type of form values
 * @template TContext - Type of form context
 */
interface SelectFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
> {
  /** Form instance from react-hook-form */
  form: UseFormReturn<TFieldValues, TContext>;
  /** Whether the field is required */
  required?: boolean;
  /** Field name in the form */
  name: Path<TFieldValues>;
  /** Label text for the select field */
  label: React.ReactNode;
  /** Optional tooltip content for the label */
  labelTooltip?: React.ReactNode;
  /** Optional tooltip content for the select */
  selectTooltip?: React.ReactNode;
  /** Placeholder text for the select */
  placeholder?: string;
  /** Optional hint text displayed below the select */
  hint?: React.ReactNode;
  /** Options for the select dropdown */
  options: SelectOptions[];
  /** Optional empty placeholder text when options is empty */
  emptyPlaceholderText?: string;
  /** Optional className for the select component */
  className?: string;
  /** Optional style for the select component */
  style?: CSSProperties;
  /** ZStack field width size. */
  size?: FieldSize;
  /** Optional className for the field row. */
  rowClassName?: string;
  /** Optional className for the label. */
  labelClassName?: string;
  /** Whether the select is disabled */
  disabled?: boolean;
  /** Whether the selected value can be cleared. */
  allowClear?: boolean;
  /** Optional props forwarded to Select portal. */
  selectPortalProps?: React.ComponentProps<typeof Select>["selectPortalProps"];
  /** Optional props forwarded to Select dropdown content. */
  selectContentProps?: React.ComponentProps<
    typeof Select
  >["selectContentProps"];
  /** Optional props forwarded to Select dropdown viewport. */
  selectViewportProps?: React.ComponentProps<
    typeof Select
  >["selectViewportProps"];
  /** Resolve a portal container from the field wrapper node. */
  getSelectPortalContainer?: (anchor: HTMLElement) => HTMLElement | null;
}

/**
 * SelectField component
 *
 * A form field component that renders a labeled select dropdown with validation support.
 * It integrates with react-hook-form for form state management and validation.
 *
 * @template TFieldValues - Type of form values
 * @template TContext - Type of form context
 * @param {SelectFieldProps<TFieldValues, TContext>} props - Component props
 * @returns {React.ReactElement} Rendered SelectField component
 *
 * @example
 * ```tsx
 * <SelectField
 *   form={form}
 *   name="country"
 *   label="Country"
 *   required={true}
 *   placeholder="Select a country"
 *   options={[
 *     { label: "United States", value: "us" },
 *     { label: "Canada", value: "ca" },
 *     { label: "United Kingdom", value: "uk" }
 *   ]}
 *   hint="Please select your country of residence"
 * />
 * ```
 */
export const SelectField = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
>(
  props: SelectFieldProps<TFieldValues, TContext>,
): React.ReactNode => {
  const {
    form,
    name,
    label,
    labelTooltip,
    selectTooltip,
    required = false,
    hint,
    className,
    style,
    size,
    rowClassName,
    labelClassName,
    options,
    placeholder,
    emptyPlaceholderText,
    disabled,
    allowClear,
    selectPortalProps,
    selectContentProps,
    selectViewportProps,
    getSelectPortalContainer,
  } = props;
  const [resolvedSelectPortalContainer, setResolvedSelectPortalContainer] =
    React.useState<HTMLElement | null>(null);
  const selectClassName = cn(
    getFieldSizeClass(className, size),
    stripLegacySizeClass(className),
  );
  const handleSelectAnchorRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (!getSelectPortalContainer) {
        return;
      }
      const nextContainer = node ? getSelectPortalContainer(node) : null;
      setResolvedSelectPortalContainer((prevContainer) =>
        prevContainer === nextContainer ? prevContainer : nextContainer,
      );
    },
    [getSelectPortalContainer],
  );
  const mergedSelectPortalProps = React.useMemo(
    () =>
      resolvedSelectPortalContainer
        ? {
            ...selectPortalProps,
            container: resolvedSelectPortalContainer,
          }
        : selectPortalProps,
    [resolvedSelectPortalContainer, selectPortalProps],
  );

  return (
    <FormField
      control={form.control}
      render={({ field }) => {
        return (
          <FormItem className={cn("flex flex-row gap-2", rowClassName)}>
            {/* select场景下单行高度32px，文字行高22px，所以设置mt-[5px]即可实现居中 */}
            <FormLabel
              info={labelTooltip}
              required={required}
              className={cn("mt-[5px] flex", labelClassName)}
            >
              {label}
            </FormLabel>
            <div
              ref={getSelectPortalContainer ? handleSelectAnchorRef : undefined}
              className="flex flex-col"
            >
              {selectTooltip ? (
                <SmartTip
                  content={selectTooltip}
                  popoverTriggerMode="hover"
                  infoIconMode="replace"
                >
                  <FormControl>
                    <Select
                      options={options}
                      placeholder={placeholder}
                      emptyPlaceholderText={emptyPlaceholderText}
                      disabled={disabled}
                      allowClear={allowClear}
                      style={getFieldSizeStyle(className, size, style)}
                      className={selectClassName}
                      data-testid={`field-select-${name}`}
                      value={field.value}
                      onValueChange={field.onChange}
                      selectPortalProps={mergedSelectPortalProps}
                      selectContentProps={selectContentProps}
                      selectViewportProps={selectViewportProps}
                    />
                  </FormControl>
                </SmartTip>
              ) : (
                <FormControl>
                  <Select
                    options={options}
                    placeholder={placeholder}
                    emptyPlaceholderText={emptyPlaceholderText}
                    disabled={disabled}
                    allowClear={allowClear}
                    style={getFieldSizeStyle(className, size, style)}
                    className={selectClassName}
                    data-testid={`field-select-${name}`}
                    value={field.value}
                    onValueChange={field.onChange}
                    selectPortalProps={mergedSelectPortalProps}
                    selectContentProps={selectContentProps}
                    selectViewportProps={selectViewportProps}
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
