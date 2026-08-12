import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { InputField, useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { EndPointEmailAddress as IEndPointEmailAddress } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import type { IProps } from "./add-email-address-modal";
import {
  createModifyEmailAddressSchema,
  type ModifyEmailAddressFormValues,
} from "./schema";

const updateEmailAddressToEndpoint = gql`
  mutation updateEmailAddressToEndpoint(
    $input: UpdateEmailAddressToEndpointInput!
  ) {
    updateEmailAddressToEndpoint(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IEndPointEmailAddress> & IProps> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
  setSelectedList,
  currentEndpoint,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const schema = useMemo(() => createModifyEmailAddressSchema(intl), [intl]);
  const defaultValues = useMemo<ModifyEmailAddressFormValues>(() => {
    const value = {
      emailAddress: "",
    };
    if (selectedList?.length) {
      value.emailAddress = selectedList[0]?.emailAddress || "";
    }
    return value;
  }, [selectedList]);
  const form = useForm<ModifyEmailAddressFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onBlur",
  });
  const dialogForm = useDialogHookFormAdapter(form, defaultValues);

  useEffect(() => {
    if (visible) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, visible]);
  const onOk = async (values: ModifyEmailAddressFormValues) => {
    const payload = {
      ...values,
      emailAddressUuid: selectedList?.[0]?.uuid,
      endpointUuid: currentEndpoint?.uuid,
    };
    setSelectedList?.([]);
    doAction({
      mutation: updateEmailAddressToEndpoint,
      payload,
      name: intl.formatMessage({
        id: "zwatch.endpoint.action.modify.email.address",
        defaultMessage: "Change Email Address",
      }),
      total: 1,
      onProgress: (result: ITaskResult) => {
        console.log(result);
      },
      onFinish: (result: IActionResult) => {
        console.log(result);
        refetch?.();
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
        id: "zwatch.endpoint.action.modify.email.address",
        defaultMessage: "Change Email Address",
      })}
      resourceName={selectedList?.[0]?.emailAddress}
    >
      <Form {...form}>
        <InputField
          form={form}
          name="emailAddress"
          label={intl.formatMessage({
            id: "email.address",
            defaultMessage: "Email Address",
          })}
          required
          size="m"
        />
      </Form>
    </DialogForm>
  );
};

export default Action;
