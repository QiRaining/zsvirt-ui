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
import type { VmInstance } from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import type React from "react";
import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { createUpdateVmSchema, type UpdateVmValues } from "./schema";

const updateVmInstance = gql`
  mutation updateVmInstance($input: UpdateVmInstanceInput!) {
    updateVmInstance(input: $input) {
      actionId
    }
  }
`;

const UpdateModal: React.FC<IActionWrapperProps<VmInstance>> = ({
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const defaultValues = useMemo<UpdateVmValues>(
    () => ({
      name: selectedList?.[0]?.name ?? "",
      description: selectedList?.[0]?.description ?? "",
    }),
    [selectedList],
  );
  const formSchema = useMemo(
    () => createUpdateVmSchema(intl, selectedList?.[0]?.name),
    [intl, selectedList],
  );
  const form = useForm<UpdateVmValues>({
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

  const onOk = async (values: UpdateVmValues) => {
    doAction({
      mutation: updateVmInstance,
      payload: {
        ...values,
        uuid: selectedList![0]?.uuid,
      },
      name: intl.formatMessage({
        id: "edit.vm",
        defaultMessage: "Edit Name and Description",
      }),
      total: 1,
      onFinish: () => {
        setVisible(false);
      },
    });
  };

  return (
    <DialogForm
      title={intl.formatMessage({
        id: "edit.vm",
        defaultMessage: "Edit Name and Description",
      })}
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      resourceName={formatResourceName(selectedList, intl)}
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
            rows={4}
            limit={2000}
            size="m"
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default UpdateModal;
