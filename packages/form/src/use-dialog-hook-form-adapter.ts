import { useMemo } from "react";
import { FieldErrors, FieldValues, UseFormReturn } from "react-hook-form";

interface DialogValidationError extends Error {
  errorFields: { name: (string | number)[]; errors: string[] }[];
}

const flattenFieldErrors = (
  errors: FieldErrors,
  path: (string | number)[] = [],
): { name: (string | number)[]; errors: string[] }[] =>
  Object.entries(errors).flatMap(([key, error]) => {
    const currentPath = [...path, key];

    if (!error || typeof error !== "object") {
      return [];
    }

    const message =
      "message" in error && typeof error.message === "string"
        ? error.message
        : undefined;
    const children = Object.entries(error).reduce<FieldErrors>(
      (result, [childKey, childValue]) => {
        if (
          childKey !== "type" &&
          childKey !== "types" &&
          childKey !== "message" &&
          childKey !== "ref" &&
          childValue &&
          typeof childValue === "object"
        ) {
          result[childKey] = childValue as FieldErrors[string];
        }

        return result;
      },
      {},
    );

    return [
      ...(message ? [{ name: currentPath, errors: [message] }] : []),
      ...flattenFieldErrors(children, currentPath),
    ];
  });

const createDialogValidationError = (
  errorFields: DialogValidationError["errorFields"],
): DialogValidationError => {
  const error = new Error("Form validation failed") as DialogValidationError;
  error.errorFields = errorFields;

  return error;
};

export const useDialogHookFormAdapter = <TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  defaultValues: TFieldValues,
) =>
  useMemo(
    () => ({
      validateFields: async () => {
        return new Promise<TFieldValues>((resolve, reject) => {
          const submit = form.handleSubmit(resolve, (errors) => {
            reject(createDialogValidationError(flattenFieldErrors(errors)));
          });

          submit().catch(reject);
        });
      },
      resetFields: () => {
        form.reset(defaultValues);
      },
    }),
    [defaultValues, form],
  );
