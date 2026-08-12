import { ModalProps } from "antd/es/modal";

export interface IConfirmModalProps extends Omit<ModalProps, "onOk"> {
  visible: boolean;
  cancelable?: boolean;
  setVisible: (visible: boolean) => void;
  alertType?: "error" | "info" | "warning" | "success";
  alertMessage?: string | React.ReactNode;
  children?: React.ReactChild;
  needConfirm?: boolean;
  confirmMessage?: string;
  confirmMessageRequredMessage?: string;
  onOkText?: string;
  onCancelText?: string;
  onOk?: (checked?: boolean) => void;
  version?: "zsv";
  tipsTitle?: string;
  needValidate?: boolean;
  confirmType?: "checkbox" | "input";
  confirmInputText?: string;
  actionName?: string;
}
