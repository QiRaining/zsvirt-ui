import { DialogWeakP1 } from "@zstack/zsphere-design-biz";
import React from "react";
import { useIntl } from "react-intl";

import type { ConfirmModalType } from "../types";

interface ConfirmModalProps {
  type: ConfirmModalType;
  onClose: () => void;
  onConfirmReupload: () => void;
  onProceedWithUpload?: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  type,
  onClose,
  onConfirmReupload,
}) => {
  const intl = useIntl();

  if (type === "ReuploadConfirmation") {
    return (
      <DialogWeakP1
        type="warning"
        visible={true}
        setVisible={(visible: boolean) => {
          if (!visible) onClose();
        }}
        title={intl.formatMessage({
          id: "migration.confirm.reupload.title",
          defaultMessage: "Reupload Migration Service Package?",
        })}
        description={intl.formatMessage({
          id: "migration.confirm.reupload.description",
          defaultMessage:
            "This will clear all installation package files and reset the migration service deployment process.",
        })}
        onConfirm={() => {
          onClose();
          onConfirmReupload();
        }}
      />
    );
  }

  return null;
};

export default ConfirmModal;
