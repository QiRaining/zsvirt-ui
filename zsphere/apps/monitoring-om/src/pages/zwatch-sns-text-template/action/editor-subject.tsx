import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  TextareaField,
  useDialogHookFormAdapter,
  FieldStack,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { SNSTextTemplate as ISNSTextTemplate } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { updateSNSTextTemplate } from "../../../gql/zwatch-sns-text-template.gql";
import { ZwatchSNSTextTemplateAlarmType } from "../constant";
import {
  createEditorSubjectSchema,
  type EditorSubjectFormValues,
} from "./schema";

import style from "./style.module.less";

const Action: React.FC<IActionWrapperProps<ISNSTextTemplate>> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
}) => {
  const intl = useIntl();
  // const { snsTextTemplateArgs } = useQueryTextTemplateArgs()

  const current = selectedList?.[0] ?? {};
  // const { textValidator } = useTextTemplateValidator(
  //   intl,
  //   current.type === ZwatchSNSTextTemplateAlarmType.Alarm
  //     ? snsTextTemplateArgs.alarm
  //     : snsTextTemplateArgs.event
  // )
  const doAction = useAction();
  const requiresRecoverySubject =
    ZwatchSNSTextTemplateAlarmType.Alarm === current.type;

  const defaultValues = useMemo<EditorSubjectFormValues>(() => {
    const values = {
      subject: "",
      recoverySubject: "",
    };
    if (selectedList?.length) {
      const { subject, recoverySubject } = current;
      values.subject = subject ?? "";
      values.recoverySubject = recoverySubject ?? "";
    }
    return values;
  }, [current, selectedList]);
  const schema = useMemo(
    () => createEditorSubjectSchema(intl, requiresRecoverySubject),
    [intl, requiresRecoverySubject],
  );
  const form = useForm<EditorSubjectFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const onOk = async (values: EditorSubjectFormValues) => {
    if (selectedList?.length) {
      const payload = {
        uuid: current?.uuid,
        subject: values.subject,
        ...(requiresRecoverySubject
          ? { recoverySubject: values.recoverySubject }
          : {}),
      };

      doAction({
        mutation: updateSNSTextTemplate,
        payload,
        name: intl.formatMessage({
          id: "modify.messageTemplateTitle",
          defaultMessage: "Modify Alarm Message Title",
        }),
        total: 1,
        onFinish: () => {
          refetch?.();
        },
      });
    }
    setVisible(false);
  };

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "modify.messageTemplateTitle",
        defaultMessage: "Modify Alarm Message Title",
      })}
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      className={style.overrideAntModalForm}
    >
      <Form {...form}>
        <FieldStack>
          <TextareaField
            form={form}
            name="subject"
            label={intl.formatMessage({
              id: "messageTemplate.title",
              defaultMessage: "Alarm Message Title",
            })}
            required
            rows={3}
            showCount={false}
            size="m"
          />
          {requiresRecoverySubject ? (
            <TextareaField
              form={form}
              name="recoverySubject"
              label={intl.formatMessage({
                id: "recoverMessageTemplate.title",
                defaultMessage: "Recovery Message Title",
              })}
              required
              rows={3}
              showCount={false}
              size="m"
            />
          ) : null}
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
