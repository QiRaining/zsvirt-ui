import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { InputField } from "@zstack/form";
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
  createModifyCephMonSshUsernameSchema,
  type ModifyCephMonSshUsernameFormValues,
} from "./schema";

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

  const defaultValues = useMemo(() => {
    const value: ModifyCephMonSshUsernameFormValues = {
      sshUsername: "",
    };
    if (selectedList?.length) {
      value.sshUsername = selectedList[0].sshUsername ?? "";
    }
    return value;
  }, [selectedList]);
  const formSchema = useMemo(
    () => createModifyCephMonSshUsernameSchema(intl),
    [intl],
  );
  const form = useForm<ModifyCephMonSshUsernameFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const onOk = async (values: ModifyCephMonSshUsernameFormValues) => {
    // 判断类型：如果有primaryStorage字段，则为PrimaryStorage类型
    const type = selectedList?.[0]?.primaryStorageUuid
      ? CephMonType.PrimaryStorage
      : CephMonType.BackupStorage;

    const payload: IUpdateCephMonPayload = {
      type,
      monUuid: selectedList?.[0]?.monUuid,
      sshUsername: values.sshUsername,
    };

    doAction({
      mutation: updateCephMon,
      payload,
      name: intl.formatMessage({
        id: "change.sshUsername",
        defaultMessage: "Modify SSH Username",
      }),
      total: 1,
      onFinish: () => {
        setSelectedList?.([]);
      },
    });
  };

  const dialogForm = useMemo(
    () => ({
      validateFields: async () => {
        const isValid = await form.trigger();

        if (!isValid) {
          const sshUsernameError = form.getFieldState("sshUsername").error;
          throw {
            errorFields: [
              {
                name: ["sshUsername"],
                errors: sshUsernameError?.message
                  ? [sshUsernameError.message]
                  : [],
              },
            ],
          };
        }

        return form.getValues();
      },
      resetFields: () => {
        form.reset(defaultValues);
      },
    }),
    [defaultValues, form],
  );

  return (
    <DialogForm
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      title={intl.formatMessage({
        id: "change.sshUsername",
        defaultMessage: "Modify SSH Username",
      })}
    >
      <Form {...form}>
        <InputField
          form={form}
          name="sshUsername"
          label={intl.formatMessage({
            id: "sshUsername",
            defaultMessage: "SSH Username",
          })}
          required
          size="m"
        />
      </Form>
    </DialogForm>
  );
};

export default Action;
