import {
  Checkbox,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  InputNumber,
} from "@zstack/design";
import React from "react";
import { Controller, type UseFormReturn } from "react-hook-form";

import type { PasswordRangeFormValues } from "./schema";

const FIELD_ROW_CLASS =
  "grid min-h-8 grid-cols-[160px_auto] items-start gap-x-2.5";

const FormCheckbox = React.forwardRef<
  HTMLButtonElement,
  {
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    label?: React.ReactNode;
    disabled?: boolean;
    className?: string;
  }
>(({ checked, onChange, label, ...rest }, ref) => {
  const id = React.useId();
  return (
    <div className="flex h-8 items-center">
      <Checkbox
        ref={ref}
        id={id}
        checked={checked}
        onCheckedChange={(val) => onChange?.(val === true)}
        {...rest}
      />
      {label && (
        <label
          htmlFor={id}
          className="cursor-pointer pl-2 text-sm !text-neutral-700"
        >
          {label}
        </label>
      )}
    </div>
  );
});

FormCheckbox.displayName = "FormCheckbox";

interface PasswordRangeFieldsProps {
  form: UseFormReturn<PasswordRangeFormValues>;
  label: React.ReactNode;
  checkboxLabel: React.ReactNode;
  min: number;
  max: number;
}

export const PasswordRangeFields: React.FC<PasswordRangeFieldsProps> = ({
  form,
  label,
  checkboxLabel,
  min,
  max,
}) => {
  return (
    <>
      <div className={FIELD_ROW_CLASS}>
        <span className="flex h-8 items-center text-sm text-neutral-600">
          {label}
          <span className="ml-1 text-red-500">*</span>
        </span>
        <div className="flex items-start gap-2">
          <FormField
            control={form.control}
            name="minimum"
            render={({ field }) => (
              <FormItem className="w-20">
                <FormControl>
                  <InputNumber
                    className="w-20"
                    max={max}
                    min={min}
                    name={field.name}
                    onBlur={field.onBlur}
                    onValueChange={field.onChange}
                    value={field.value as number | ""}
                  />
                </FormControl>
                <FormMessage className="mt-1 whitespace-nowrap" />
              </FormItem>
            )}
          />
          <span className="leading-8 text-neutral-700">-</span>
          <FormField
            control={form.control}
            name="maximum"
            render={({ field }) => (
              <FormItem className="w-20">
                <FormControl>
                  <InputNumber
                    className="w-20"
                    max={max}
                    min={min}
                    name={field.name}
                    onBlur={field.onBlur}
                    onValueChange={field.onChange}
                    value={field.value as number | ""}
                  />
                </FormControl>
                <FormMessage className="mt-1 whitespace-nowrap" />
              </FormItem>
            )}
          />
        </div>
      </div>
      <Controller
        control={form.control}
        name="checkOther"
        render={({ field }) => (
          <div className={FIELD_ROW_CLASS}>
            <span />
            <FormCheckbox
              checked={field.value}
              onChange={field.onChange}
              label={checkboxLabel}
            />
          </div>
        )}
      />
    </>
  );
};
