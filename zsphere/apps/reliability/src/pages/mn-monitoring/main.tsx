import { gql, useQuery } from "@apollo/client";
import { Alert, Button, Tooltip } from "@zstack/design";
import { Icon } from "@zstack/icon";
import { useAuth } from "@zstack/zsphere-components";
import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { Spin } from "@zstack/zsphere-components";
import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import { useAction } from "@zstack/zsphere-hooks";
import { ProfileType } from "@zstack/zsphere-types";
import type { ManagementNodesStatus } from "@zstack/zsphere-types/graphql";
import _ from "lodash-es";
import React, { useCallback, useMemo } from "react";
import { useIntl } from "react-intl";

import BasicInfo from "./basic-info";

import style from "./style.module.less";

const GET_MANAGEMENT_NODES_STATUS = gql`
  query getManagementNodesStatus {
    getManagementNodesStatus {
      nodes {
        ip
        managementsNodeStatus
        databaseStatus
        gatewayIp
        gatewayReachable
        haMonitorStatus
        keepalivedStatus
        ownsVip
        peerReachable
        slaveIoRunning
        slaveSqlRunning
        uiStatus
        vipReachable
        error {
          causes
          code
          description
          details
        }
      }
      vip
      uiHttpPath
    }
  }
`;

const GET_MN_MONITORING_VERSION = gql`
  query getMnMonitoringVersion {
    getAboutLicenseInfo {
      versionOnUI
    }
  }
`;

const Main: React.FC = () => {
  const intl = useIntl();
  const _doAction = useAction();
  const { hasAuth } = useAuth();
  const canGotoMnops = hasAuth({
    type: "action",
    authKey: "goto.mnops",
    resource: "mn.monitoring",
  });

  const {
    loading,
    data: managementNodesStatusData,
    refetch: _refetch,
  } = useQuery<{
    getManagementNodesStatus: ManagementNodesStatus;
  }>(GET_MANAGEMENT_NODES_STATUS);

  const { data: versionData } = useQuery<{
    getAboutLicenseInfo?: { versionOnUI?: string };
  }>(GET_MN_MONITORING_VERSION);

  const version = versionData?.getAboutLicenseInfo?.versionOnUI;
  const managementNodesData =
    managementNodesStatusData?.getManagementNodesStatus;

  const isSingle = !managementNodesData?.vip;

  const sourceList: Array<ManagementNodesStatus> = useMemo(() => {
    if (!managementNodesData?.nodes) {
      return [];
    }

    return managementNodesData.nodes.map((node) => ({
      nodes: [node],
      vip: managementNodesData?.vip,
      uiHttpPath: managementNodesData?.uiHttpPath,
    }));
  }, [managementNodesData]);

  const [_showConfirm, setShowConfirm] = React.useState(false);
  const [_showError, _setShowError] = React.useState(false);

  const dataSet = React.useMemo(() => {
    return _.reduce(
      sourceList,
      (obj, current, index) => {
        const nodeIp = current?.nodes?.[0]?.ip;
        const resourceKey = `${nodeIp || index}`;

        if (!obj[resourceKey]) {
          obj[resourceKey] = {
            resourceKey,
            x: index,
            y: index,
            node: (props: Omit<IDraggableCardProps, "detail">) => (
              <BasicInfo
                detail={current}
                isSingleNode={isSingle}
                version={version}
                {...props}
              />
            ),
          };
        }

        return obj;
      },
      {} as any,
    );
  }, [sourceList, isSingle, version]);

  // 只有访问的是备管理节点时才禁用
  // const currentNodeOwnsVip = useMemo(() => {
  //   const currentHostname = window.location.hostname
  //   const currentNode = managementNodesData?.nodes?.find(node => node.ip === currentHostname)
  //   return !currentNode || currentNode.ownsVip
  // }, [managementNodesData])

  const handleSwitchNode = useCallback(() => {
    setShowConfirm(true);
  }, []);

  // const onOk = () => {
  //   doAction({
  //     mutation: DEMOTE_MANAGEMENT_NODE,
  //     payload: {},
  //     name: intl.formatMessage({
  //       id: 'virtualization.mn.monitoring.switch.node',
  //       defaultMessage: '切换主备管理节点'
  //     }),
  //     type: 'ManagementNode',
  //     total: 1,
  //     onFinish: () => {
  //       refetch()
  //     }
  //   })
  //   setShowConfirm(false)
  // }

  const handleAddNode = useCallback(() => {
    const primaryNode = managementNodesData?.nodes?.find(
      (node) => node.ownsVip,
    );
    const nodeIp = primaryNode?.ip || managementNodesData?.nodes?.[0]?.ip;

    if (nodeIp) {
      window.open(
        `http://${window.location.hostname}:14300`,
        "_blank",
        "noopener,noreferrer",
      );
    }
  }, [managementNodesData]);

  if (loading) {
    return <Spin />;
  }

  // 单管理节点环境
  if (isSingle) {
    return (
      <div className={style["main-container"]}>
        <Alert variant="info" closable className={style["single-alert"]}>
          {intl.formatMessage({
            id: "virtualization.mn.monitoring.single.node.alert",
            defaultMessage:
              "To ensure high availability of management services, go to MN Ops to set up management node HA. If either node fails, failover is triggered within seconds, preventing service disruption due to a single point of failure.",
          })}
        </Alert>
        {canGotoMnops && (
          <Button
            size="md"
            variant="secondary"
            onClick={handleAddNode}
            className={style["node-button"]}
          >
            {intl.formatMessage({
              id: "virtualization.mn.monitoring.add.node",
              defaultMessage: "Go to MN Ops",
            })}
            <Icon style={{ marginLeft: 6 }} type="external-link" />
          </Button>
        )}
        <ResponsiveDndCardsLayout
          profileType={ProfileType.OverviewLayoutConfig}
          resourceType="virtualization-monitoring-om-mn-monitoring"
          cols={1}
          dataSet={dataSet}
        />
      </div>
    );
  }

  return (
    <div className={style["main-container-double"]}>
      <Tooltip
        title={intl.formatMessage({
          id: "virtualization.mn.monitoring.switch.disabled.tooltips",
          defaultMessage: "Go to the active management node's MN Ops to perform the switching operation.",
        })}
      >
        <span style={{ display: "inline-block" }}>
          <Button
            size="md"
            variant="secondary"
            onClick={handleSwitchNode}
            className={style["node-button"]}
            disabled={true}
          >
            <Icon style={{ marginRight: 6 }} type="swap" />
            {intl.formatMessage({
              id: "virtualization.mn.monitoring.switch.node",
              defaultMessage: "Switch Active/Standby MNs",
            })}
          </Button>
        </span>
      </Tooltip>
      <ResponsiveDndCardsLayout
        profileType={ProfileType.OverviewLayoutConfig}
        resourceType="virtualization-monitoring-om-mn-monitoring"
        cols={2}
        dataSet={dataSet}
      />
      {/* <DialogWeak
        visible={showError}
        setVisible={setShowError}
        alertMessage={intl.formatMessage({
          id: 'virtualization.mn.monitoring.switch.error',
          defaultMessage: '无法切换主备管理节点'
        })}
        alertType="warning"
        onOk={() => setShowError(false)}
        onCancel={() => setShowError(false)}
        cancelable={false}
      >
        {intl.formatMessage({
          id: 'virtualization.mn.monitoring.switch.error.description',
          defaultMessage: ' 切换主备管理节点时，请确保主备管理节点状态、仲裁网关状态连接正常。'
        })}
      </DialogWeak>
      <DialogWeak
        visible={showConfirm}
        setVisible={setShowConfirm}
        alertMessage={intl.formatMessage({
          id: 'virtualization.mn.monitoring.switch.confirm',
          defaultMessage: '确定要切换主备管理节点？'
        })}
        onOk={onOk}
        onCancel={() => setShowConfirm(false)}
        needConfirm
        alertType="warning"
      >
        {intl.formatMessage({
          id: 'virtualization.mn.monitoring.switch.confirm.description',
          defaultMessage: ' 切换主备管理节点，可能会造成数据库不同步等风险，请谨慎操作。'
        })}
      </DialogWeak> */}
    </div>
  );
};

export default Main;
