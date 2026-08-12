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
import { CephMonType } from "@zstack/zsphere-types";
import type {
  CephMon as ICephMon,
  AddCephMonPayload as IAddCephMonPayload,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

import { createAddCephMonSchema, type AddCephMonFormValues } from "./schema";

const addCephMon = gql`
  mutation addCephMon($input: AddCephMonInput!) {
    addCephMon(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<ICephMon>> = ({
  source,
  refetch,
  visible,
  setVisible,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const defaultValues = useMemo<AddCephMonFormValues>(
    () => ({
      monIp: "",
      sshPort: "",
      userName: "",
      passWord: "",
    }),
    [],
  );
  const formSchema = useMemo(() => createAddCephMonSchema(intl), [intl]);
  const form = useForm<AddCephMonFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";

  const onOk = async ({
    monIp,
    passWord,
    sshPort,
    userName,
  }: AddCephMonFormValues) => {
    // 判断类型：如果 __typename === 'PrimaryStorageVO'，则为PrimaryStorage类型
    const type =
      source?.__typename === "PrimaryStorageVO"
        ? CephMonType.PrimaryStorage
        : CephMonType.BackupStorage;

    const payload: IAddCephMonPayload = {
      type,
      uuid,
      monUrls: [`${userName}:${passWord}@${monIp}:${sshPort}`],
    };

    doAction({
      mutation: addCephMon,
      payload,
      name: intl.formatMessage({
        id: "add.monitoringNode",
        defaultMessage: "Add Monitoring Node",
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
        id: "add.monitoringNode",
        defaultMessage: "Add Monitoring Node",
      })}
      resourceName={source?.name ?? ""}
    >
      <Form {...form}>
        <FieldStack>
          <InputField
            form={form}
            name="monIp"
            label={intl.formatMessage({
              id: "monNodeManageIP",
              defaultMessage: "Monitoring Node IP",
            })}
            required
            size="m"
          />
          <InputNumberField
            form={form}
            name="sshPort"
            label={intl.formatMessage({
              id: "sshPort",
              defaultMessage: "SSH Port",
            })}
            required
            className="width-320"
          />
          <InputField
            form={form}
            name="userName"
            label={intl.formatMessage({
              id: "username",
              defaultMessage: "Username",
            })}
            required
            size="m"
          />
          <InputPasswordField
            form={form}
            name="passWord"
            label={intl.formatMessage({
              id: "password",
              defaultMessage: "Password",
            })}
            required
            size="m"
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
