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
import type { HostKernelInterface } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createHostKernelInterfaceUpdateSchema,
  type HostKernelInterfaceUpdateValues,
} from "./schema";

const updateHostKernelInterface = gql`
  mutation updateHostKernelInterface($input: UpdateHostKernelInterfaceInput!) {
    updateHostKernelInterface(input: $input) {
      actionId
    }
  }
`;

const EditConfig: React.FC<IActionWrapperProps<HostKernelInterface>> = ({
  visible,
  setVisible,
  selectedList,
  refetch,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const current = selectedList[0];
  const title = intl.formatMessage({
    id: "zskernel.edit.nameAndDescription",
    defaultMessage: "Edit Name and Description",
  });

  const defaultValues = useMemo<HostKernelInterfaceUpdateValues>(
    () => ({
      name: current?.name ?? "",
      description: current?.description ?? "",
    }),
    [current],
  );
  const formSchema = useMemo(
    () => createHostKernelInterfaceUpdateSchema(intl),
    [intl],
  );
  const form = useForm<HostKernelInterfaceUpdateValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [form, visible, defaultValues]);

  const submitHandle = useCallback(
    (data: HostKernelInterfaceUpdateValues) => {
      doAction({
        mutation: updateHostKernelInterface,
        payload: {
          uuid: current.uuid,
          ...data,
        },
        name: title,
        total: 1,
        type: "HostKernelInterface",
        onFinish() {
          refetch?.();
        },
      });
    },
    [doAction, title, current, refetch],
  );

  return (
    <DialogForm
      visible={visible}
      setVisible={setVisible}
      form={dialogForm}
      title={title}
      onOk={submitHandle}
      resourceName={selectedList?.[0]?.name}
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

export default EditConfig;
