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
import type { PrimaryStorage as IPrimaryStorage } from "@zstack/zsphere-types/graphql";
import { formatResourceName } from "@zstack/zsphere-utils";
import type React from "react";
import { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createPrimaryStorageUpdateSchema,
  type PrimaryStorageUpdateValues,
} from "./schema";

const updatePrimaryStorage = gql`
  mutation updatePrimaryStorage($input: UpdatePrimaryStorageInput!) {
    updatePrimaryStorage(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IPrimaryStorage>> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
  source,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const defaultValues = useMemo<PrimaryStorageUpdateValues>(
    () => ({
      name: selectedList?.[0]?.name ?? "",
      description: selectedList?.[0]?.description ?? "",
    }),
    [selectedList, source],
  );
  const formSchema = useMemo(
    () => createPrimaryStorageUpdateSchema(intl, selectedList?.[0]?.name),
    [intl, selectedList],
  );
  const form = useForm<PrimaryStorageUpdateValues>({
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

  const onOk = async (values: PrimaryStorageUpdateValues) => {
    doAction({
      mutation: updatePrimaryStorage,
      payload: {
        ...values,
        uuid: selectedList[0].uuid,
      },
      name: intl.formatMessage({
        id: "edit.primaryStorage",
        defaultMessage: "Edit Name and Description",
      }),
      total: 1,
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
        id: "edit.primaryStorage",
        defaultMessage: "Edit Name and Description",
      })}
      resourceName={formatResourceName(selectedList, intl)}
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
              id: "description",
              defaultMessage: "Description",
            })}
            rows={3}
            limit={2000}
            size="m"
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
