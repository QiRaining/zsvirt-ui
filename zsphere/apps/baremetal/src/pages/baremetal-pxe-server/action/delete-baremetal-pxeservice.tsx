import { gql } from "@apollo/client";
import { DialogP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { BaremetalPxeServer as IBaremetalPxeServer } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const deleteBaremetalPxeServer = gql`
  mutation ($input: DeleteBaremetalPxeServerInput!) {
    deleteBaremetalPxeServer(input: $input) {
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
      mutation: deleteBaremetalPxeServer,
      payload,
      name: intl.formatMessage({
        id: "baremetal.pxeservice.action.delete",
        defaultMessage: "Delete Deployment Server",
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
        id: "baremetalPxeServer.modal.title.confirm.delete.baremetalPxeServer",
        defaultMessage: "Delete Deployment Server?",
      })}
      bannerMessage={intl.formatMessage({
        id: "baremetalPxeServer.modal.delete.alert.danger",
        defaultMessage:
          "Deleting deployment servers will expunge the deploying bare metal instances and disable console access to all deployed bare metal instances. Proceed with caution.",
      })}
    />
  );
};

export default Action;
