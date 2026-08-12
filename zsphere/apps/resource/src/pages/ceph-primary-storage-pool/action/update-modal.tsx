import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { InputField } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { CephPrimaryStoragePool as ICephPrimaryStoragePool } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createUpdateCephPrimaryStoragePoolSchema,
  type UpdateCephPrimaryStoragePoolFormValues,
} from "./schema";

const updateCephPrimaryStoragePool = gql`
  mutation updateCephPrimaryStoragePool(
    $input: UpdateCephPrimaryStoragePoolInput!
  ) {
    updateCephPrimaryStoragePool(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<ICephPrimaryStoragePool>> = ({
  visible,
  selectedList,
  setSelectedList,
  setVisible,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const formSchema = useMemo(
    () => createUpdateCephPrimaryStoragePoolSchema(intl),
    [intl],
  );
  const defaultValues = useMemo<UpdateCephPrimaryStoragePoolFormValues>(() => {
    const value: UpdateCephPrimaryStoragePoolFormValues = {
      aliasName: "",
    };
    if (selectedList?.length) {
      value.aliasName = selectedList[0].aliasName ?? "";
    }
    return value;
  }, [selectedList]);

  const form = useForm<UpdateCephPrimaryStoragePoolFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const dialogForm = useMemo(
    () => ({
      validateFields: async () => {
        const isValid = await form.trigger();

        if (!isValid) {
          const aliasNameError = form.getFieldState("aliasName").error;
          throw {
            errorFields: [
              {
                name: ["aliasName"],
                errors: aliasNameError?.message ? [aliasNameError.message] : [],
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

  const onOk = async (values: UpdateCephPrimaryStoragePoolFormValues) => {
    doAction({
      mutation: updateCephPrimaryStoragePool,
      payload: {
        ...values,
        uuid: selectedList[0].uuid,
      },
      name: intl.formatMessage({
        id: "change.displayName",
        defaultMessage: "Edit Display Name",
      }),
      total: 1,
      onProgress: (result: ITaskResult) => {
        console.log(result);
      },
      onFinish: (result: IActionResult) => {
        console.log(result);
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
        id: "set.displayName",
        defaultMessage: "Set Display Name",
      })}
      resourceName={selectedList?.[0]?.name}
    >
      <Form {...form}>
        <InputField
          form={form}
          name="aliasName"
          label={intl.formatMessage({
            id: "displayName",
            defaultMessage: "Display Name",
          })}
          required
        />
      </Form>
    </DialogForm>
  );
};

export default Action;
