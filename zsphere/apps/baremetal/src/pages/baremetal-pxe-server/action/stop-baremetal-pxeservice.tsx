import { gql } from "@apollo/client";
import { DialogP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { BaremetalPxeServer as IBaremetalPxeServer } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const stopBaremetalPxeServer = gql`
  mutation ($input: StopBaremetalPxeServerInput!) {
    stopBaremetalPxeServer(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IBaremetalPxeServer>> = ({
  visible,
  setVisible,
  selectedList,
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const onOk = async () => {
    const payload = selectedList.map((item) => {
      return { uuid: item.uuid };
    });

    doAction({
      mutation: stopBaremetalPxeServer,
      payload,
      name: intl.formatMessage({
        id: "baremetal.pxeservice.action.disable",
        defaultMessage: "Disable Deployment Server",
      }),
      total: selectedList.length,
      type: "BaremetalPxeServer",
      onFinish: () => {
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogP1
      onConfirm={() => {
        onOk();
      }}
      visible={visible}
      resourceNames={(selectedList ?? []).map((item) => item.name ?? item.uuid)}
      setVisible={setVisible}
      resourceType={intl.formatMessage({
        id: "baremetalPxeServer",
        defaultMessage: "Deployment Server",
      })}
      title={intl.formatMessage({
        id: "baremetalPxeServer.modal.title.confirm.disable.baremetalPxeServer",
        defaultMessage: "Disable Deployment Server?",
      })}
      bannerMessage={intl.formatMessage({
        id: "baremetalPxeServer.modal.stop.alert.danger",
        defaultMessage:
          "If deployment servers are disabled, the baremetal chassis residing on the corresponding baremetal cluster will not obtain hardware information. Also, these baremetal chassis cannot be used to create baremetal instances.",
      })}
    />
  );
};

export default Action;
