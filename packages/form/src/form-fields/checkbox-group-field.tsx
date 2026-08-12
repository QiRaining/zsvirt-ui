import {
  FormControl,
  FormHint,
  FormMessage,
  FormField,
  FormItem,
  FormLabel,
  CheckboxGroup,
  type CheckboxGroupItem,
} from "@zstack/design";
import React from "react";
import { UseFormReturn, FieldValues, Path } from "react-hook-form";

/**
 * CheckboxGroupField props interface
 * @template TFieldValues - Type of form values
 * @template TContext - Type of form context
 */
interface CheckboxGroupFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
> {
  /** Form instance from react-hook-form */
  form: UseFormReturn<TFieldValues, TContext>;
  /** Whether the field is required */
  required?: boolean;
  /** Field name in the form */
  name: Path<TFieldValues>;
  /** Label text for the checkbox group field */
  label: React.ReactNode;
  /** Optional tooltip content for the label */
  labelTooltip?: React.ReactNode;
  /** Checkbox items to display */
  items: CheckboxGroupItem[];
  /** Optional hint text displayed below the checkbox group */
  hint?: React.ReactNode;
}

/**
 * CheckboxGroupField component
 *
 * A form field component that renders a labeled checkbox group with validation support.
 * It integrates with react-hook-form for form state management and validation.
 *
 * @template TFieldValues - Type of form values
 * @template TContext - Type of form context
 * @param {CheckboxGroupFieldProps<TFieldValues, TContext>} props - Component props
 * @returns {React.ReactNode} Rendered CheckboxGroupField component
 *
 * @example
 * ```tsx
 * <CheckboxGroupField
 *   form={form}
 *   name="preferences"
 *   label="User Preferences"
 *   required={true}
 *   items={[
 *     { label: "Email notifications", value: "email" },
 *     { label: "SMS notifications", value: "sms" },
 *     { label: "Push notifications", value: "push" }
 *   ]}
 *   hint="Select your preferred notification methods"
 * />
 * ```
 */
export const CheckboxGroupField = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
>(
  props: CheckboxGroupFieldProps<TFieldValues, TContext>,
): React.ReactNode => {
  const {
    form,
    name,
    label,
    labelTooltip,
    required = false,
    items,
    hint,
  } = props;
  return (
    <FormField
      control={form.control}
      render={({ field }) => {
        return (
          <FormItem className="flex flex-row gap-2">
            <FormLabel info={labelTooltip} required={required} className="flex">
              {label}
            </FormLabel>
            <div className="flex flex-col">
              <FormControl>
                <CheckboxGroup
                  items={items}
                  value={(field.value as string[]) || []}
                  onChange={field.onChange}
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
