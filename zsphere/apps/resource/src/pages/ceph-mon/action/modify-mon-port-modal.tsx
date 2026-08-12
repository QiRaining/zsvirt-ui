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
  createModifyCephMonPortSchema,
  type ModifyCephMonPortFormValues,
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

  const defaultValues = useMemo(() => {
    const value: ModifyCephMonPortFormValues = {
      monPort: 0,
    };
    if (selectedList?.length) {
      value.monPort = Number(selectedList[0].monPort) || 0;
    }
    return value;
  }, [selectedList]);
  const formSchema = useMemo(() => createModifyCephMonPortSchema(intl), [intl]);
  const form = useForm<ModifyCephMonPortFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const onOk = async (values: ModifyCephMonPortFormValues) => {
    // 判断类型：如果有primaryStorage字段，则为PrimaryStorage类型
    const type = selectedList?.[0]?.primaryStorageUuid
      ? CephMonType.PrimaryStorage
      : CephMonType.BackupStorage;

    const payload: IUpdateCephMonPayload = {
      type,
      monUuid: selectedList?.[0]?.monUuid,
      monPort: Number(values.monPort),
    };

    doAction({
      mutation: updateCephMon,
      payload,
      name: intl.formatMessage({
        id: "change.monPort",
        defaultMessage: "Modify Mon Port",
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
        id: "change.monPort",
        defaultMessage: "Modify Mon Port",
      })}
    >
      <Form {...form}>
        <InputNumberField
          form={form}
          name="monPort"
          label={intl.formatMessage({
            id: "monPort",
            defaultMessage: "Mon Port",
          })}
          required
          min={1}
          max={65535}
          className={style["width-320"]}
        />
      </Form>
    </DialogForm>
  );
};

export default Action;
