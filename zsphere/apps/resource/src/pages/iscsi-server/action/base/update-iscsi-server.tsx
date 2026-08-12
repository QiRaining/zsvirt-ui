import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { InputField, useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  IscsiServer as IIscsiServer,
  UpdateIscsiServerInput as IUpdateIscsiServerInput,
  UpdateIscsiServerPayload,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createUpdateIscsiServerSchema,
  type UpdateIscsiServerFormValues,
} from "./schema";

import styles from "./style.module.less";

const _updateIscsiServers = gql`
  mutation updateIscsiServers($input: UpdateIscsiServerInput!) {
    updateIscsiServers(input: $input) {
      actionId
    }
  }
`;

interface IFormPorps {
  updateData: Omit<IUpdateIscsiServerInput["payload"][number], "uuid">;
}

const UpdateAction: React.FC<
  IActionWrapperProps<IIscsiServer> & IFormPorps
> = ({ visible, updateData, setVisible, selectedList }) => {
  const intl = useIntl();
  const doAction = useAction();
  const defaultValues = useMemo<UpdateIscsiServerFormValues>(
    () => ({
      name: "name" in updateData ? (updateData.name ?? "") : "",
    }),
    [updateData],
  );
  const formSchema = useMemo(() => createUpdateIscsiServerSchema(intl), [intl]);
  const form = useForm<UpdateIscsiServerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onOk = (data: UpdateIscsiServerFormValues) => {
    setVisible(false);
    const payload: UpdateIscsiServerPayload[] = selectedList.map(
      ({ uuid }) => ({
        uuid,
        ...data,
      }),
    );
    doAction({
      mutation: _updateIscsiServers,
      payload,
      name: intl.formatMessage({
        id: "update.iscsiServerStorage",
        defaultMessage: "Update iSCSI Storage",
      }),
      total: selectedList?.length || 1,
      onProgress: (_result: ITaskResult) => {
        // console.log(result)
      },
      onFinish: (_result: IActionResult) => {
        // console.log(result)
      },
    });
  };

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  const info = useMemo(() => {
    if ("name" in updateData) {
      return {
        title: intl.formatMessage({
          id: "edit.name",
          defaultMessage: "Edit Name",
        }),
      };
    }

    return {};
  }, [updateData, intl]);

  return (
    <DialogForm
      {...info}
      visible={visible}
      setVisible={setVisible}
      form={dialogForm}
      onOk={onOk}
    >
      <Form {...form}>
        {"name" in updateData && (
          <InputField
            form={form}
            name="name"
            label={intl.formatMessage({
              id: "name",
              defaultMessage: "Name",
            })}
            required
            className={styles["width-320"]}
          />
        )}
      </Form>
    </DialogForm>
  );
};

export default UpdateAction;

export function useUpdateModal() {
  const [updateData, setUpdateData] = useState<IFormPorps["updateData"]>({});

  const [visible, setVisible] = useState<boolean>(false);

  const onEditHandle = (data: typeof updateData) => {
    setUpdateData(data);

    setVisible(true);
  };

  return {
    visible,
    setVisible,
    updateData,
    onEditHandle,
  };
}
