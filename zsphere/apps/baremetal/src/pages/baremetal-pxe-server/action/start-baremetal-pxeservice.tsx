import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { BaremetalPxeServer as IBaremetalPxeServer } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const startBaremetalPxeServer = gql`
  mutation ($input: StartBaremetalPxeServerInput!) {
    startBaremetalPxeServer(input: $input) {
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
      mutation: startBaremetalPxeServer,
      payload,
      name: intl.formatMessage({
        id: "baremetal.pxeservice.action.enable",
        defaultMessage: "Enable Deployment Server",
      }),
      total: selectedList.length,
      type: "BaremetalPxeServer",
      onFinish: () => {
        setSelectedList?.([]);
      },
    });
  };

  return (
    <DialogP3
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
        id: "baremetalPxeServer.modal.title.confirm.enable.baremetalPxeServer",
        defaultMessage: "Enable Deployment Server?",
      })}
    />
  );
};

export default Action;
