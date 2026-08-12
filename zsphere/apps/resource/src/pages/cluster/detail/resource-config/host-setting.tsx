import { List } from "@zstack/zsphere-components";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

interface IProps {
  current: ICluster;
}

const HostSetting: React.FC<IProps> = ({ current }) => {
  const intl = useIntl();

  const isOpenOrClosed = React.useCallback(
    (value) => {
      return value === "true"
        ? intl.formatMessage({
            id: "open",
            defaultMessage: "Enabled",
          })
        : intl.formatMessage({
            id: "closed",
            defaultMessage: "Disabled",
          });
    },
    [intl],
  );

  const list = React.useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: "virtualization.cluster.field.checkCpuModel",
          defaultMessage: "Host CPU Model Check",
        }),
        value: isOpenOrClosed(current?.checkCpuModel),
      },
      {
        label: intl.formatMessage({
          id: "virtualization.cluster.field.ignoreMsrs",
          defaultMessage: "ignore_msrs Option",
        }),
        value: isOpenOrClosed(current?.resourceConfigValue?.kvmIgnoreMsrs),
      },
      {
        label: intl.formatMessage({
          id: "virtualization.cluster.field.enable.zeroCopy",
          defaultMessage: "Host Zero Copy",
        }),
        value: isOpenOrClosed(
          current?.resourceConfigValue?.premiumClusterEnableZeroCopy,
        ),
      },
      {
        label: intl.formatMessage({
          id: "virtualization.cluster.field.hugepage.enable",
          defaultMessage: "Huge Pages",
        }),
        value: isOpenOrClosed(
          current?.resourceConfigValue?.premiumClusterHugepageEnable,
        ),
      },
      {
        label: intl.formatMessage({
          id: "virtualization.cluster.field.reservedMemory",
          defaultMessage: "Host Reserved Memory",
        }),
        value: `${current?.resourceConfigValue?.kvmReservedMemory}B`,
      },
    ];
  }, [intl, current]);

  return <List list={list} />;
};

export default HostSetting;
