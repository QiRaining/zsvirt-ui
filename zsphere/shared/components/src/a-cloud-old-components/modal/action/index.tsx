import { ModalProps } from "antd/es/modal";
import React from "react";

import ConfirmModal, { IProps as ConfirmModalProps } from "./validate-modal";
import ZsvAction from "./zsv";

export interface IResource {
  uuid: string;
  name?: string;
  [key: string]: any;
}

export interface ICheckedMap {
  [prop: string]: boolean;
}

export interface IAttachAction {
  name: string;
  tip?: string | React.ReactNode;
  callback?: any;
  disabled?: boolean;
  checked?: boolean;
  onChange?: (checked?: boolean, checkedMap?: ICheckedMap) => void;
}

export interface IAttachActionItem extends IAttachAction {
  key: string;
}

export type AlertType = "error" | "info" | "warning";

export interface IProps extends Omit<ModalProps, "onOk"> {
  /** @deprecated use title */
  name?: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  resourceName: string;
  linkedResourceName?: string;
  itemName?: string;
  onOkText?: string;
  getItemName?: (item: any) => string;
  resourceList: IResource[];
  alertType?: AlertType | AlertType[];
  alertMessage?: string | React.ReactNode | string[] | React.ReactNode[];
  customResourceList?: React.ReactNode;
  selectMessage?: string | React.ReactNode;
  linkedResourceMessage?: string;
  needConfirm?: boolean;
  confirmMessage?: string;
  confirmMessageRequredMessage?: string;
  confirmType?: "checkbox" | "input";
  confirmInputText?: string;
  actionName?: string;
  attachAction?: IAttachAction | IAttachActionItem[];
  onOk?: (checked?: boolean | ICheckedMap) => void;
  needValidate?:
    | boolean
    | ((values: any) => boolean)
    | ((values: any) => Promise<boolean>);
  validatePassword?: (password: string) => Promise<boolean>;
  hideCancelButton?: boolean;
  controlledVisible?: boolean;
  confirmModalProps?: Omit<
    ConfirmModalProps,
    "username" | "visible" | "setVisible" | "setActionModalVisible" | "onOk"
  >;
}

const Action: React.FC<IProps> = (props) => <ZsvAction {...props} />;

export { ConfirmModal, ZsvAction };

export default Action;
