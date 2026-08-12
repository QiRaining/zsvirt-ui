"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Checkbox } from "@zstack/design";
import { Button } from "@zstack/design";
import {
  Dialog,
  DialogBanner,
  DialogBody,
  DialogContent,
  DialogDivider,
  DialogFooter,
  DialogScrollArea,
  DialogPortal,
  DialogHeaderLarge,
} from "@zstack/design";
import { Form, FormField, FormItem, FormMessage } from "@zstack/design";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { z } from "zod";

import { DialogRelatedResource } from "./dialog-related-resource";
import { DialogSelectedResource } from "./dialog-selected-resource";

export interface DialogP1Props {
  onConfirm: (values: { checked: boolean }) => void;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  title: string;
  resourceNames: string[];
  resourceType?: string;
  resourceDescription?: React.ReactNode;
  bannerMessage?: React.ReactNode;
  relatedResources?: { name: string; count: number }[];
  cancelText?: string;
  confirmText?: string;
  zIndex?: number;
  dialogPortalProps?: React.ComponentPropsWithoutRef<typeof DialogPortal>;
}

export const DialogP1: React.FC<DialogP1Props> = (props) => {
  const {
    onConfirm,
    title,
    resourceNames,
    resourceType,
    resourceDescription,
    visible,
    setVisible,
    bannerMessage,
    relatedResources,
    confirmText,
    cancelText,
    zIndex,
    dialogPortalProps,
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
        className="w-150"
        zIndex={zIndex}
        dialogPortalProps={dialogPortalProps}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(_onConfirm)}>
            <DialogHeaderLarge title={title} setVisible={setVisible} />
            <DialogDivider />
            <DialogScrollArea>
              {bannerMessage && (
                <div className="px-6 pt-4">
                  <DialogBanner className="rounded-sm" variant="warning">
                    {bannerMessage}
                  </DialogBanner>
                </div>
              )}
              <DialogBody>
                <div className="w-full">
                  <div className="mb-5">
                    <DialogSelectedResource
                      names={resourceNames}
                      description={resourceDescription}
                    />
                  </div>
                  {relatedResources && resourceType && (
                    <div className="mb-2">
                      <DialogRelatedResource
                        resourceList={relatedResources}
                        resourceName={resourceType}
                      />
                    </div>
                  )}
                  <FormField
                    control={form.control}
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <label className="flex w-fit cursor-pointer items-center pl-0 text-sm text-neutral-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
            </DialogScrollArea>
            <DialogDivider />
            <DialogFooter className="gap-2">
              <Button
                variant="subtle"
                onClick={() => setVisible(false)}
                type="button"
              >
                {cancelText ||
                  intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
              </Button>
              <Button data-testid="dialog-confirm-delete" type="submit">
                {confirmText ||
                  intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
