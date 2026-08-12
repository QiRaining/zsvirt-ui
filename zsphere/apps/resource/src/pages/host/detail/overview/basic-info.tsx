import { useTime } from "@zstack/hooks";
import { DraggableCard, useIsCurrentTab } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { List, Constant } from "@zstack/zsphere-components";
import type { ConstantEnum } from "@zstack/zsphere-constant";
import { ConstantType } from "@zstack/zsphere-constant";
import { LongText, CopyableText } from "@zstack/zsphere-design-biz";
import type { HostVO } from "@zstack/zsphere-types/graphql";
import { formatSecToPeriod } from "@zstack/zsphere-utils";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";

interface IProps {
  detail: HostVO;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  setShowEditConfigModal?: React.Dispatch<React.SetStateAction<boolean>>;
}

const BasicInfo: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed = false,
}) => {
  const intl = useIntl();
  const { getServerTime, getDurationTime } = useTime();
  const {
    osDistribution,
    osRelease,
    osVersion,
    connectedTime,
    state,
    status,
    ipmiPowerStatus,
    relatedVmCount,
    managementIp,
    username,
    sshPort,
    tag = [],
    iscsiInitiatorName,
    description,
    uuid,
    createDate,
  } = detail;

  const operationSystem = useMemo(() => {
    if (osDistribution && osRelease && osVersion) {
      const distribution =
        osDistribution === "centos" ? "CentOS" : osDistribution;
      return `${distribution} ${osRelease} ${osVersion}`;
    }
    return null;
  }, [osDistribution, osRelease, osVersion]);

  const equal = useIsCurrentTab("main-tab", "overview");
  const runtime = useMemo(() => {
    //TODO 这里的时间要用服务器时间，这里先写成客户端时间,先过lint
    const millseconds = Date.now() - parseInt(connectedTime || "0", 10);
    const seconds = Math.floor(millseconds / 1000);
    return formatSecToPeriod(seconds, intl);
  }, [connectedTime, getDurationTime, intl, equal]);

  const list: ListItem[] = useMemo(() => {
    return [
      {
        label: intl.formatMessage({
          id: "enable.state",
          defaultMessage: "State",
        }),
        value: (
          <Constant
            value={state as unknown as ConstantEnum}
            enumType={ConstantType.HostState}
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "ready.state",
          defaultMessage: "Status",
        }),
        value: (
          <Constant
            value={status as unknown as ConstantEnum}
            enumType={ConstantType.HostStatus}
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "power.state",
          defaultMessage: "Power Status",
        }),
        icon: "info",
        iconTooltip: (
          <ReactMarkdown>
            {intl.formatMessage({
              id: "power.state.tooltip",
              defaultMessage: `### Power Status

The power status of a host.

1. After you added a host to the platform, by default, the host is in IPMI unmanaged status, which means the platform cannot obtain the power status of the host.

2. After you modify the IPMI information of a host, the host is managed by the platform through IPMI. The platform can obtain the power status of the managed host, including powered on, powered off, powering on, powering off, and unknown.
              `,
            })}
          </ReactMarkdown>
        ),
        value: (
          <Constant
            value={ipmiPowerStatus as unknown as ConstantEnum}
            enumType={ConstantType.HostIPMIPowerStatus}
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "virtualization.vm.number",
          defaultMessage: "VMs",
        }),
        value: relatedVmCount,
      },
      {
        label: intl.formatMessage({
          id: "hostIp",
          defaultMessage: "Host IP",
        }),
        value: <CopyableText>{managementIp}</CopyableText>,
      },
      {
        label: intl.formatMessage({
          id: "ssh.username",
          defaultMessage: "SSH Username",
        }),
        value: username,
      },
      {
        label: intl.formatMessage({
          id: "ssh.port",
          defaultMessage: "SSH Port",
        }),
        value: sshPort,
      },
      {
        label: intl.formatMessage({
          id: "operationSystem",
          defaultMessage: "Operating System",
        }),
        value: operationSystem,
      },
      {
        label: intl.formatMessage({
          id: "host.iqn",
          defaultMessage: "Host IQN",
        }),
        value: iscsiInitiatorName,
      },
      {
        label: intl.formatMessage({
          id: "runtime",
          defaultMessage: "Uptime",
        }),
        value: runtime,
      },
      {
        label: intl.formatMessage({
          id: "description",
          defaultMessage: "Description",
        }),
        value: <LongText value={description} canModify />,
      },
      {
        label: intl.formatMessage({
          id: "uuid",
          defaultMessage: "UUID",
        }),
        value: <CopyableText>{uuid}</CopyableText>,
      },
      {
        label: intl.formatMessage({
          id: "virtualization.add.time",
          defaultMessage: "Addition Time",
        }),
        value: getServerTime(createDate!).format("YYYY-MM-DD HH:mm:ss"),
      },
    ];
  }, [
    createDate,
    description,
    getServerTime,
    intl,
    ipmiPowerStatus,
    managementIp,
    operationSystem,
    relatedVmCount,
    runtime,
    sshPort,
    state,
    status,
    tag,
    username,
    uuid,
  ]);

  return (
    <DraggableCard
      title={intl.formatMessage({
        id: "basic.info",
        defaultMessage: "Basic Info",
      })}
      isList
      onCollapseChange={onCollapseChange}
      collapsed={collapsed}
    >
      <List list={list} bordered={false} />
    </DraggableCard>
  );
};

export default BasicInfo;
