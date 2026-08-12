import {
  FormControl,
  FormField,
  FormHint,
  FormItem,
  FormLabel,
  FormMessage,
  Switch,
  Tooltip,
} from "@zstack/design";
import { cn } from "@zstack/utils";
import React from "react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

interface SwitchFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
> extends Omit<
  React.ComponentPropsWithoutRef<typeof Switch>,
  "checked" | "defaultChecked" | "form" | "onCheckedChange" | "name"
> {
  form: UseFormReturn<TFieldValues, TContext>;
  name: Path<TFieldValues>;
  label: React.ReactNode;
  labelTooltip?: React.ReactNode;
  disabledTooltip?: React.ReactNode;
  required?: boolean;
  hint?: React.ReactNode;
  layout?: "inline" | "label-width";
  rowClassName?: string;
  labelClassName?: string;
  controlClassName?: string;
  hintClassName?: string;
}

export const SwitchField = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
>({
  form,
  name,
  label,
  labelTooltip,
  disabledTooltip,
  required = false,
  hint,
  layout = "inline",
  className,
  rowClassName,
  labelClassName,
  controlClassName,
  hintClassName,
  ...rest
}: SwitchFieldProps<TFieldValues, TContext>): React.ReactNode => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem
        className={cn(
          layout === "label-width"
            ? "grid min-h-8 grid-cols-[160px_1fr] items-start gap-x-2.5"
            : "flex min-h-8 flex-row items-center gap-2",
          rowClassName,
        )}
      >
        <FormLabel
          info={labelTooltip}
          required={required}
          onClick={(event) => {
            event.preventDefault();
          }}
          className={cn(
            "flex h-8",
            layout === "label-width" &&
              "min-h-8 items-center text-sm leading-[22px] font-normal text-neutral-600",
            labelClassName,
          )}
        >
          {label}
        </FormLabel>
        <div
          className={cn(
            "flex flex-col",
            layout === "label-width" && "min-h-8 pt-1",
            controlClassName,
          )}
        >
          <FormControl>
            <Tooltip title={rest.disabled ? disabledTooltip : null}>
              <span className="inline-block">
                <Switch
                  {...rest}
                  checked={Boolean(field.value)}
                  className={cn(className)}
                  data-testid={`field-switch-${name}`}
                  name={field.name}
                  onBlur={field.onBlur}
                  onCheckedChange={field.onChange}
                />
              </span>
            </Tooltip>
          </FormControl>
          {hint && (
            <FormHint className={cn("mt-1", hintClassName)}>{hint}</FormHint>
          )}
          <FormMessage />
        </div>
      </FormItem>
    )}
  />
);
