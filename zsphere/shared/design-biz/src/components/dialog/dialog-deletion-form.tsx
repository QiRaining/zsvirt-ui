"use client";

import { FormControl, FormField, FormItem, FormMessage } from "@zstack/design";
import { Input } from "@zstack/design";
import { UseFormReturn } from "react-hook-form";
import { useIntl } from "react-intl";

import { DialogDeletionFormGuide } from "./hooks/types";

interface DialogDeletionFormProps {
  form: UseFormReturn<any>;
  guide?: DialogDeletionFormGuide;
}

export const DialogDeletionForm = ({
  form,
  guide,
}: DialogDeletionFormProps) => {
  const intl = useIntl();
  return (
    <>
      <div className="mb-1 text-sm text-neutral-600">
        {guide?.guideMessage ||
          intl.formatMessage(
            {
              id: "dialog.deletion.have.confirm.above.info.full",
              defaultMessage: 'I confirm the above information. Enter "{confirmWord}" to confirm deletion.',
            },
            {
              confirmWord: (
                <span className="text-danger-600 font-bold">
                  {guide?.confirmWord || "delete"}
                </span>
              ),
            },
          )}
      </div>
      <FormField
        control={form.control}
        render={({ field }) => {
          return (
            <FormItem>
              <FormControl>
                <Input
                  className="w-50"
                  placeholder={guide?.confirmWord || "delete"}
                  {...field}
                  onPaste={(e) => {
                    e.preventDefault();
                  }}
                  autoComplete="off"
                  data-testid={"delete-input"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
        name="delete"
      />
    </>
  );
};
