import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { FieldStack, InputField, useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { EndPointSmsAddress as IEndPointSmsAddress } from "@zstack/zsphere-types/graphql";
import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import type { IProps } from "./add-sms-address-modal";
import {
  createModifySmsAddressSchema,
  type ModifySmsAddressFormValues,
} from "./schema";

const updateSmsReceiver = gql`
  mutation updateSmsReceiver($input: UpdateSmsReceiverInput!) {
    updateSmsReceiver(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<
  IActionWrapperProps<IEndPointSmsAddress> &
    IProps & { currentEndpointName: string }
> = ({
  refetch,
  visible,
  selectedList,
  setVisible,
  setSelectedList,
  currentEndpointUuid,
  currentEndpointName,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const defaultValues = useMemo<ModifySmsAddressFormValues>(() => {
    const value: ModifySmsAddressFormValues = {
      areaCodePhoneNumber: {
        areaCode: "86",
        phoneNumber: "",
      },
    };
    if (selectedList?.length) {
      const phoneNumber = selectedList[0]?.phoneNumber?.split("-")?.[1] || "";
      const areaCode =
        selectedList[0]?.phoneNumber?.split("-")?.[0]?.split("+")?.[1] || "86";
      value.areaCodePhoneNumber = { areaCode, phoneNumber };
    }
    return value;
  }, [selectedList]);
  const formSchema = useMemo(() => createModifySmsAddressSchema(intl), [intl]);
  const form = useForm<ModifySmsAddressFormValues>({
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
  const onOk = (values: ModifySmsAddressFormValues) => {
    const { areaCode, phoneNumber } = values.areaCodePhoneNumber;
    const payload = {
      phoneNumber: `+${areaCode}-${phoneNumber}`,
      oldPhoneNumber: selectedList[0]?.phoneNumber,
      endpointUuid: currentEndpointUuid,
    };
    setSelectedList?.([]);
    doAction({
      mutation: updateSmsReceiver,
      payload,
      name: intl.formatMessage({
        id: "zwatch.endpoint.action.modify.sms.address",
        defaultMessage: "Change SMS Address",
      }),
      total: 1,
      onFinish: () => {
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
        id: "zwatch.endpoint.action.modify.sms.address",
        defaultMessage: "Change SMS Address",
      })}
      resourceName={currentEndpointName}
    >
      <Form {...form}>
        <FieldStack>
          <InputField
            form={form}
            name="areaCodePhoneNumber.areaCode"
            label={intl.formatMessage({
              id: "areaCode",
              defaultMessage: "International Area Code",
            })}
            prefix="+"
            required
            className="!w-20"
          />
          <InputField
            form={form}
            name="areaCodePhoneNumber.phoneNumber"
            label={intl.formatMessage({
              id: "sms.address",
              defaultMessage: "SMS Address",
            })}
            required
            size="m"
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default Action;
