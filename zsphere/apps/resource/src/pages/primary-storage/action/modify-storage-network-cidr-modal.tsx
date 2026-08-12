import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { InputField } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { PrimaryStorageVO as IPrimaryStorage } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createModifyStorageNetworkCidrSchema,
  type ModifyStorageNetworkCidrFormValues,
} from "./schema";

const updateStorageNetworkCidr = gql`
  mutation updateStorageNetworkCidr($input: UpdateStorageNetworkCidrInput!) {
    updateStorageNetworkCidr(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IPrimaryStorage>> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const defaultValues = useMemo(() => {
    const value: ModifyStorageNetworkCidrFormValues = {
      cidr: "",
    };
    if (selectedList?.length) {
      value.cidr = selectedList[0]?.systemTag?.gatewayCidr ?? "";
    }
    return value;
  }, [selectedList]);
  const formSchema = useMemo(
    () => createModifyStorageNetworkCidrSchema(intl),
    [intl],
  );
  const form = useForm<ModifyStorageNetworkCidrFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);

  const onOk = async (values: ModifyStorageNetworkCidrFormValues) => {
    const payload = {
      ...values,
      uuid: selectedList?.[0]?.uuid,
    };
    doAction({
      mutation: updateStorageNetworkCidr,
      payload,
      name: intl.formatMessage({
        id: "change.storageNetwork",
        defaultMessage: "Change Storage Network",
      }),
      total: selectedList.length,
      onFinish: () => {
        refetch?.();
      },
    });
  };

  const dialogForm = useMemo(
    () => ({
      validateFields: async () => {
        const isValid = await form.trigger();

        if (!isValid) {
          const cidrError = form.getFieldState("cidr").error;
          throw {
            errorFields: [
              {
                name: ["cidr"],
                errors: cidrError?.message ? [cidrError.message] : [],
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
        id: "change.storageNetwork",
        defaultMessage: "Change Storage Network",
      })}
      resourceName={selectedList?.[0]?.name}
    >
      <Form {...form}>
        <InputField
          form={form}
          name="cidr"
          label={intl.formatMessage({
            id: "storage.network",
            defaultMessage: "Storage Network",
          })}
          required
          size="m"
        />
      </Form>
    </DialogForm>
  );
};

export default Action;
