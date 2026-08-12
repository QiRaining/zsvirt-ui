
import { Icon } from "@zstack/icon";
import React from "react";
import { useIntl } from "react-intl";

import { Button } from "./button";
import { Toast, ToastProvider, ToastViewport } from "./toast/toast";

interface SelectionCancellationProps {
  selectedCount: number;
  onCancel: () => void;
  open: boolean;
  viewPortClassName?: string;
}

export const SelectionCancellation: React.FC<SelectionCancellationProps> = ({
  selectedCount,
  onCancel,
  open,
  viewPortClassName,
}) => {
  const intl = useIntl();
  return (
    <ToastProvider>
      <Toast
        className="bg-neutral-0 m-0 h-8 border-blue-100 px-3 py-0 shadow-md"
        open={open}
      >
        <div className="flex items-center">
          <Icon type="info-fill" className="mr-2 text-blue-500" />
          <span className="text-sm text-neutral-700">
            {intl.formatMessage(
              {
                id: "has.selectedCount",
                defaultMessage: "已选择 {selectedCount} 项",
              },
              {
                selectedCount,
              },
            )}
          </span>
          <Button onClick={onCancel} variant="link" className="ml-1 px-0">
            {intl.formatMessage({
              id: "cancel.selection",
              defaultMessage: "取消选择",
            })}
          </Button>
        </div>
      </Toast>
      <ToastViewport position="absolute" className={viewPortClassName} />
    </ToastProvider>
  );
};
