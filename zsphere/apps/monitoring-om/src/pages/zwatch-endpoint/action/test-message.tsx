import { gql } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@zstack/design";
import { FieldStack, InputField, useDialogHookFormAdapter } from "@zstack/form";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  EndPoint as IEndPoint,
  ValidateAliyunSmsEndpointPayload as IValidateAliyunSmsEndpointPayload,
} from "@zstack/zsphere-types/graphql";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { createTestMessageSchema, type TestMessageFormValues } from "./schema";

const TestMessageAction: React.FC<IActionWrapperProps<IEndPoint>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const defaultValues = useMemo<TestMessageFormValues>(
    () => ({
      areaCodePhoneNumber: {
        areaCode: "86",
        phoneNumber: "",
      },
    }),
    [],
  );
  const formSchema = useMemo(() => createTestMessageSchema(intl), [intl]);
  const form = useForm<TestMessageFormValues>({
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

  const validateAliyunSmsEndpoint = gql`
    mutation validateAliyunSmsEndpoint(
      $input: ValidateAliyunSmsEndpointInput!
    ) {
      validateAliyunSmsEndpoint(input: $input) {
        actionId
      }
    }
  `;

  const onOk = (values: TestMessageFormValues) => {
    setSelectedList?.([]);
    const { areaCode, phoneNumber } = values.areaCodePhoneNumber;
    const payload: IValidateAliyunSmsEndpointPayload = {
      phoneNumbers: [`+${areaCode}-${phoneNumber}`],
      uuid: selectedList?.length ? selectedList[0].uuid : "",
    };

    doAction({
      mutation: validateAliyunSmsEndpoint,
      payload,
      name: intl.formatMessage({
        id: "test.message",
        defaultMessage: "Test Text Message",
      }),
      total: 1,
      type: "EndPoint",
    });
  };
  return (
    <DialogForm
      visible={visible}
      setVisible={setVisible}
      title={intl.formatMessage({
        id: "test.message",
        defaultMessage: "Test Text Message",
      })}
      form={dialogForm}
      onOk={onOk}
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
              id: "phoneNumber",
              defaultMessage: "Phone Number",
            })}
            required
            size="m"
          />
        </FieldStack>
      </Form>
    </DialogForm>
  );
};

export default TestMessageAction;
