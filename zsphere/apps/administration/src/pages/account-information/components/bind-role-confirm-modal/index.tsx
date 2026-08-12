import { Button } from "@zstack/design";
import { DialogWeak } from "@zstack/zsphere-design-biz";
import React, { useCallback } from "react";
import { useIntl } from "react-intl";
interface IBindRoleConfirmModalProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onOk: () => void;
  modalConfirmContent: string;
  alertMessage: string;
}

const STYLE_TEXT_ALIGN_RIGHT = { textAlign: "right" } as const;

const BindRoleConfirmModal: React.FC<IBindRoleConfirmModalProps> = ({
  visible,
  setVisible,
  alertMessage,
  modalConfirmContent,
  onOk,
}) => {
  const intl = useIntl();

  const handleConfirmClick = useCallback(() => {
    onOk();
  }, [onOk]);

  return (
    <DialogWeak
      title={alertMessage}
      type="warning"
      onConfirm={handleConfirmClick}
      visible={visible}
      setVisible={setVisible}
      description={modalConfirmContent}
      footer={
        <div style={STYLE_TEXT_ALIGN_RIGHT}>
          <Button onClick={handleConfirmClick} variant="primary">
            {intl.formatMessage({ id: "ok", defaultMessage: "OK" })}
          </Button>
        </div>
      }
    />
  );
};

export default BindRoleConfirmModal;
