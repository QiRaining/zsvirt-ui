import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { HostVO as IHost } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { enableHosts } from "../../../gql/host.gql";

const Action: React.FC<IActionWrapperProps<IHost>> = ({
  visible,
  refetch,
  setVisible,
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
      mutation: enableHosts,
      payload,
      name: intl.formatMessage({
        id: "enable.host",
        defaultMessage: "Enable Host",
      }),
      total: selectedList.length,
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
        id: "host.modal.title.confirm.enable.host",
        defaultMessage: "Enable Host?",
      })}
      visible={visible}
      setVisible={setVisible}
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
