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
  HostGroup,
  UpdateHostGroupPayload,
} from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createUpdateHostGroupSchema,
  type UpdateHostGroupFormValues,
} from "./schema";

const UpdateAction: React.FC<IActionWrapperProps<HostGroup>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const defaultValues = useMemo<UpdateHostGroupFormValues>(() => {
    const value: UpdateHostGroupFormValues = {
      name: "",
      description: "",
    };
    if (selectedList?.length) {
      value.name = selectedList[0].name;
      value.description = selectedList[0].description || "";
    }
    return value;
  }, [selectedList]);
  const formSchema = useMemo(() => createUpdateHostGroupSchema(intl), [intl]);
  const form = useForm<UpdateHostGroupFormValues>({
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

  const updateHostGroup = gql`
    mutation updateHostGroup($input: UpdateHostGroupInput!) {
      updateHostGroup(input: $input) {
        actionId
      }
    }
  `;

  const onOk = async (values: UpdateHostGroupFormValues) => {
    const payload: UpdateHostGroupPayload = {
      ...values,
      uuid: selectedList?.length ? selectedList[0].uuid : "",
    };

    doAction({
      mutation: updateHostGroup,
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
