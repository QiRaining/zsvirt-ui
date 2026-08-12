"use client";

import { FormControl, FormField, FormItem, FormMessage } from "@zstack/design";
import { Input } from "@zstack/design";
import { UseFormReturn } from "react-hook-form";
import { useIntl } from "react-intl";

import { Username } from "../username";
import { DialogDeletionPasswordFormGuide } from "./hooks/types";

interface DialogPasswordFormProps {
  form: UseFormReturn<any>;
  guide?: DialogDeletionPasswordFormGuide;
}

export const DialogPasswordForm = ({
  form,
  guide,
}: DialogPasswordFormProps) => {
  const intl = useIntl();

  return (
    <>
      <div className="mb-1 text-sm text-neutral-600">
        {guide?.guideMessage ||
          intl.formatMessage(
            {
              id: "dialog.deletion.have.confirm.above.info.password.full",
              defaultMessage:
                "I confirm the above information. Enter the {loginPassword} for the current account ({username}) to confirm deletion.",
            },
            {
              username: <Username />,
              loginPassword: (
                <span className="text-danger-600 font-bold">
                  {intl.formatMessage({
                    id: "dialog.deletion.have.confirm.above.info.password",
                    defaultMessage: "Login Password",
                  })}
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
                  {...field}
                  onPaste={(e) => {
                    e.preventDefault();
                  }}
                  type="password"
                  autoComplete="off"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          );
        }}
        name="password"
      />
    </>
  );
};
