import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { z } from "zod";

import { DialogDeletionPasswordFormGuide } from "./types";

export const useDialogFormSchemaDeletionPassword = (
  validatePassword: (password: string) => Promise<boolean>,
  guide?: DialogDeletionPasswordFormGuide,
) => {
  const intl = useIntl();
  const formSchema = z.object({
    password: z.string().refine(
      async (v) => {
        return await validatePassword(v);
      },
      guide?.errorMessage ||
        intl.formatMessage({
          id: "please.enter.right.password",
          defaultMessage: "Enter the correct login password to confirm the deletion",
        }),
    ),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });
  return {
    formSchema,
    form,
  };
};
