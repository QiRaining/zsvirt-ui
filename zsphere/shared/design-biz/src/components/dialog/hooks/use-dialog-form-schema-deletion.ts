import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { z } from "zod";

import { DialogDeletionFormGuide } from "./types";

export const useDialogFormSchemaDeletion = (
  guide?: DialogDeletionFormGuide,
) => {
  const intl = useIntl();
  const formSchema = useMemo(() => {
    const confirmWord = guide?.confirmWord || "delete";
    return z.object({
      delete: z.string().refine(
        (v) => v === confirmWord,
        guide?.errorMessage ||
          intl.formatMessage(
            {
              id: "please.enter.confirm.word",
              defaultMessage: "Enter {confirmWord} to continue the action.",
            },
            { confirmWord },
          ),
      ),
    });
  }, [intl, guide?.confirmWord, guide?.errorMessage]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      delete: "",
    },
  });
  return {
    formSchema,
    form,
  };
};
