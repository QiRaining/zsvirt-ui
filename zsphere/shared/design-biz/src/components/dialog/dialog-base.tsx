"use client";

import {
  Dialog,
  DialogContent,
  DialogDivider,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogScrollArea,
  DialogBody,
  DialogPortal,
  Tooltip,
} from "@zstack/design";
import { Button } from "@zstack/design";
import { Icon } from "@zstack/icon";
import React from "react";
import { useIntl } from "react-intl";

export interface DialogBaseProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onOk?: () => void;
  widthClassName?: string;
  cancelText?: string;
  confirmText?: string;
  hideCancelButton?: boolean;
  onCancel?: () => void;
  zIndex?: number;
  dialogPortalProps?: React.ComponentPropsWithoutRef<typeof DialogPortal>;
  style?: React.CSSProperties;
  /** 传递给 DialogBody 的额外样式类，用于覆盖默认 padding 等 */
  bodyClassName?: string;
  /** 资源名称（可选，显示在标题后，以竖线分隔） */
  resourceName?: string;
}

export const DialogBase: React.FC<DialogBaseProps> = (props) => {
  const {
    visible,
    setVisible,
    title,
    children,
    footer,
    onOk,
    widthClassName = "w-150",
    cancelText,
    confirmText,
    hideCancelButton = false,
    onCancel,
    zIndex,
    dialogPortalProps,
    style,
    bodyClassName,
    resourceName,
  } = props;
  const intl = useIntl();

  const handleCancel = () => {
    setVisible(false);
    onCancel?.();
  };

  const handleOk = () => {
    onOk?.();
    setVisible(false);
  };

  const defaultFooter = (
    <div className="flex gap-2">
      {!hideCancelButton && (
        <Button variant="subtle" onClick={handleCancel} type="button">
          {cancelText ||
            intl.formatMessage({ id: "cancel", defaultMessage: "Cancel" })}
        </Button>
      )}
      <Button variant="primary" onClick={handleOk} type="button">
        {confirmText ||
          intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
      </Button>
    </div>
  );

  const displayTitle = resourceName ? `${title} - ${resourceName}` : title;

  return (
    <Dialog open={visible}>
      <DialogContent
        className={widthClassName}
        zIndex={zIndex}
        dialogPortalProps={dialogPortalProps}
        style={style}
      >
        {resourceName ? (
          <DialogHeader className="h-12 justify-between">
            <DialogTitle className="flex w-full min-w-0 items-center font-normal">
              <span className="whitespace-nowrap">{title}</span>
              <span className="mx-2 h-4 w-px shrink-0 bg-neutral-300" />
              <span className="mr-6 min-w-0 flex-1 truncate text-sm font-normal text-neutral-600">
                {resourceName}
              </span>
            </DialogTitle>
            <Icon
              className="h-5 w-5 shrink-0 cursor-pointer text-neutral-700"
              onClick={() => setVisible(false)} type="close"
            />
          </DialogHeader>
        ) : (
          <DialogHeader className="h-12 justify-between gap-2">
            <Tooltip title={displayTitle}>
              <DialogTitle className="min-w-0 flex-1 truncate">
                {displayTitle}
              </DialogTitle>
            </Tooltip>
            <Icon
              className="h-5 w-5 shrink-0 cursor-pointer text-neutral-700"
              onClick={() => setVisible(false)} type="close"
            />
          </DialogHeader>
        )}
        <DialogDivider />
        <DialogScrollArea>
          <DialogBody className={bodyClassName}>{children}</DialogBody>
        </DialogScrollArea>
        {footer !== null && (
          <>
            <DialogDivider />
            <DialogFooter className="gap-2">
              {footer !== undefined ? footer : defaultFooter}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
