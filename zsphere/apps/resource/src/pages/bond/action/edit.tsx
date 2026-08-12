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
import type { Bond } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createBondDescriptionSchema,
  type BondDescriptionValues,
} from "./schema";

const editBond = gql`
  mutation editBond($input: EditBondInput!) {
    editBond(input: $input) {
      actionId
    }
  }
`;

const UpdateModal: React.FC<IActionWrapperProps<Bond>> = ({
  visible,
  selectedList,
  setVisible,
  refetch,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const defaultValues = useMemo<BondDescriptionValues>(
    () => ({
      description: selectedList?.[0]?.description ?? "",
    }),
    [selectedList],
  );
  const formSchema = useMemo(() => createBondDescriptionSchema(intl), [intl]);
  const form = useForm<BondDescriptionValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);
  const resourceName = selectedList?.[0]?.bondingName ?? "";

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [visible, defaultValues, form]);

  const onOk = async (values: BondDescriptionValues) => {
    doAction({
      mutation: editBond,
      payload: {
        ...values,
        uuid: selectedList?.[0].uuid,
      },
      name: intl.formatMessage({
        id: "edit.name.and.description",
        defaultMessage: "Edit Name and Description",
      }),
      total: selectedList.length,
      type: "Bond",
      onFinish: () => refetch?.(),
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
      resourceName={selectedList?.[0]?.name}
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
