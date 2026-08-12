import {
  Button,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@zstack/design";
import { FieldStack } from "@zstack/form";
import { Icon } from "@zstack/icon";
import type { ResourceAttributeKey } from "@zstack/zsphere-types/graphql";
import React from "react";
import type {
  FieldArrayPath,
  FieldValues,
  Path,
  UseFormReturn,
} from "react-hook-form";
import { useFieldArray } from "react-hook-form";
import { useIntl } from "react-intl";

import style from "./style.module.less";

export interface ResourceAttributeConstraintOption {
  value: string;
}

type ResourceAttributeConstraintValues = FieldValues & {
  options: ResourceAttributeConstraintOption[];
};

export interface IProps<
  TFieldValues extends ResourceAttributeConstraintValues,
> {
  form: UseFormReturn<TFieldValues>;
  required?: boolean;
  source?: ResourceAttributeKey;
}

export default function ConstraintFormList<
  TFieldValues extends ResourceAttributeConstraintValues,
>({ form, required }: IProps<TFieldValues>) {
  const intl = useIntl();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options" as FieldArrayPath<TFieldValues>,
  });
  const fieldErrors = form.formState.errors.options;

  return (
    <FormItem className="flex flex-row gap-2">
      <FormLabel required={required} className="mt-[5px] flex">
        {intl.formatMessage({
          id: "resource.attribute.value",
          defaultMessage: "Attribute Value",
        })}
      </FormLabel>
      <FieldStack className="flex-1" gap="xs">
        {fields.map((field, index) => (
          <FormField
            key={field.id}
            control={form.control}
            name={`options.${index}.value` as Path<TFieldValues>}
            render={({ field: inputField }) => (
              <div className={style.optionInput}>
                <FormItem className="w-80">
                  <FormControl>
                    <Input
                      {...inputField}
                      className="w-80"
                      onChange={(event) => {
                        inputField.onChange(event);
                        void form.trigger("options" as Path<TFieldValues>);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                <Button
                  type="button"
                  variant="ghost"
                  className={style.trashIcon}
                  onClick={() => remove(index)}
                >
                  <Icon type="trash" />
                </Button>
              </div>
            )}
          />
        ))}
        <Button
          type="button"
          className={style.addOptionBtn}
          variant="link"
          onClick={() => append({ value: "" } as never)}
          icon={<Icon type="plus" />}
        >
          {intl.formatMessage({
            id: "add.resource.attribute.value",
            defaultMessage: "Add Attribute Value",
          })}
        </Button>
        {fieldErrors && !Array.isArray(fieldErrors) && fieldErrors.message ? (
          <div className="text-danger-500 text-sm">{fieldErrors.message}</div>
        ) : null}
      </FieldStack>
    </FormItem>
  );
}
