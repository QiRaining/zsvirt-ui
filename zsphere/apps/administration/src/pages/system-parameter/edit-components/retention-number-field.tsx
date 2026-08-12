import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  InputNumber,
} from "@zstack/design";
import type React from "react";
import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

interface RetentionNumberFieldProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  name: Path<TFieldValues>;
  label: React.ReactNode;
  unit?: React.ReactNode;
  unlimitedText: React.ReactNode;
  enabled: boolean;
}

export const RetentionNumberField = <TFieldValues extends FieldValues>({
  form,
  name,
  label,
  unit,
  unlimitedText,
  enabled,
}: RetentionNumberFieldProps<TFieldValues>) => {
  if (!enabled) {
    return (
      <div className="grid min-h-8 grid-cols-[160px_1fr] items-start gap-x-2.5">
        <div className="flex h-8 items-center text-sm leading-[22px] font-normal text-neutral-600">
          {label}
        </div>
        <div className="flex h-8 items-center text-sm leading-[22px] text-neutral-700">
          {unlimitedText}
        </div>
      </div>
    );
  }

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="grid min-h-8 grid-cols-[160px_1fr] items-start gap-x-2.5">
          <FormLabel
            required
            className="flex h-8 items-center text-sm leading-[22px] font-normal text-neutral-600"
          >
            {label}
          </FormLabel>
          <div className="flex flex-col">
            <div className="flex h-8 items-center gap-2">
              <FormControl>
                <InputNumber
                  className="w-20"
                  data-testid={`field-input-number-${name}`}
                  max={Number.MAX_SAFE_INTEGER}
                  min={Number.MIN_SAFE_INTEGER}
                  name={field.name}
                  onBlur={field.onBlur}
                  onValueChange={(value) => {
                    if (
                      field.value === "" &&
                      value === Number.MIN_SAFE_INTEGER
                    ) {
                      field.onChange(-1);
                      return;
                    }

                    field.onChange(value);
                  }}
                  value={field.value === undefined ? "" : field.value}
                />
              </FormControl>
              {unit && (
                <span className="text-sm leading-[22px] text-neutral-700">
                  {unit}
                </span>
              )}
            </div>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};
