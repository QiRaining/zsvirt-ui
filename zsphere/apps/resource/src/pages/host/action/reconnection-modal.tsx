import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { HostVO as IHost } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { reconnectHosts } from "../../../gql/host.gql";

const Action: React.FC<IActionWrapperProps<IHost>> = ({
  visible,
  setVisible,
  refetch,
  selectedList = [],
  setSelectedList,
}) => {
  const intl = useIntl();
  const doAction = useAction();

  const onOk = async () => {
    const payload = selectedList.map((item) => {
      return { uuid: item.uuid };
    });
    doAction({
      mutation: reconnectHosts,
      payload,
      name: intl.formatMessage({
        id: "reconnect.host",
        defaultMessage: "Reconnect Host",
      }),
      total: selectedList.length,
      middleState: {
        type: "HostVO",
        uuids: selectedList.map(({ uuid }) => uuid!),
        field: "status",
        data: {
          status: "Connecting",
        },
      },
      onFinish: () => {
        refetch?.();
        setSelectedList?.([]);
      },
      type: "HostVO",
    });
  };

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "host.modal.title.confirm.reconnect.host",
        defaultMessage: "Reconnect Host?",
      })}
      visible={visible}
      setVisible={setVisible}
      bannerMessage={intl.formatMessage({
        id: "host.modal.reconnection.host.alert.danger",
        defaultMessage: "Resources on the host cannot be operated during the reconnection process.",
      })}
      resourceNames={selectedList.map((item) => item.name ?? item.uuid)}
      resourceType={intl.formatMessage({
        id: "host",
        defaultMessage: "Host",
      })}
      onConfirm={() => {
        onOk();
      }}
    />
  );
};

export default Action;
