import { useQuery, gql } from "@apollo/client";
import { List } from "@zstack/zsphere-components";
import { DraggableCard, useAuth } from "@zstack/zsphere-components";
import type { ManagementNode } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";

import style from "./style.module.less";

const MANAGEMENT_NODE_LIST = gql`
  query managementNodeList {
    managementNodeList {
      total
      list {
        dbStatus
        vip
        ip
        gwReachable
        mnStatus
        ownsVip
        peerReachable
        slaveIoRunning
        slaveSqlRuning
        timeToSyncDB
        vipReachable
      }
    }
  }
`;

interface IProps {
  onCollapseChange?: (e: boolean) => void;
  collapsed?: boolean;
}

const VmHardware: React.FC<IProps> = React.memo(
  ({ onCollapseChange, collapsed = false }) => {
    const intl = useIntl();
    const navigate = useNavigate();

    const { data } = useQuery(MANAGEMENT_NODE_LIST);

    const { hasAuth } = useAuth();

    const hasMnInfoAuth = hasAuth({
      resource: "virtualization.mn.monitoring",
      type: "view",
      authKey: "list",
    });

    const nodelist: ManagementNode[] = data?.managementNodeList?.list ?? [];

    const mnInfo = useMemo(() => {
      if (!nodelist?.length) {
        return;
      }
      const result = {
        state: nodelist.every((it) => it.mnStatus === "running")
          ? "active"
          : "exception",
        vip: nodelist?.find((it) => it.ownsVip)?.vip,
        ips: nodelist,
      };
      return result;
    }, [nodelist]);

    const list = useMemo(() => {
      const map: any = {
        active: {
          name: intl.formatMessage({ id: "normal", defaultMessage: "Normal" }),
          color: "#5ACA49",
        },
        exception: {
          name: intl.formatMessage({ id: "abnormal", defaultMessage: "Abnormal" }),
          color: "#FF9000",
        },
      };

      const getIpDom = (node?: ManagementNode) => {
        if (!node) {
          return;
        }
        if (node.mnStatus === "running") {
          return node.ip;
        }
        return (
          <span className={style["ip-exception"]}>
            {node.ip}(
            {node.mnStatus === "stopped"
              ? intl.formatMessage({ id: "offline", defaultMessage: "Offline" })
              : intl.formatMessage({ id: "unknown", defaultMessage: "Unknown" })}
            )
          </span>
        );
      };

      return [
        {
          label: intl.formatMessage({
            id: "ha.state",
            defaultMessage: "Available status",
          }),
          value: mnInfo?.state && (
            <>
              {" "}
              <span
                className={style.dot}
                style={{ backgroundColor: map?.[mnInfo?.state]?.color }}
              />{" "}
              {map?.[mnInfo?.state]?.name}
            </>
          ),
        },
        {
          label: "VIP",
          value: mnInfo?.vip,
          copyable: true,
        },
        {
          label: "MN1",
          value: getIpDom(mnInfo?.ips?.[0] ?? undefined),
          copyable: true,
        },
        {
          label: "MN2",
          value: getIpDom(mnInfo?.ips?.[1] ?? undefined),
          copyable: true,
        },
      ];
    }, [mnInfo, intl]);

    return (
      <DraggableCard
        title={intl.formatMessage({
          id: "management.node",
          defaultMessage: "Management Node",
        })}
        onCollapseChange={onCollapseChange}
        collapsed={collapsed}
        titleActions={
          hasMnInfoAuth
            ? [
                {
                  icon: "external-link",
                  tooltip: intl.formatMessage({
                    id: "management.node.monitor",
                    defaultMessage: "MN Monitoring",
                  }),
                  onClick: () =>
                    navigate("/virtualization-reliability/mn-monitoring"),
                },
              ]
            : []
        }
      >
        <List list={list} bordered={false} />
      </DraggableCard>
    );
  },
);

VmHardware.displayName = "VmHardware";

export default VmHardware;
