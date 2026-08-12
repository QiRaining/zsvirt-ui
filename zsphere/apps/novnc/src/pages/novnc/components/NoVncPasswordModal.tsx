import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { InputPasswordField, useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import NoVncContext, { PasswordState } from "../context";
import {
  createNoVncPasswordSchema,
  type NoVncPasswordFormValues,
} from "./schema";

import style from "./style.module.less";

const defaultValues: NoVncPasswordFormValues = {
  novncpassword: "",
};

const NoVncPasswordModal: React.FC = () => {
  const { store, setStore } = React.useContext(NoVncContext);

  const intl = useIntl();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hadSubmit, setHadSubmit] = useState(false);
  const formSchema = useMemo(() => createNoVncPasswordSchema(intl), [intl]);
  const form = useForm<NoVncPasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  const onOk = async (values: NoVncPasswordFormValues) => {
    setHadSubmit(false);

    try {
      setHadSubmit(true);
      setLoading(true);
      store?.rfbControl?.sendCredentials(values.novncpassword);

      setStore?.((pre) => ({
        ...pre,
        passwordState: PasswordState.changed,
      }));
    } catch (__e) {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(false);
    if (store?.passwordState === PasswordState.wrong) {
      setVisible(true);
    } else if (store?.passwordState === PasswordState.right) {
      setVisible(false);
    }
  }, [store?.passwordState, store?.connectState]);

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [visible, form]);

  const extra = useMemo(() => {
    if (hadSubmit && store?.passwordState === PasswordState.wrong) {
      return (
        <div className={style.extra}>
          {intl.formatMessage({
            id: "console.password.failed",
            defaultMessage: "Incorrect console password.",
          })}
        </div>
      );
    }
  }, [store?.passwordState, intl, hadSubmit]);

  return (
    <DialogForm
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      form={dialogForm}
      confirmLoading={loading}
      title={intl.formatMessage({
        id: "input.novnc.password",
        defaultMessage: "Enter Console Password",
      })}
    >
      <Form {...form}>
        <InputPasswordField
          form={form}
          name="novncpassword"
          label={intl.formatMessage({
            id: "console.password",
            defaultMessage: "Console Password",
          })}
          required
          size="m"
          hint={extra}
        />
      </Form>
    </DialogForm>
  );
};

export default NoVncPasswordModal;
