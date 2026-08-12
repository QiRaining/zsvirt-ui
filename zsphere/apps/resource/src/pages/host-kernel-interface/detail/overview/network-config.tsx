import { Text } from "@zstack/design";
import { List } from "@zstack/zsphere-components";
import { DraggableCard } from "@zstack/zsphere-components";
import { CopyableText } from "@zstack/zsphere-design-biz";
import type { HostKernelInterface } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

export interface IProps {
  current: HostKernelInterface;
}

const NetworkConfig: React.FC<IProps> = ({ current, ...rest }) => {
  const intl = useIntl();
  const list = useMemo(
    () => [
      {
        label: intl.formatMessage({
          id: "zskernel.ipAddress",
          defaultMessage: "IP Address",
        }),
        value: <CopyableText>{current.usedIps?.[0]?.ip ?? "-"}</CopyableText>,
      },
      {
        label: intl.formatMessage({
          id: "zskernel.netmask",
          defaultMessage: "Netmask",
        }),
        value: <Text>{current.usedIps?.[0]?.netmask ?? "-"}</Text>,
      },
      {
        label: intl.formatMessage({ id: "mtu", defaultMessage: "MTU" }),
        value: <Text>{current.l3Network?.mtu ?? "-"}</Text>,
      },
    ],
    [current, intl],
  );
  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "zskernel.networkConfig",
        defaultMessage: "Network Configuration",
      })}
      isList
      {...rest}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default NetworkConfig;
