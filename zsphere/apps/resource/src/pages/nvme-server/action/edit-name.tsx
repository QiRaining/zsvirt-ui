import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { InputField } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { NvmeTarget } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createEditNvmeServerNameSchema,
  type EditNvmeServerNameFormValues,
} from "./schema";

const updateNvmeServer = gql`
  mutation updateNvmeServer($input: UpdateNvmeServerInput!) {
    updateNvmeServer(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<NvmeTarget>> = ({
  source,
  visible,
  refetch,
  selectedList,
  setSelectedList,
  setVisible,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const defaultValues = useMemo(() => {
    const value: EditNvmeServerNameFormValues = {
      name: "",
    };
    if (selectedList?.length) {
      value.name = selectedList[0].name ?? "";
    }
    return value;
  }, [selectedList]);
  const formSchema = useMemo(
    () => createEditNvmeServerNameSchema(intl),
    [intl],
  );
  const form = useForm<EditNvmeServerNameFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const onOk = async (values: EditNvmeServerNameFormValues) => {
    doAction({
      mutation: updateNvmeServer,
      payload: {
        uuid: selectedList?.[0]?.uuid,
        name: values.name,
      },
      type: "NvmeServer",
      name: intl.formatMessage({
        id: "edit.name",
        defaultMessage: "Edit Name",
      }),
      total: 1,
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
    });
  };

  const dialogForm = useMemo(
    () => ({
      validateFields: async () => {
        const isValid = await form.trigger();

        if (!isValid) {
          const nameError = form.getFieldState("name").error;
          throw {
            errorFields: [
              {
                name: ["name"],
                errors: nameError?.message ? [nameError.message] : [],
              },
            ],
          };
        }

        return form.getValues();
      },
      resetFields: () => {
        form.reset(defaultValues);
      },
    }),
    [defaultValues, form],
  );

  return (
    <DialogForm
      form={dialogForm}
      visible={visible}
      setVisible={setVisible}
      onOk={onOk}
      title={intl.formatMessage({
        id: "edit.name",
        defaultMessage: "Edit Name",
      })}
      resourceName={selectedList?.[0]?.name}
    >
      <Form {...form}>
        <InputField
          form={form}
          name="name"
          label={intl.formatMessage({ id: "name", defaultMessage: "Name" })}
          required
          size="m"
        />
      </Form>
    </DialogForm>
  );
};

export default Action;
