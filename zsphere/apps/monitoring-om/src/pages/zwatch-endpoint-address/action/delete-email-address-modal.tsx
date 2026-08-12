import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  EndPointEmailAddress as IEndPointEmailAddress,
  DeleteEmailAddressToEndpointPayload as IDeleteEmailAddressToEndpointPayload,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import type { IProps } from "./add-email-address-modal";

const DeleteAction: React.FC<
  IActionWrapperProps<IEndPointEmailAddress> & IProps
> = ({ visible, setVisible, selectedList, currentEndpoint }) => {
  const intl = useIntl();
  const doAction = useAction();

  const deleteEmailAddressToEndpoint = gql`
    mutation deleteEmailAddressToEndpoint(
      $input: DeleteEmailAddressToEndpointInput!
    ) {
      deleteEmailAddressToEndpoint(input: $input) {
        actionId
      }
    }
  `;

  const onOk = async () => {
    if (!selectedList?.length) {
      return false;
    }
    const payload: IDeleteEmailAddressToEndpointPayload[] =
      selectedList?.map((item) => {
        return {
          emailAddressUuid: item?.uuid || "",
          endpointUuid: currentEndpoint?.uuid || "",
          emailAddress: item?.emailAddress || "",
        };
      }) || [];
    doAction({
      mutation: deleteEmailAddressToEndpoint,
      payload,
      name: intl.formatMessage({
        id: "delete.email.address",
        defaultMessage: "Delete Email Address",
      }),
      total: payload.length,
      type: "EndPointEmailAddress",
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
        id: "zwatchEndpointAddress.modal.title.confirm.delete.emailAddress",
        defaultMessage: "Delete Email Address?",
      })}
      resourceNames={(selectedList || []).map(
        (item) => item.emailAddress ?? item.uuid,
      )}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
    />
  );
};

export default DeleteAction;
