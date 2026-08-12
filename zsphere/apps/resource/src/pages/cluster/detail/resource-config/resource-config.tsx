import { List } from "@zstack/zsphere-components";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

interface IProps {
  current: ICluster;
}

const ResourceConfig: React.FC<IProps> = ({ current }) => {
  const intl = useIntl();

  const { hostCpuOverProvisioningRatio, mevocoOverProvisioningMemory } =
    current?.resourceConfigValue ?? {};

  const list = React.useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: "cpu.overProvisioning.ratio",
          defaultMessage: "CPU Overcommit Ratio",
        }),
        value: hostCpuOverProvisioningRatio
          ? `${hostCpuOverProvisioningRatio} : 1`
          : intl.formatMessage({ id: "none", defaultMessage: "None" }),
      },
      {
        label: intl.formatMessage({
          id: "overProvisioning.memory",
          defaultMessage: "Memory Overcommit Ratio",
        }),
        value: mevocoOverProvisioningMemory
          ? `${mevocoOverProvisioningMemory} : 1`
          : intl.formatMessage({ id: "none", defaultMessage: "None" }),
      },
    ];
  }, [intl, hostCpuOverProvisioningRatio, mevocoOverProvisioningMemory]);

  return <List list={list} />;
};

export default ResourceConfig;
