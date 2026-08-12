import { DialogP3 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { HostVO as IHost } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { disableHosts } from "../../../gql/host.gql";

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
      mutation: disableHosts,
      payload,
      name: intl.formatMessage({
        id: "disable.host",
        defaultMessage: "Disable Host",
      }),
      total: selectedList.length,
      onFinish: () => {
        refetch?.();
      },
      type: "HostVO",
    });
    setSelectedList?.([]);
  };

  return (
    <DialogP3
      title={intl.formatMessage({
        id: "host.modal.title.confirm.disable.host",
        defaultMessage: "Disable Host?",
      })}
      visible={visible}
      setVisible={setVisible}
      bannerMessage={intl.formatMessage({
        id: "host.modal.disable.alert.danger",
        defaultMessage: "If you disable a host, the host cannot be used to apply for new resources.",
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
