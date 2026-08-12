import { Text } from "@zstack/design";
import { DraggableCard, Tag, useAuth } from "@zstack/zsphere-components";
import type { ListItem } from "@zstack/zsphere-components";
import { List } from "@zstack/zsphere-components";
import type { ManagementNodesStatus } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import NodeEmptyState from "./components/node-empty";
import { useMnStatusMap, useServerStatusMap, getDatabaseStatus } from "./hook";

export interface IProps {
  detail: ManagementNodesStatus;
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
  refetch?: Function;
  isSingleNode?: boolean;
  version?: string;
}

const BasicInfo: React.FC<IProps> = ({
  detail,
  onCollapseChange,
  collapsed,
  isSingleNode = false,
  version,
}) => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  const { mnStatusMap } = useMnStatusMap();
  const { serverStatusMap } = useServerStatusMap();
  const canGotoMnops = hasAuth({
    type: "action",
    authKey: "goto.mnops",
    resource: "mn.monitoring",
  });

  const nodeDetail = detail.nodes?.[0];
  const hasError = nodeDetail?.error;

  const list = React.useMemo<Array<ListItem>>(() => {
    const currentHostname = window.location.hostname;

    if (!nodeDetail) {
      return [];
    }

    if (isSingleNode) {
      const singleNodeStatus = nodeDetail?.managementsNodeStatus;
      return [
        {
          label: intl.formatMessage({
            id: "manageNodeIp",
            defaultMessage: "MN IP",
          }),
          value: <Text>{nodeDetail?.ip || "-"}</Text>,
        },
        {
          label: intl.formatMessage({
            id: "virtualization.mnMonitoring.field.mnStatus",
            defaultMessage: "Node Status",
          }),
          value: (
            <Tag
              color={mnStatusMap[singleNodeStatus || "unknown"]?.color}
              level="strong"
            >
              {mnStatusMap[singleNodeStatus || "unknown"]?.name}
            </Tag>
          ),
        },
        {
          label: intl.formatMessage({ id: "version", defaultMessage: "Version" }),
          value: <Text>{version || "-"}</Text>,
        },
      ];
    }

    const currentMnStatus = nodeDetail?.managementsNodeStatus;
    const nodeStatus = mnStatusMap?.[currentMnStatus || "unknown"]
      ? currentMnStatus
      : "unknown";
    const isCurrentNode = nodeDetail?.ip === currentHostname;
    const vip = detail.vip || "";
    const isVipLogin = currentHostname === vip;

    const baseList: Array<ListItem> = [
      {
        label: intl.formatMessage({
          id: "VIP",
          defaultMessage: "VIP",
        }),
        value: (() => {
          const ownsVip = nodeDetail?.ownsVip;
          if (!ownsVip || !vip) {
            return <Text>-</Text>;
          }
          if (isVipLogin) {
            return <Text>{vip}</Text>;
          }
          return (
            <a
              href={`${window.location.protocol}//${vip}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {vip}
            </a>
          );
        })(),
      },
      {
        label: intl.formatMessage({
          id: "manageNodeIp",
          defaultMessage: "MN IP",
        }),
        value: (
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Text>{nodeDetail?.ip}</Text>
            {isCurrentNode && (
              <Tag size="small" round level="weak">
                {intl.formatMessage({
                  id: "current.node",
                  defaultMessage: "Current",
                })}
              </Tag>
            )}
            {nodeDetail?.ip && canGotoMnops && (
              <a
                href={`http://${nodeDetail.ip}:14300`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginLeft: "auto" }}
              >
                {intl.formatMessage({
                  id: "virtualization.mn.monitoring.goto.mnops",
                  defaultMessage: "Go to MN Ops",
                })}
              </a>
            )}
          </span>
        ),
      },
      {
        label: intl.formatMessage({
          id: "virtualization.mnMonitoring.field.mnStatus",
          defaultMessage: "Node Status",
        }),
        value: (
          <Tag
            color={mnStatusMap[nodeStatus || "unknown"]?.color}
            level="strong"
          >
            {mnStatusMap[nodeStatus || "unknown"]?.name}
          </Tag>
        ),
      },
      {
        label: intl.formatMessage({
          id: "virtualization.mnMonitoring.field.server.gateway.ip.reachable",
          defaultMessage: "Arbiter Gateway Reachable",
        }),
        value: serverStatusMap[`${nodeDetail.gatewayReachable}`],
      },
      {
        label: intl.formatMessage({
          id: "virtualization.mnMonitoring.field.peer.management.node.reachable",
          defaultMessage: "Peer MN Reachable",
        }),
        value: serverStatusMap[`${nodeDetail.peerReachable}`],
      },
      {
        label: intl.formatMessage({
          id: "virtualization.mnMonitoring.field.vip.reachable",
          defaultMessage: "VIP Reachable",
        }),
        value: serverStatusMap[`${nodeDetail.vipReachable}`],
      },
      {
        label: intl.formatMessage({
          id: "virtualization.mnMonitoring.field.database.status",
          defaultMessage: "Database Status",
        }),
        value: serverStatusMap[getDatabaseStatus(nodeDetail.databaseStatus)],
      },
      {
        label: intl.formatMessage({
          id: "virtualization.mnMonitoring.field.ha.status",
          defaultMessage: "HA Status",
        }),
        value: serverStatusMap[`${nodeDetail.haMonitorStatus}`],
      },
      {
        label: intl.formatMessage({
          id: "virtualization.mnMonitoring.field.keepalived.status",
          defaultMessage: "Keepalived Status",
        }),
        value: serverStatusMap[`${nodeDetail.keepalivedStatus}`],
      },
    ];

    return baseList;
  }, [
    intl,
    detail,
    isSingleNode,
    version,
    mnStatusMap,
    serverStatusMap,
    nodeDetail,
  ]);

  const getTitle = () => {
    if (isSingleNode) {
      return intl.formatMessage({
        id: "virtualization.mn.monitoring.single.node.title",
        defaultMessage: "MN Info",
      });
    }
    return nodeDetail?.ownsVip
      ? intl.formatMessage({
          id: "virtualization.mn.monitoring.primary.node.title",
          defaultMessage: "Active MN",
        })
      : intl.formatMessage({
          id: "virtualization.mn.monitoring.secondary.node.title",
          defaultMessage: "Standby MN",
        });
  };

  return (
    <>
      <DraggableCard
        title={getTitle()}
        isList
        onCollapseChange={onCollapseChange}
        collapsed={collapsed}
      >
        {hasError ? (
          <NodeEmptyState
            description={intl.formatMessage({
              id: "node.status.unreachable",
              defaultMessage: "No data. Check the MN status.",
            })}
          />
        ) : (
          <List list={list} bordered={false} />
        )}
      </DraggableCard>
    </>
  );
};

export default BasicInfo;
