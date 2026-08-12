import { renderHook } from "@testing-library/react-hooks";
import type { FieldValues, UseFormReturn } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import { useDialogHookFormAdapter } from "../src";

const createForm = <TFieldValues extends FieldValues>(options: {
  values?: TFieldValues;
  errors?: Record<string, { message: string }>;
}): UseFormReturn<TFieldValues> => {
  const form = {
    handleSubmit:
      (
        onValid: (values: TFieldValues) => void,
        onInvalid: (errors: Record<string, { message: string }>) => void,
      ) =>
      async () => {
        if (options.errors) {
          onInvalid(options.errors);
          return;
        }

        onValid(options.values as TFieldValues);
      },
    reset: vi.fn(),
  };

  return form as unknown as UseFormReturn<TFieldValues>;
};

describe("useDialogHookFormAdapter", () => {
  it("returns values produced by handleSubmit so resolver transforms are preserved", async () => {
    const parsedValues = { port: 162 };
    const form = createForm({ values: parsedValues });
    const { result } = renderHook(() =>
      useDialogHookFormAdapter(form, { port: 0 }),
    );

    await expect(result.current.validateFields()).resolves.toEqual(
      parsedValues,
    );
  });

  it("throws DialogForm-compatible errorFields on validation failure", async () => {
    const form = createForm({
      errors: { port: { message: "请输入整数" } },
    });
    const { result } = renderHook(() =>
      useDialogHookFormAdapter(form, { port: 0 }),
    );

    await expect(result.current.validateFields()).rejects.toMatchObject({
      errorFields: [{ name: ["port"], errors: ["请输入整数"] }],
    });
  });
});
