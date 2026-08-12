import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { RadioGroupField } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { PrimaryStorageVO as IPrimaryStorage } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createModifyProvisionSchema,
  type ModifyProvisionFormValues,
} from "./schema";

const updatePrimaryStorageThinProvision = gql`
  mutation updatePrimaryStorageThinProvision(
    $input: UpdatePrimaryStorageThinProvisionInput!
  ) {
    updatePrimaryStorageThinProvision(input: $input) {
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

  // 置备方式
  const checkCpuModelList = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "thinProvision",
          defaultMessage: "Thin Provision",
        }),
        value: "ThinProvisioning",
      },
      {
        label: intl.formatMessage({
          id: "thickProvision",
          defaultMessage: "Thick Provision",
        }),
        value: "ThickProvisioning",
      },
    ],
    [intl],
  );

  const defaultValues = useMemo(() => {
    const value: ModifyProvisionFormValues = {
      value: "ThickProvisioning",
    };
    if (selectedList?.length) {
      value.value = selectedList[0]?.systemTag?.thinProvision
        ? "ThinProvisioning"
        : "ThickProvisioning";
    }
    return value;
  }, [selectedList]);
  const formSchema = useMemo(() => createModifyProvisionSchema(intl), [intl]);
  const form = useForm<ModifyProvisionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);
  const onOk = async (values: ModifyProvisionFormValues) => {
    const payload = {
      ...values,
      uuid: selectedList[0].uuid,
      provisionUuid: selectedList[0]?.systemTag?.thinProvisionUuid,
    };
    doAction({
      mutation: updatePrimaryStorageThinProvision,
      payload,
      name: intl.formatMessage({
        id: "change.provisionMode",
        defaultMessage: "Change Provision Mode",
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
          const valueError = form.getFieldState("value").error;
          throw {
            errorFields: [
              {
                name: ["value"],
                errors: valueError?.message ? [valueError.message] : [],
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
        id: "change.default.provisioning.type",
        defaultMessage: "Modify Default Provisioning Type",
      })}
      resourceName={selectedList?.[0]?.name}
    >
      <Form {...form}>
        <RadioGroupField
          form={form}
          name="value"
          label={intl.formatMessage({
            id: "virtualization.default.provisioning.type",
            defaultMessage: "Default Provisioning Method of Storage Space",
          })}
          required
          options={checkCpuModelList}
        />
      </Form>
    </DialogForm>
  );
};

export default Action;
