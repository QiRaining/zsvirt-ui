"use client";

import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogPortal,
} from "@zstack/design";
import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import React from "react";
import { useIntl } from "react-intl";

export interface DialogWeakProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  title: string;
  description?: React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  cancelText?: string;
  confirmText?: string;
  type?: "warning" | "error";
  zIndex?: number;
  dialogPortalProps?: React.ComponentPropsWithoutRef<typeof DialogPortal>;
  footer?: React.ReactNode;
}

export const DialogWeak = (props: DialogWeakProps) => {
  const {
    visible,
    setVisible,
    title,
    description,
    onConfirm,
    onCancel,
    cancelText,
    confirmText,
    type = "warning",
    zIndex,
    dialogPortalProps,
    footer,
  } = props;
  const intl = useIntl();
  return (
    <Dialog open={visible}>
      <DialogContent
        className="box-border w-100 p-5"
        zIndex={zIndex}
        dialogPortalProps={dialogPortalProps}
      >
        <DialogHeader className="h-5.5" variant="secondary">
          <Icon
            className={`mr-2 ${type === "error" ? "text-red-500" : "text-alert-500"}`} type="alert-triangle-fill"
          />
          <DialogTitle variant="weak">{title}</DialogTitle>
        </DialogHeader>
        <DialogBody variant="secondary">
          <div className="w-full">
            <div className="mb-2 text-sm leading-5.5 text-neutral-700">
              {description}
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="h-8 gap-2" variant="secondary">
          {footer || (
            <div className="flex gap-2">
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
              <Button
                variant="primary"
                type="submit"
                onClick={() => {
                  setVisible(false);
                  onConfirm();
                }}
              >
                {confirmText ||
                  intl.formatMessage({
                    id: "ok",
                    defaultMessage: "OK",
                  })}
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
