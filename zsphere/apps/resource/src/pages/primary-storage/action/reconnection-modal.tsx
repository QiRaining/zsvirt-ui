import { gql } from "@apollo/client";
import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import { PrimaryStorageStatus } from "@zstack/zsphere-types";
import type { PrimaryStorageVO as IPrimaryStorage } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

const reconnectPrimaryStorageList = gql`
  mutation reconnectPrimaryStorageList($input: ReconnectPrimaryStorageInput!) {
    reconnectPrimaryStorageList(input: $input) {
      actionId
    }
  }
`;

const Action: React.FC<IActionWrapperProps<IPrimaryStorage>> = ({
  visible,
  setVisible,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();
  const onOk = () => {
    const payload = selectedList.map((item: IPrimaryStorage) => {
      return { uuid: item?.uuid };
    });
    doAction({
      mutation: reconnectPrimaryStorageList,
      payload,
      name: intl.formatMessage({
        id: "reconnect.primaryStorage",
        defaultMessage: "Reconnect Data Storage",
      }),
      total: selectedList.length,
      middleState: {
        type: "PrimaryStorageVO",
        field: "status",
        data: { status: PrimaryStorageStatus.Connecting },
        uuids: selectedList.map((item) => item.uuid),
      },
    });
    setSelectedList?.([]);
  };

  return (
    <DialogP3
      visible={visible}
      setVisible={setVisible}
      bannerMessage={intl.formatMessage({
        id: "primaryStorage.modal.reconnect.primaryStorage.alert.danger",
        defaultMessage: "You cannot operate on resources of this data storage while reconnection is in progress.",
      })}
      title={intl.formatMessage({
        id: "primaryStorage.modal.title.confirm.reconnect.primaryStorage",
        defaultMessage: "Reconnect Data Storage?",
      })}
      resourceNames={selectedList.map((r) => r.name)}
      onConfirm={() => {
        onOk();
      }}
    />
  );
};

export default Action;
