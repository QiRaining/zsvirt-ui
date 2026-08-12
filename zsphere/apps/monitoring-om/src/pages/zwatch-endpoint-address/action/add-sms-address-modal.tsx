import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { InputField, useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  EndPointSmsAddress as IEndPointSmsAddress,
  AddSmsReceiverPayload as IAddSmsReceiverPayload,
} from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import {
  createAddSmsAddressSchema,
  type AddSmsAddressFormValues,
} from "./schema";

export interface IProps {
  currentEndpointUuid: string;
}

const AddEmailAddressAction: React.FC<
  IActionWrapperProps<IEndPointSmsAddress> & IProps
> = ({ visible, setVisible, currentEndpointUuid }) => {
  const intl = useIntl();
  const doAction = useAction();
  const defaultValues = useMemo<AddSmsAddressFormValues>(
    () => ({
      smsAddress: "",
    }),
    [],
  );
  const formSchema = useMemo(() => createAddSmsAddressSchema(intl), [intl]);
  const form = useForm<AddSmsAddressFormValues>({
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

  const addSmsReceiver = gql`
    mutation addSmsReceiver($input: AddSmsReceiverInput!) {
      addSmsReceiver(input: $input) {
        actionId
      }
    }
  `;
  const onOk = async (values: AddSmsAddressFormValues) => {
    const payload: IAddSmsReceiverPayload = {
      ...values,
      endpointUuid: currentEndpointUuid,
    };
    doAction({
      mutation: addSmsReceiver,
      payload,
      name: intl.formatMessage({
        id: "add.smsAddress",
        defaultMessage: "Add SMS Address",
      }),
      total: 1,
      type: "EndPointSmsAddress",
      onProgress: () => {},
      onFinish: () => {},
    });
  };
  return (
    <DialogForm
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "zwatchEndpoint.modal.title.add.smsAddress",
        defaultMessage: "Add SMS Address",
      })}
      form={dialogForm}
      onOk={onOk}
    >
      <Form {...form}>
        <InputField
          form={form}
          name="smsAddress"
          label={intl.formatMessage({
            id: "smsAddress",
            defaultMessage: "SMS Address",
          })}
          required
          size="m"
        />
      </Form>
    </DialogForm>
  );
};

export default AddEmailAddressAction;
