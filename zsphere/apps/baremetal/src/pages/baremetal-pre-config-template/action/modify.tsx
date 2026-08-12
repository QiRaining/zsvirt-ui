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
import type { PreconfigurationTemplate as IPreconfigurationTemplate } from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createPreConfigTemplateUpdateSchema,
  type PreConfigTemplateUpdateFormValues,
} from "./schema";

const UPDATE_PRECONFIGURATION_TEMPLATE = gql`
  mutation updatePreconfigurationTemplate(
    $input: UpdatePreconfigurationTemplateInput!
  ) {
    updatePreconfigurationTemplate(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IPreconfigurationTemplate>> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
}) => {
  const intl = useIntl();

  const doAction = useAction();

  const defaultValues = useMemo<PreConfigTemplateUpdateFormValues>(() => {
    const values: PreConfigTemplateUpdateFormValues = {
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
    () => createPreConfigTemplateUpdateSchema(intl),
    [intl],
  );
  const form = useForm<PreConfigTemplateUpdateFormValues>({
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

  const onOk = (values: PreConfigTemplateUpdateFormValues) => {
    if (selectedList?.length) {
      const {
        name: oldName,
        description: oldDescription,
        uuid,
      } = selectedList[0];
      const { name: newName, description: newDescription } = values;
      const input = { uuid } as any;
      if (oldName !== newName) {
        input.name = newName;
      }
      if (oldDescription !== newDescription) {
        input.description = newDescription;
      }
      if (input?.name || input?.description) {
        doAction({
          mutation: UPDATE_PRECONFIGURATION_TEMPLATE,
          payload: {
            ...input,
          },
          name: intl.formatMessage({
            id: "edit.nameAndDescription",
            defaultMessage: "Edit Name and Description",
          }),
          type: "PreconfigurationTemplate",
          total: 1,
          onFinish: () => {
            refetch?.();
          },
        });
      }
    }
  };

  return (
    <DialogForm
      form={dialogForm}
      resourceName={formatResourceName(selectedList, intl)}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      title={intl.formatMessage({
        id: "edit.nameAndDescription",
        defaultMessage: "Edit Name and Description",
      })}
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
              id: "introduction",
              defaultMessage: "Description",
            })}
            rows={3}
            limit={256}
            size="m"
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
