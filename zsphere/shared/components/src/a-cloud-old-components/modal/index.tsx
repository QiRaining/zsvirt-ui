import Action, { ConfirmModal as ValidateModal } from "./action";
import { useNotSupportedAction } from "./action/hooks";
import Base from "./base";
import Confirm from "./confirm";
import Form from "./form";
import { useValidatePassword } from "./hooks";
import Result, { renderResult } from "./result";
import BaseResult from "./result/base";
import type { IModalRef } from "./type";

import "./style.less";

export default {
  Base,
  Action,
  Form,
  Confirm,
  Result,
  renderResult,
  BaseResult,
  ValidateModal,
  useNotSupportedAction,
};
export { useValidatePassword };
export type { IModalRef };
