import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import type { IActionResult, ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type {
  BasicEndPoint as IBasicEndPoint,
  DeleteEndpointPayload as IDeleteEndpointPayload,
} from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import { navigateToUrl } from "single-spa";

const DeleteAction: React.FC<IActionWrapperProps<IBasicEndPoint>> = ({
  visible,
  setVisible,
  selectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const deleteEndpoint = gql`
    mutation deleteSNSApplicationEndpoint($input: DeleteEndpointInput!) {
      deleteSNSApplicationEndpoint(input: $input) {
        actionId
      }
    }
  `;

  const onOk = async () => {
    const payload: IDeleteEndpointPayload[] =
      selectedList?.map((item) => {
        return { uuid: item.uuid, topicUuid: item?.topic?.uuid ?? "" };
      }) || [];
    doAction({
      mutation: deleteEndpoint,
      payload,
      name: intl.formatMessage({
        id: "delete.zwatchEndpoint",
        defaultMessage: "Delete Endpoint",
      }),
      total: payload.length,
      type: "EndPoint",
      onProgress: (result: ITaskResult) => {
        console.log("onProgress:", result);
      },
      onFinish: (result: IActionResult) => {
        console.log("onFinish:", result);
        navigateToUrl("/virtualization-monitoring-om/zwatch-endpoint");
      },
    });
  };

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "zwatchEndpoint.modal.title.confirm.delete.zwatchEndpoint",
        defaultMessage: "Delete Endpoint?",
      })}
      resourceNames={(selectedList || []).map((item) => item.name ?? item.uuid)}
      visible={visible}
      setVisible={setVisible}
      onConfirm={onOk}
    />
  );
};

export default DeleteAction;
