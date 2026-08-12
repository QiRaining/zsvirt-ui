import { Form as AntdForm, FormInstance } from "antd";
import React from "react";

import { FormContext } from "./context";
import InternalForm from "./form";
import Item from "./form-item";
import { isSelectParams } from "./form-item/set-params";
import Tooltip from "./form-item/tooltip";
import { StackGlobalParamType } from "./form-item/type";

export type { IFormProps } from "./form";
export type { IFormItemProps, IStackGlobalParam } from "./form-item";

type InternalFormOmitted = Omit<typeof AntdForm, "Item"> & typeof InternalForm;

interface IForm extends InternalFormOmitted {
  Item: typeof Item;
  Tooltip: typeof Tooltip;
  isSelectParams: typeof isSelectParams;
  StackGlobalParamType: typeof StackGlobalParamType;
  useFormInstance: () => FormInstance<any>;
  useWatch: typeof AntdForm.useWatch;
}

const Form: IForm = InternalForm as unknown as IForm;

const useForm = () => {
  const [formRef]: FormInstance[] = AntdForm.useForm();
  return [formRef];
};

// https://github.com/ant-design/ant-design/blob/8ebb36a0ced18b6c8f0d7091a9834263281a7d98/components/form/hooks/useFormInstance.ts
const useFormInstance = (): FormInstance<any> => {
  const { form } = React.useContext(FormContext);
  return form as FormInstance<any>;
};

Form.Item = Item;
Form.Tooltip = Tooltip;
Form.List = AntdForm.List;
Form.useForm = useForm as typeof AntdForm.useForm;
Form.useFormInstance = useFormInstance;
Form.useWatch = AntdForm.useWatch;
Form.Provider = AntdForm.Provider;
Form.isSelectParams = isSelectParams;
Form.StackGlobalParamType = StackGlobalParamType;

export default Form;
