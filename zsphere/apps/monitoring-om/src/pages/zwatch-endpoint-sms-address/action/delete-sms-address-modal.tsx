import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  EndPointSmsAddress as IEndPointSmsAddress,
  RemoveSmsReceiverPayload as IRemoveSmsReceiverPayload,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import type { IProps } from "../../zwatch-endpoint-address/action/add-email-address-modal";

const DeleteAction: React.FC<
  IActionWrapperProps<IEndPointSmsAddress> & IProps
> = ({ visible, setVisible, selectedList, currentEndpointUuid }) => {
  const intl = useIntl();
  const doAction = useAction();

  const removeSmsReceiver = gql`
    mutation removeSmsReceiver($input: RemoveSmsReceiverInput!) {
      removeSmsReceiver(input: $input) {
        actionId
      }
    }
  `;

  const onOk = async () => {
    if (!selectedList?.length) {
      return false;
    }
    const payload: IRemoveSmsReceiverPayload[] =
      selectedList?.map((item) => {
        return {
          endpointUuid: currentEndpointUuid || "",
          phoneNumber: item?.phoneNumber || "",
        };
      }) || [];
    doAction({
      mutation: removeSmsReceiver,
      payload,
      name: intl.formatMessage({
        id: "delete.sms.address",
        defaultMessage: "Delete SMS Address",
      }),
      total: payload.length,
      type: "EndPointSmsAddress",
      onProgress: (result: ITaskResult) => {
        console.log("onProgress:", result);
      },
      onFinish: (result: IActionResult) => {
        console.log("onFinish:", result);
      },
    });
  };

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "zwatchEndpointSmsAddress.modal.title.confirm.delete.smsAddress",
        defaultMessage: "Delete SMS Address?",
      })}
      resourceNames={(selectedList || []).map(
        (item) => item.phoneNumber ?? item.uuid,
      )}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
    />
  );
};

export default DeleteAction;
