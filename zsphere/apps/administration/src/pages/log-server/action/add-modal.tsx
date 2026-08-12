import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Form } from "@zstack/design";
import { useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { LogServer as ILogServer } from "@zstack/zsphere-types/graphql";
import React, { useCallback, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useIntl } from "react-intl";

import { createLogServer, testLogServer } from "../../../gql/log-server.gql";
import { LogServerFormFields } from "./log-server-form-fields";
import {
  buildLogServerConfiguration,
  buildTestLogServerConfiguration,
  createAddLogServerSchema,
  DEFAULT_LOG_SERVER_FORM_VALUES,
  type AddLogServerFormValues,
} from "./schema";

import styles from "./style.module.less";

const Action: React.FC<IActionWrapperProps<ILogServer>> = ({
  visible,
  setVisible,
  refetch,
}) => {
  const intl = useIntl();
  const title = intl.formatMessage({
    id: "add.logServer",
    defaultMessage: "Add Log Server",
  });
  const doAction = useAction();

  const defaultValues = useMemo<AddLogServerFormValues>(
    () => DEFAULT_LOG_SERVER_FORM_VALUES,
    [],
  );
  const formSchema = useMemo(() => createAddLogServerSchema(intl), [intl]);
  const form = useForm<AddLogServerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onSubmit",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const watchedValues = useWatch({ control: form.control });

  const isFormValidateOk = useMemo(
    () =>
      formSchema.safeParse({
        ...defaultValues,
        ...watchedValues,
      }).success,
    [defaultValues, formSchema, watchedValues],
  );

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const testConnection = useCallback(async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      return;
    }

    const payload = buildTestLogServerConfiguration(form.getValues(), [
      "ephemeral::validationOnly",
    ]);

    doAction({
      mutation: testLogServer,
      payload: [payload],
      name: intl.formatMessage({
        id: "test.connection.to.logServer",
        defaultMessage: "Test Connection to Log Server",
      }),
      total: 1,
    });
  }, [doAction, form, intl]);

  const onOk = useCallback(
    (values: AddLogServerFormValues) => {
      doAction({
        mutation: createLogServer,
        name: intl.formatMessage({
          id: "add.log.server",
          defaultMessage: "Add Log Server",
        }),
        payload: buildLogServerConfiguration(values),
        total: 1,
        type: "LogServer",
        onFinish: () => {
          refetch?.();
        },
      });
      setVisible(false);
    },
    [doAction, intl, refetch, setVisible],
  );

  const handleCancel = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  const handleSubmit = useCallback(() => {
    form.handleSubmit(onOk)();
  }, [form, onOk]);

  return (
    <DialogForm
      visible={visible}
      form={dialogForm}
      setVisible={setVisible}
      title={title}
      onOk={onOk}
      footer={
        <div className={styles["add-modal-footer"]}>
          <button
            type="button"
            className={
              isFormValidateOk ? styles["test-ok"] : styles["test-not-ok"]
            }
            onClick={testConnection}
          >
            {intl.formatMessage({
              id: "test.connection",
              defaultMessage: "Test Connection",
            })}
          </button>
          <div className={styles["add-modal-actions"]}>
            <Button variant="subtle" onClick={handleCancel}>
              {intl.formatMessage({
                id: "cancel",
                defaultMessage: "Cancel",
              })}
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {intl.formatMessage({
                id: "determine",
                defaultMessage: "OK",
              })}
            </Button>
          </div>
        </div>
      }
    >
      <Form {...form}>
        <LogServerFormFields form={form} />
      </Form>
    </DialogForm>
  );
};

export default Action;
