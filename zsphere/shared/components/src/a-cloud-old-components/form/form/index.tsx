import { Form as AntdForm } from "antd";
import { FormInstance } from "antd/lib/form";
import FormProvider, {
  FormContextProps as IOrignFormContextProps,
} from "rc-field-form/es/FormContext";
import React, { useContext, useMemo } from "react";

import { FormContext, FormContextProps } from "../context";
import type { AntdFormLayout, IFormProps } from "./type";

function isAntdFormLayout(layout: any): layout is AntdFormLayout {
  return ["horizontal", "inline", "vertical"].includes(layout);
}

// 用于隔离创建页弹窗中的表单，防止其触发 Create 组件中的，onFormChange，onFormFinish
const originFormContextValue: IOrignFormContextProps = {
  triggerFormChange: () => {},
  triggerFormFinish: () => {},
  registerForm: () => {},
  unregisterForm: () => {},
};

const InternalForm: React.ForwardRefRenderFunction<FormInstance, IFormProps> = (
  props,
  ref,
) => {
  const {
    layout = "custom",
    colon = false,
    hideRequiredMark = false,
    labelAlign = "left",
    resource,
    ...rest
  } = props;

  const { leval } = useContext(FormContext);
  const formContextValue = useMemo<FormContextProps>(
    () => ({
      isCustom: layout === "custom",
      colon,
      hideRequiredMark,
      resource,
      leval: leval + 1,
      form: rest?.form,
    }),
    [layout, colon, hideRequiredMark, resource, leval],
  );

  const customForm = useMemo(() => {
    const node = (
      <AntdForm
        {...(rest as any)}
        ref={ref}
        layout="horizontal"
        colon={false}
        requiredMark={false}
        labelAlign={labelAlign}
      />
    );

    if (leval === 0) {
      return node;
    }

    // 用于隔离创建页弹窗中的表单，防止其触发 Create 组件中的，onFormChange，onFormFinish
    return (
      <FormProvider.Provider value={originFormContextValue}>
        {node}
      </FormProvider.Provider>
    );
  }, [labelAlign, leval, ref, rest]);

  return (
    <FormContext.Provider value={formContextValue}>
      {isAntdFormLayout(layout) ? (
        <AntdForm ref={ref} {...(rest as any)} />
      ) : (
        customForm
      )}
    </FormContext.Provider>
  );
};

const Form = React.forwardRef<FormInstance, IFormProps>(InternalForm);

Form.displayName = "Form";

export default Form;
export type { IFormProps };
