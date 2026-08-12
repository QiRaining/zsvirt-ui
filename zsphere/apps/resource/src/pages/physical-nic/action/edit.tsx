import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormItem, FormLabel } from "@zstack/design";
import {
  TextareaField,
  useDialogHookFormAdapter,
  FieldStack,
} from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { PhysicalNic as IPhysicalNic } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createPhysicalNicUpdateSchema,
  type PhysicalNicUpdateFormValues,
} from "./schema";

const updateHostNetworkInterface = gql`
  mutation updateHostNetworkInterface(
    $input: UpdateHostNetworkInterfaceInput!
  ) {
    updateHostNetworkInterface(input: $input) {
      actionId
    }
  }
`;

const UpdateModal: React.FC<IActionWrapperProps<IPhysicalNic>> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const defaultValues = useMemo<PhysicalNicUpdateFormValues>(
    () => ({
      description: selectedList?.[0]?.description ?? "",
    }),
    [selectedList],
  );
  const formSchema = useMemo(() => createPhysicalNicUpdateSchema(intl), [intl]);
  const form = useForm<PhysicalNicUpdateFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const resourceName = selectedList?.[0]?.interfaceName ?? "";

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [visible, defaultValues, form]);

  const onOk = async (input: PhysicalNicUpdateFormValues) => {
    doAction({
      mutation: updateHostNetworkInterface,
      payload: {
        description: input.description ?? "",
        interfaceUuid: selectedList?.[0].uuid,
      },
      name: intl.formatMessage({
        id: "physicalNic.edit",
        defaultMessage: "Edit Physical NIC",
      }),
      total: selectedList.length,
      type: "physicalNic",
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
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
        id: "edit.name.and.description",
        defaultMessage: "Edit Name and Description",
      })}
      resourceName={resourceName}
    >
      <Form {...form}>
        <FieldStack>
          <FormItem className="flex flex-row gap-2">
            <FormLabel className="mt-[5px] flex">
              {intl.formatMessage({ id: "name", defaultMessage: "Name" })}
            </FormLabel>
            <div className="flex min-h-8 items-center">{resourceName}</div>
          </FormItem>
          <TextareaField
            form={form}
            name="description"
            label={intl.formatMessage({
              id: "description",
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

export default UpdateModal;
