"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  FormItem,
  FormMessage,
  FormField,
  Form,
  Checkbox,
} from "@zstack/design";
import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { z } from "zod";

export interface DialogWeakP1Props {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  title: string;
  description?: React.ReactNode;
  onConfirm: (values: { checked: boolean }) => void;
  cancelText?: string;
  confirmText?: string;
  type?: "warning" | "error";
  zIndex?: number;
  dialogPortalProps?: React.ComponentPropsWithoutRef<typeof DialogPortal>;
  footer?: React.ReactNode;
  onCancel?: () => void;
}

export const DialogWeakP1 = (props: DialogWeakP1Props) => {
  const {
    visible,
    setVisible,
    title,
    description,
    onConfirm,
    cancelText,
    onCancel,
    confirmText,
    type = "warning",
    zIndex,
    dialogPortalProps,
    footer,
  } = props;
  const intl = useIntl();

  const formSchema = useMemo(() => {
    return z.object({
      checked: z.boolean().refine(
        (v) => v,
        intl.formatMessage({
          id: "please.check.to.confirm.delete",
          defaultMessage: "Acknowledge the risk.",
        }),
      ),
    });
  }, [intl]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      checked: false,
    },
  });

  useEffect(() => {
    if (visible) {
      form.reset({ checked: false });
    }
  }, [form, visible]);

  const _onConfirm = (values: z.infer<typeof formSchema>) => {
    setVisible(false);
    onConfirm?.(values);
  };

  return (
    <Dialog open={visible}>
      <DialogContent
        className="box-border w-100 p-5"
        zIndex={zIndex}
        dialogPortalProps={dialogPortalProps}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(_onConfirm)}>
            <DialogHeader className="h-5.5" variant="secondary">
              <Icon
                className={`mr-2 ${type === "error" ? "text-red-500" : "text-alert-500"}`} type="alert-triangle-fill"
              />
              <DialogTitle variant="weak">{title}</DialogTitle>
            </DialogHeader>
            <DialogBody variant="secondary">
              <div className="w-full">
                <div className="mb-2 text-sm text-neutral-700">
                  {description}
                </div>
                <FormField
                  control={form.control}
                  render={({ field }) => {
                    return (
                      <FormItem>
                        <label className="flex w-fit cursor-pointer items-center text-xs text-neutral-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="delete-checkbox"
                          />
                          <span className="pl-2.5">
                            {intl.formatMessage({
                              id: "i.have.acknowledged.above.risk",
                              defaultMessage: "I acknowledge",
                            })}
                          </span>
                        </label>
                        <FormMessage className="ml-7" />
                      </FormItem>
                    );
                  }}
                  name="checked"
                />
              </div>
            </DialogBody>
            <DialogFooter className="h-8 gap-2" variant="secondary">
              {footer || (
                <>
                  <Button
                    variant="subtle"
                    onClick={() => {
                      setVisible(false);
                      onCancel?.();
                    }}
                    type="button"
                  >
                    {cancelText ||
                      intl.formatMessage({
                        id: "cancel",
                        defaultMessage: "Cancel",
                      })}
                  </Button>
                  <Button variant="primary" type="submit">
                    {confirmText ||
                      intl.formatMessage({
                        id: "ok",
                        defaultMessage: "OK",
                      })}
                  </Button>
                </>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
