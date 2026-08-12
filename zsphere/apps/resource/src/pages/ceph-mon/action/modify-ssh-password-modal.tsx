import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  InputPasswordField,
  useDialogHookFormAdapter,
  FieldStack,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { CephMonType } from "@zstack/zsphere-types";
import type {
  CephMon as ICephMon,
  UpdateCephMonPayload as IUpdateCephMonPayload,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createModifyCephMonSshPasswordSchema,
  type ModifyCephMonSshPasswordFormValues,
} from "./schema";

import style from "./style.module.less";

const updateCephMon = gql`
  mutation updateCephMon($input: UpdateCephMonInput!) {
    updateCephMon(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<ICephMon>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const defaultValues = useMemo<ModifyCephMonSshPasswordFormValues>(
    () => ({
      password: "",
      confirmPassword: "",
    }),
    [],
  );
  const formSchema = useMemo(
    () => createModifyCephMonSshPasswordSchema(intl),
    [intl],
  );
  const form = useForm<ModifyCephMonSshPasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const onOk = async (values: ModifyCephMonSshPasswordFormValues) => {
    // 判断类型：如果有primaryStorage字段，则为PrimaryStorage类型
    const type = selectedList?.[0]?.primaryStorageUuid
      ? CephMonType.PrimaryStorage
      : CephMonType.BackupStorage;

    const payload: IUpdateCephMonPayload = {
      type,
      monUuid: selectedList?.[0]?.monUuid,
      sshPassword: values.password,
    };

    doAction({
      mutation: updateCephMon,
      payload,
      name: intl.formatMessage({
        id: "change.sshPassword",
        defaultMessage: "Modify SSH Password",
      }),
      total: 1,
      onFinish: () => {
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogForm
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      title={intl.formatMessage({
        id: "change.sshPassword",
        defaultMessage: "Modify SSH Password",
      })}
    >
      <Form {...form}>
        <FieldStack>
          <InputPasswordField
            form={form}
            name="password"
            label={intl.formatMessage({
              id: "newPassword",
              defaultMessage: "New Password",
            })}
            required
            className={style["width-320"]}
          />
          <InputPasswordField
            form={form}
            name="confirmPassword"
            label={intl.formatMessage({
              id: "confirmPassword",
              defaultMessage: "Confirm Password",
            })}
            required
            className={style["width-320"]}
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
