"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { Form } from "@zstack/design";
import React, { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { z } from "zod";

import { DialogRelatedResource } from "./dialog-related-resource";
import { DialogSelectedResource } from "./dialog-selected-resource";

export interface DialogP2Props {
  onConfirm: (arg0: any) => void;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  title: string;
  resourceNames: string[];
  resourceType?: string;
  resourceDescription?: React.ReactNode;
  bannerMessage?: React.ReactNode;
  bannerType?: "danger" | "warning";
  relatedResources?: { name: string; count: number }[];
  cancelText?: string;
  confirmText?: string;
  zIndex?: number;
  dialogPortalProps?: React.ComponentPropsWithoutRef<typeof DialogPortal>;
}

export const DialogP2: React.FC<DialogP2Props> = (props) => {
  const {
    onConfirm,
    title,
    resourceNames,
    resourceType,
    resourceDescription,
    visible,
    setVisible,
    bannerMessage,
    bannerType = "warning",
    relatedResources,
    confirmText,
    cancelText,
    zIndex,
    dialogPortalProps,
  } = props;
  const intl = useIntl();

  const formSchema = useMemo(() => {
    return z.object({});
  }, [intl]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

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
                  <DialogBanner className="rounded-sm" variant={bannerType}>
                    {bannerMessage}
                  </DialogBanner>
                </div>
              )}
              <DialogBody>
                <div className="w-full">
                  <div>
                    <DialogSelectedResource
                      names={resourceNames}
                      description={resourceDescription}
                    />
                  </div>
                  {relatedResources && resourceType && (
                    <div className="mt-5">
                      <DialogRelatedResource
                        resourceList={relatedResources}
                        resourceName={resourceType}
                      />
                    </div>
                  )}
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
