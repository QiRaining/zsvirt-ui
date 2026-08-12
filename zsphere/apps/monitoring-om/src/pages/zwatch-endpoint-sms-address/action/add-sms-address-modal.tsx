import { gql } from "@apollo/client";
import { Form } from "@zstack/zsphere-components";
import { DialogForm } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  EndPointSmsAddress as IEndPointSmsAddress,
  AddSmsReceiverPayload,
} from "@zstack/zsphere-types/graphql";
import React, { useEffect } from "react";
import { useIntl } from "react-intl";

import { AddSmsAtPersonFormItems } from "@/pages/zwatch-endpoint/components";

export interface IProps {
  currentEndpointUuid: string;
}

const initialValues = {
  areaCodePhoneNumber: {
    areaCode: "86",
    phoneNumber: "",
  },
};

const AddSmsAddressAction: React.FC<
  IActionWrapperProps<IEndPointSmsAddress> & IProps
> = ({ visible, setVisible, currentEndpointUuid }) => {
  const intl = useIntl();
  const doAction = useAction();

  const [form] = Form.useForm();

  const addSmsReceiver = gql`
    mutation addSmsReceiver($input: AddSmsReceiverInput!) {
      addSmsReceiver(input: $input) {
        actionId
      }
    }
  `;
  useEffect(() => {
    form.setFields([
      {
        name: [`addAliyunSms`, "atPersonList"],
        value: [
          {
            remark: "",
            areaCode: "86",
            phoneNumber: "",
          },
        ],
      },
    ]);
  }, [intl]);
  const onOk = async (values: any) => {
    const payload: AddSmsReceiverPayload[] = [];
    values?.addAliyunSms?.atPersonList?.forEach(
      (item: { areaCode: string; phoneNumber: string }) => {
        payload.push({
          phoneNumber: `+${item.areaCode}-${item.phoneNumber}`,
          endpointUuid: currentEndpointUuid,
        });
      },
    );
    doAction({
      mutation: addSmsReceiver,
      payload,
      name: intl.formatMessage({
        id: "add.sms.address",
        defaultMessage: "Add SMS Address",
      }),
      total: payload.length,
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
        id: "add.sms.address",
        defaultMessage: "Add SMS Address",
      })}
      form={form}
      onOk={onOk}
    >
      <Form form={form} initialValues={initialValues}>
        <AddSmsAtPersonFormItems form={form} />
      </Form>
    </DialogForm>
  );
};

export default AddSmsAddressAction;
