import { gql } from "@apollo/client";
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
  VmSchedulingRule,
  UpdateVmSchedulingRulePayload,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createUpdateVmSchedulingRuleSchema,
  type UpdateVmSchedulingRuleFormValues,
} from "./schema";

const UpdateAction: React.FC<IActionWrapperProps<VmSchedulingRule>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const defaultValues = useMemo<UpdateVmSchedulingRuleFormValues>(() => {
    const value: UpdateVmSchedulingRuleFormValues = {
      name: "",
      description: "",
    };
    if (selectedList?.length) {
      value.name = selectedList[0].name;
      value.description = selectedList[0].description || "";
    }
    return value;
  }, [selectedList]);
  const formSchema = useMemo(
    () => createUpdateVmSchedulingRuleSchema(intl),
    [intl],
  );
  const form = useForm<UpdateVmSchedulingRuleFormValues>({
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

  const updateVmSchedulingRule = gql`
    mutation updateVmSchedulingRule($input: UpdateVmSchedulingRuleInput!) {
      updateVmSchedulingRule(input: $input) {
        actionId
      }
    }
  `;

  const onOk = async (values: UpdateVmSchedulingRuleFormValues) => {
    const payload: UpdateVmSchedulingRulePayload = {
      ...values,
      uuid: selectedList?.length ? selectedList[0].uuid : "",
    };

    doAction({
      mutation: updateVmSchedulingRule,
      payload,
      name: intl.formatMessage({
        id: "edit.nameAndDescription",
        defaultMessage: "Edit Name and Description",
      }),
      total: 1,
      onFinish: () => {
        setSelectedList?.([]);
      },
    });
  };
  return (
    <DialogForm
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "edit.nameAndDescription",
        defaultMessage: "Edit Name and Description",
      })}
      form={dialogForm}
      onOk={onOk}
      resourceName={selectedList?.[0]?.name}
    >
      <Form {...form}>
        <FieldStack>
          <InputField
            form={form}
            name="name"
            label={intl.formatMessage({
              id: "name",
              defaultMessage: "Name",
            })}
            required
            size="m"
          />
          <TextareaField
            form={form}
            name="description"
            label={intl.formatMessage({
              id: "description",
              defaultMessage: "Description",
            })}
            rows={3}
            size="m"
            maxLength={256}
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default UpdateAction;
