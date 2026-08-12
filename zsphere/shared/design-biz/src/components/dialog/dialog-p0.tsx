"use client";

import { Button } from "@zstack/design";
import {
  Dialog,
  DialogBanner,
  DialogBody,
  DialogContent,
  DialogDivider,
  DialogFooter,
  DialogPortal,
  DialogScrollArea,
  DialogHeaderLarge,
} from "@zstack/design";
import { Form } from "@zstack/design";
import React from "react";
import { useIntl } from "react-intl";
import { z } from "zod";

import { DialogDeletionForm } from "./dialog-deletion-form";
import { DialogRelatedResource } from "./dialog-related-resource";
import { DialogSelectedResource } from "./dialog-selected-resource";
import { DialogDeletionFormGuide } from "./hooks/types";
import { useDialogFormSchemaDeletion } from "./hooks/use-dialog-form-schema-deletion";

export interface DialogP0Props {
  onConfirm: (arg0: any) => void;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  title: string;
  resourceNames: string[];
  resourceDescription?: React.ReactNode;
  resourceType?: string;
  bannerMessage: string | React.ReactNode;
  relatedResources?: { name: string; count: number }[];
  cancelText?: string;
  confirmText?: string;
  guide?: DialogDeletionFormGuide;
  zIndex?: number;
  dialogPortalProps?: React.ComponentPropsWithoutRef<typeof DialogPortal>;
}

export const DialogP0 = (props: DialogP0Props) => {
  const {
    onConfirm,
    title,
    resourceNames,
    resourceDescription,
    resourceType,
    visible,
    setVisible,
    bannerMessage,
    relatedResources,
    confirmText,
    cancelText,
    guide,
    zIndex,
    dialogPortalProps,
  } = props;
  const intl = useIntl();
  const { form, formSchema } = useDialogFormSchemaDeletion(guide);
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
              <div className="px-6 pt-4">
                <DialogBanner className="rounded-sm">
                  {bannerMessage}
                </DialogBanner>
              </div>
              <DialogBody>
                <div className="w-full">
                  {(resourceNames.length > 0 || resourceDescription) && (
                    <div className="mb-5">
                      <DialogSelectedResource
                        names={resourceNames}
                        description={resourceDescription}
                      />
                    </div>
                  )}
                  {relatedResources && resourceType && (
                    <div className="mb-2">
                      <DialogRelatedResource
                        resourceList={relatedResources}
                        resourceName={resourceType}
                      />
                    </div>
                  )}
                  <DialogDeletionForm form={form} guide={guide} />
                </div>
              </DialogBody>
            </DialogScrollArea>
            <DialogDivider />
            <DialogFooter className="gap-2">
              <Button
                variant="subtle"
                type="button"
                onClick={() => setVisible(false)}
              >
                {cancelText ||
                  intl.formatMessage({
                    id: "cancel",
                    defaultMessage: "Cancel",
                  })}
              </Button>
              <Button
                variant="danger"
                type="submit"
                data-testid="dialog-confirm-delete"
              >
                {confirmText ||
                  intl.formatMessage({
                    id: "confirm.delete.new",
                    defaultMessage: "Confirm to Delete",
                  })}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
