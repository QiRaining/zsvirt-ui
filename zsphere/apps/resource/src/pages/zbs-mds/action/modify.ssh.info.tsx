import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { InputNumberField, FieldStack } from "@zstack/form";
import {
  InputField,
  InputPasswordField,
  useDialogHookFormAdapter,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  CbdMds as ICbdMds,
  UpdateCbdMdsPayload as IUpdateCbdMdsPayload,
} from "@zstack/zsphere-types/graphql";
import { Encrypt, formatResourceName } from "@zstack/zsphere-utils";
import { isEmpty } from "lodash-es";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

import {
  createModifyCbdMdsSshInfoSchema,
  type ModifyCbdMdsSshInfoFormValues,
} from "./schema";

import styles from "./style.module.less";

const updateCbdMds = gql`
  mutation updateCbdMds($input: UpdateCbdMdsInput!) {
    updateCbdMds(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<ICbdMds>> = ({
  refetch,
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const current = selectedList?.[0] || {};
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";

  const defaultValues = useMemo(() => {
    const value: ModifyCbdMdsSshInfoFormValues = {
      port: 22,
      username: "root",
      password: "",
    };
    if (!isEmpty(current)) {
      value.port = current.port ?? 22;
      value.username = current.username ?? "root";
    }
    return value;
  }, [current]);
  const formSchema = useMemo(
    () => createModifyCbdMdsSshInfoSchema(intl),
    [intl],
  );
  const form = useForm<ModifyCbdMdsSshInfoFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const onOk = async (values: ModifyCbdMdsSshInfoFormValues) => {
    const payload: IUpdateCbdMdsPayload = {
      uuid,
      addr: current?.addr ?? "",
      password: Encrypt(values.password),
      ...values,
    };

    doAction({
      mutation: updateCbdMds,
      payload,
      name: intl.formatMessage({
        id: "modify.ssh.info",
        defaultMessage: "Modify SSH Information",
      }),
      total: 1,
      onFinish: () => {
        setSelectedList?.([]);
        refetch?.();
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
        id: "modify.ssh.info",
        defaultMessage: "Modify SSH Information",
      })}
      resourceName={
        selectedList?.length ? formatResourceName(selectedList, intl) : ""
      }
    >
      <Form {...form}>
        <FieldStack>
          <InputNumberField
            form={form}
            name="port"
            label={intl.formatMessage({
              id: "sshPort",
              defaultMessage: "SSH Port",
            })}
            required
            className={styles["width-320"]}
          />
          <InputField
            form={form}
            name="username"
            label={intl.formatMessage({
              id: "username",
              defaultMessage: "Username",
            })}
            required
            className={styles["width-320"]}
          />
          <InputPasswordField
            form={form}
            name="password"
            label={intl.formatMessage({
              id: "password",
              defaultMessage: "Password",
            })}
            required
            className={styles["width-320"]}
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
