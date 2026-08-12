import { DialogP1 } from "@zstack/zsphere-design-biz";
import { useAction } from "@zstack/zsphere-hooks";
import type { IActionWrapperProps } from "@zstack/zsphere-types";
import type { HostVO as IHost } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

import { maintenanceHosts } from "../../../gql/host.gql";

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
    if (selectedList?.length) {
      const payload = selectedList.map((item) => {
        return { uuid: item?.uuid };
      });
      doAction({
        mutation: maintenanceHosts,
        payload,
        name: intl.formatMessage({
          id: "hostEnterMaintenanceMode",
          defaultMessage: "Enter Maintenance Mode",
        }),
        total: selectedList.length,
        onFinish: () => {
          refetch?.();
          setSelectedList?.([]);
        },
        type: "HostVO",
      });
    }
  };

  return (
    <DialogP1
      title={intl.formatMessage({
        id: "host.modal.title.confirm.enter.maintenanceMode",
        defaultMessage: "Enter Maintenance Mode?",
      })}
      visible={visible}
      setVisible={setVisible}
      bannerMessage={
        <ReactMarkdown>
          {intl.formatMessage({
            id: "host.modal.maintenance.alert.danger",
            defaultMessage: `1. If a host enters maintenance mode, virtual machines on shared storage automatically migrate to other hosts with sufficient resources in the cluster.
2. Virtual machines on local storage and those that fail to migrate will be forcibly shut down.
3. If virtual machines have been high-loaded for a long time, you can enable auto-converge in System Parameter in advance to improve migration success rate.`,
          })}
        </ReactMarkdown>
      }
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
