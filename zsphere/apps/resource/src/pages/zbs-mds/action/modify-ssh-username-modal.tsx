import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { InputField, useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { MdsConfigType } from "@zstack/zsphere-types";
import type {
  CbdMds as ICbdMds,
  UpdateCbdMdsPayload as IUpdateCbdMdsPayload,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

import {
  createModifyCbdMdsSshUsernameSchema,
  type ModifyCbdMdsSshUsernameFormValues,
} from "./schema";

const updateCbdMds = gql`
  mutation updateCbdMds($input: UpdateCbdMdsInput!) {
    updateCbdMds(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<ICbdMds>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
  refetch,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const defaultValues = useMemo(() => {
    const value: ModifyCbdMdsSshUsernameFormValues = {
      sshUsername: "",
    };
    if (selectedList?.length) {
      value.sshUsername = selectedList[0].username ?? "";
    }
    return value;
  }, [selectedList]);
  const formSchema = useMemo(
    () => createModifyCbdMdsSshUsernameSchema(intl),
    [intl],
  );
  const form = useForm<ModifyCbdMdsSshUsernameFormValues>({
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

  const onOk = async (values: ModifyCbdMdsSshUsernameFormValues) => {
    const payload: IUpdateCbdMdsPayload[] = selectedList?.map((item) => {
      return {
        uuid,
        configType: MdsConfigType.SSH_USERNAME,
        newConfigValue: values.sshUsername,
        mdsAddr: item.addr as string,
      };
    });

    doAction({
      mutation: updateCbdMds,
      payload,
      name: intl.formatMessage({
        id: "change.sshUsername",
        defaultMessage: "Modify SSH Username",
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
