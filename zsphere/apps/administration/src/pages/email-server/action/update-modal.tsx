import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  InputField,
  TextareaField,
  useDialogHookFormAdapter,
  FieldStack,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  EmailServerSetting as IEmailServerSetting,
  UpdateSNSEmailPlatformPayload,
} from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { updateSNSEmailServer } from "../../../gql/email-server-setting.gql";
import {
  createUpdateEmailServerSchema,
  type UpdateEmailServerFormValues,
} from "./schema";

import styles from "../style.module.less";

const Action: React.FC<IActionWrapperProps<IEmailServerSetting>> = ({
  refetch,
  visible,
  selectedList,
  setSelectedList,
  setVisible,
}) => {
  const intl = useIntl();

  const doAction = useAction();

  const defaultValues = useMemo<UpdateEmailServerFormValues>(() => {
    const value: UpdateEmailServerFormValues = {
      name: "",
      description: "",
    };
    if (selectedList?.length) {
      value.name = selectedList[0].name ?? "";
      value.description = selectedList[0].description ?? "";
    }
    return value;
  }, [selectedList]);
  const formSchema = useMemo(() => createUpdateEmailServerSchema(intl), [intl]);
  const form = useForm<UpdateEmailServerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const onOk = (values: UpdateEmailServerFormValues) => {
    const payload: UpdateSNSEmailPlatformPayload[] = selectedList.map(
      (item) => {
        return { uuid: item.uuid, ...values };
      },
    );

    doAction({
      mutation: updateSNSEmailServer,
      payload,
      name: intl.formatMessage({
        id: "edit.name.and.description",
        defaultMessage: "Edit Name and Description",
      }),
      total: selectedList.length,
      onProgress: (_result: ITaskResult) => {},
      onFinish: (_result: IActionResult) => {
        setSelectedList?.([]);
        refetch?.();
      },
    });
    setVisible(false);
  };

  return (
    <DialogForm
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      title={intl.formatMessage({
        id: "edit.name.and.description",
        defaultMessage: "Edit Name and Description",
      })}
      resourceName={selectedList[0].name}
    >
      <Form {...form}>
        <FieldStack>
          <InputField
            form={form}
            name="name"
            label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
            required
            className={styles["width-320"]}
          />
          <TextareaField
            form={form}
            name="description"
            label={intl.formatMessage({
              id: "introduction",
              defaultMessage: "Description",
            })}
            rows={3}
            className={styles["width-320"]}
            maxLength={256}
            showCount
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
