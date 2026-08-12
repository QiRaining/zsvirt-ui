"use client";

import { Button } from "@zstack/design";
import {
  Dialog,
  DialogBanner,
  DialogBody,
  DialogContent,
  DialogDivider,
  DialogFooter,
  DialogScrollArea,
  DialogHeaderLarge,
} from "@zstack/design";
import { DialogPortal } from "@zstack/design";
import React from "react";
import { useIntl } from "react-intl";

import { DialogSelectedResource } from "./dialog-selected-resource";

export interface DialogP3Props {
  onConfirm: (arg0: any) => void;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  title: string;
  resourceDescription?: React.ReactNode;
  resourceNames: string[];
  bannerMessage?: React.ReactNode;
  cancelText?: string;
  confirmText?: string;
  zIndex?: number;
  dialogPortalProps?: React.ComponentPropsWithoutRef<typeof DialogPortal>;
}

export const DialogP3 = (props: DialogP3Props) => {
  const intl = useIntl();
  const {
    onConfirm,
    title,
    resourceNames,
    visible,
    setVisible,
    bannerMessage,
    confirmText,
    cancelText,
    zIndex,
    dialogPortalProps,
    resourceDescription,
  } = props;
  return (
    <Dialog open={visible}>
      <DialogContent
        className="w-150"
        zIndex={zIndex}
        dialogPortalProps={dialogPortalProps}
      >
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
            <DialogSelectedResource
              names={resourceNames}
              description={resourceDescription}
            />
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
              intl.formatMessage({
                id: "cancel",
                defaultMessage: "Cancel",
              })}
          </Button>
          <Button
            onClick={() => {
              setVisible(false);
              onConfirm?.({});
            }}
          >
            {confirmText ||
              intl.formatMessage({
                id: "ok",
                defaultMessage: "OK",
              })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
