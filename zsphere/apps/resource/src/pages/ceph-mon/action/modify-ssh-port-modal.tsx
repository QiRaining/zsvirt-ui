import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { InputNumberField } from "@zstack/form";
import { useDialogHookFormAdapter } from "@zstack/form";
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
  createModifyCephMonSshPortSchema,
  type ModifyCephMonSshPortFormValues,
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
    const value: ModifyCephMonSshPortFormValues = {
      sshPort: 0,
    };
    if (selectedList?.length) {
      value.sshPort = selectedList[0].sshPort ?? 0;
    }
    return value;
  }, [selectedList]);
  const formSchema = useMemo(
    () => createModifyCephMonSshPortSchema(intl),
    [intl],
  );
  const form = useForm<ModifyCephMonSshPortFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const onOk = async (values: ModifyCephMonSshPortFormValues) => {
    // 判断类型：如果有primaryStorage字段，则为PrimaryStorage类型
    const type = selectedList?.[0]?.primaryStorageUuid
      ? CephMonType.PrimaryStorage
      : CephMonType.BackupStorage;

    const payload: IUpdateCephMonPayload = {
      type,
      monUuid: selectedList?.[0]?.monUuid,
      sshPort: Number(values.sshPort),
    };

    doAction({
      mutation: updateCephMon,
      payload,
      name: intl.formatMessage({
        id: "change.sshPort",
        defaultMessage: "Edit SSH Port",
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
        id: "change.sshPort",
        defaultMessage: "Edit SSH Port",
      })}
    >
      <Form {...form}>
        <InputNumberField
          form={form}
          name="sshPort"
          label={intl.formatMessage({
            id: "sshPort",
            defaultMessage: "SSH Port",
          })}
          required
          min={1}
          max={65535}
          className="width-320"
        />
      </Form>
    </DialogForm>
  );
};

export default Action;
