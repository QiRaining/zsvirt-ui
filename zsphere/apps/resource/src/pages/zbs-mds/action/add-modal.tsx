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
  AddCbdMdsPayload as IAddCbdMdsPayload,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

import { createAddCbdMdsSchema, type AddCbdMdsFormValues } from "./schema";

import styles from "./style.module.less";

const addCbdMds = gql`
  mutation addCbdMds($input: AddCbdMdsInput!) {
    addCbdMds(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<ICbdMds>> = ({
  source,
  refetch,
  visible,
  setVisible,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const defaultValues = useMemo<AddCbdMdsFormValues>(
    () => ({
      mdsIp: "",
      sshPort: "",
      username: "",
      password: "",
    }),
    [],
  );
  const formSchema = useMemo(() => createAddCbdMdsSchema(intl), [intl]);
  const form = useForm<AddCbdMdsFormValues>({
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

  const onOk = async (values: AddCbdMdsFormValues) => {
    const { mdsIp, sshPort, username, password } = values;
    const payload: IAddCbdMdsPayload = {
      uuid,
      mdsUrl: `${username}:${password}@${mdsIp}:${sshPort}`,
    };

    doAction({
      mutation: addCbdMds,
      payload,
      name: intl.formatMessage({
        id: "add.cbdMds",
        defaultMessage: "Add Mds Node",
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
        id: "add.cbdMds",
        defaultMessage: "Add Mds Node",
      })}
      resourceName={source?.name ?? ""}
    >
      <Form {...form}>
        <FieldStack>
          <InputField
            form={form}
            name="mdsIp"
            label={intl.formatMessage({
              id: "mdsNodeIp",
              defaultMessage: "MDS Node Management IP",
            })}
            required
            className={styles["width-320"]}
          />
          <InputNumberField
            form={form}
            name="sshPort"
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
