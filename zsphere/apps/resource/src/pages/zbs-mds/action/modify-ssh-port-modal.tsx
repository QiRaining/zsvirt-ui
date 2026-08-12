import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { InputNumberField } from "@zstack/form";
import { useDialogHookFormAdapter } from "@zstack/form";
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
  createModifyCbdMdsSshPortSchema,
  type ModifyCbdMdsSshPortFormValues,
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
  visible,
  setVisible,
  selectedList,
  setSelectedList,
  refetch,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const defaultValues = useMemo(() => {
    const value: ModifyCbdMdsSshPortFormValues = {
      sshPort: 0,
    };
    if (selectedList?.length) {
      value.sshPort = selectedList[0].port ?? 0;
    }
    return value;
  }, [selectedList]);
  const formSchema = useMemo(
    () => createModifyCbdMdsSshPortSchema(intl),
    [intl],
  );
  const form = useForm<ModifyCbdMdsSshPortFormValues>({
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

  const onOk = async (values: ModifyCbdMdsSshPortFormValues) => {
    const payload: IUpdateCbdMdsPayload[] = selectedList?.map((item) => {
      return {
        uuid,
        configType: MdsConfigType.SSH_PORT,
        newConfigValue: `${values.sshPort}`,
        mdsAddr: item.addr,
      } as IUpdateCbdMdsPayload;
    });

    doAction({
      mutation: updateCbdMds,
      payload,
      name: intl.formatMessage({
        id: "change.sshPort",
        defaultMessage: "Edit SSH Port",
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
          className={styles["width-320"]}
        />
      </Form>
    </DialogForm>
  );
};

export default Action;
