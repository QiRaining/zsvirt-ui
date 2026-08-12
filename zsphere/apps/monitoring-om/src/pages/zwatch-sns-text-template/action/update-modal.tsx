import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import {
  InputField,
  TextareaField,
  useDialogHookFormAdapter,
  FieldStack,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  SNSTextTemplate as ISNSTextTemplate,
  UpdateSNSTextTemplatePayload,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { updateSNSTextTemplate } from "../../../gql/zwatch-sns-text-template.gql";
import {
  createUpdateSnsTextTemplateSchema,
  type UpdateSnsTextTemplateFormValues,
} from "./schema";

const Action: React.FC<IActionWrapperProps<ISNSTextTemplate>> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
}) => {
  const intl = useIntl();

  const doAction = useAction();

  const defaultValues = useMemo<UpdateSnsTextTemplateFormValues>(() => {
    const values: UpdateSnsTextTemplateFormValues = {
      name: "",
      description: "",
    };
    if (selectedList?.length) {
      const { name, description } = selectedList[0];
      values.name = name ?? "";
      values.description = description ?? "";
    }
    return values;
  }, [selectedList]);
  const formSchema = useMemo(
    () => createUpdateSnsTextTemplateSchema(intl),
    [intl],
  );
  const form = useForm<UpdateSnsTextTemplateFormValues>({
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

  const onOk = async (values: UpdateSnsTextTemplateFormValues) => {
    if (selectedList?.length) {
      const {
        name: oldName,
        description: oldDescription,
        uuid,
      } = selectedList[0];
      const { name: newName, description: newDescription } = values;
      const params: UpdateSNSTextTemplatePayload = { uuid };
      let isEditor = false;
      if (oldName !== newName) {
        params.name = newName;
        isEditor = true;
      }
      if (oldDescription !== newDescription) {
        params.description = newDescription;
        isEditor = true;
      }
      if (isEditor) {
        doAction({
          mutation: updateSNSTextTemplate,
          payload: {
            ...params,
          },
          name: intl.formatMessage({
            id: "modify.messageTemplate",
            defaultMessage: "Modify Message Template",
          }),
          total: selectedList.length,
          onFinish: () => {
            refetch?.();
          },
        });
      }
    }
    setVisible(false);
  };

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "virtualization.edit.name.and.description",
        defaultMessage: "Edit Name and Description",
      })}
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      resourceName={selectedList[0]?.name ?? ""}
    >
      <Form {...form}>
        <FieldStack>
          <InputField
            form={form}
            name="name"
            label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
            required
            size="m"
          />
          <TextareaField
            form={form}
            name="description"
            label={intl.formatMessage({
              id: "introduction",
              defaultMessage: "Description",
            })}
            rows={4}
            limit={256}
            size="m"
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
