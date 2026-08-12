import { useLazyQuery } from "@apollo/client";
import { Icon } from "@zstack/icon";
import { queryClusterForZSVCreateInstance } from "@zstack/virtualization-resource/src/gql/cluster.gql";
import { queryHostForZSVCreateInstance } from "@zstack/virtualization-resource/src/gql/host.gql";
import RunPathTree from "@zstack/virtualization-resource/src/pages/vm/create/basic-config/run-position/modal-tree-select/tree";
import { Spin, Text } from "@zstack/zsphere-components";
import { DialogWeak } from "@zstack/zsphere-design-biz";
import { HostState, Op, HostStatus } from "@zstack/zsphere-types";
import { Button, Modal } from "antd";
import classNames from "classnames";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import "./style.module.less";
import { useIntl } from "react-intl";

interface ITreeNode {
  uuid: string;
  name: string;
  type: "cluster" | "host";
  parentUuid?: string;
  children?: ITreeNode[];
  key?: string;
  title?: React.ReactNode | string;
  disabled?: boolean;
  tooltip?: string;
  attr?: any;
}

interface IProps {
  value?: ITreeNode[];
  onChange?: (val: ITreeNode[]) => void;
  source?: any;
  width?: number;
  lockedHostUuid?: string;
}

const baseCls = "zstack-virtualization-modal-tree-select";

const RunLocationSelect: React.FC<IProps> = ({
  value,
  onChange,
  source,
  lockedHostUuid,
}) => {
  const intl = useIntl();
  const [runPathTreeData, setRunPathTreeData] = useState<ITreeNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [visible, setVisible] = useState<boolean>(false);
  const [tempSelected, setTempSelected] = useState<ITreeNode[]>([]);
  const [warningVisible, setWarningVisible] = useState(false);
  const [warningType, setWarningType] = useState<"cluster" | "host">("cluster");
  const [warningContent, setWarningContent] = useState<string>("");

  const [getClusters, { data: clusterData }] = useLazyQuery(
    queryClusterForZSVCreateInstance,
    { fetchPolicy: "no-cache" },
  );
  const [getHosts, { data: hostData }] = useLazyQuery(
    queryHostForZSVCreateInstance,
    { fetchPolicy: "no-cache" },
  );

  const currentDisplayName = useMemo(() => {
    const name = value?.[0]?.name;
    return (
      name ??
      intl.formatMessage({
        id: "primaryStorage.registerVm.runLocation.placeholder",
        defaultMessage: "Select a location.",
      })
    );
  }, [intl, value]);

  // 拉取集群和主机数据
  useEffect(() => {
    const {
      __typename,
      zoneUuid: sourceZoneUuid,
      uuid: sourceUuid,
    } = source || {};
    const _zoneUuid = sourceZoneUuid;

    if (!_zoneUuid) {
      return;
    }

    setLoading(true);
    const fetchClusterAndHosts = (
      clusterConditions: any,
      hostConditions: any,
    ) => {
      getClusters({ variables: { conditions: clusterConditions } });
      getHosts({ variables: { conditions: hostConditions } });
    };

    if (__typename === "PrimaryStorageVO") {
      fetchClusterAndHosts(
        [
          { key: "zoneUuid", op: Op.eq, value: _zoneUuid },
          { key: "primaryStorage.uuid", op: Op.eq, value: sourceUuid },
          { key: "hasL3Network", op: Op.eq, value: true },
        ],
        [
          { key: "zoneUuid", op: Op.eq, value: _zoneUuid },
          {
            key: "cluster.primaryStorage.uuid",
            op: Op.eq,
            value: sourceUuid,
          },
        ],
      );
    } else if (__typename === "Cluster") {
      fetchClusterAndHosts(
        [
          { key: "zoneUuid", op: Op.eq, value: _zoneUuid },
          { key: "uuid", op: Op.eq, value: sourceUuid },
        ],
        [
          { key: "zoneUuid", op: Op.eq, value: _zoneUuid },
          { key: "clusterUuid", op: Op.eq, value: sourceUuid },
        ],
      );
    } else {
      fetchClusterAndHosts(
        [
          { key: "zoneUuid", op: Op.eq, value: _zoneUuid },
          { key: "hasL3Network", op: Op.eq, value: true },
        ],
        [{ key: "zoneUuid", op: Op.eq, value: _zoneUuid }],
      );
    }
  }, [source, getClusters, getHosts]);

  useEffect(() => {
    if (clusterData && hostData) {
      const clusterList =
        clusterData?.clusterList?.list.filter((t: any) => t.hostNum !== 0) ??
        [];
      const hostsList = hostData?.hostList?.list ?? [];

      const getHasConnectedHost = (clusterUuid: string) =>
        hostsList.some(
          (h: any) =>
            h.cluster?.uuid === clusterUuid &&
            h.status === "Connected" &&
            h.state === "Enabled",
        );

      const clusterTreeItems = clusterList.map((t: any) => ({
        uuid: t.uuid,
        key: t.uuid,
        name: t.name,
        title: t.name,
        type: "cluster",
        parentUuid: "",
        attr: {
          ...t,
          hasConnectedHost: getHasConnectedHost(t.uuid),
        },
      }));

      const hostTreeItems = hostsList.map((t: any) => ({
        uuid: t.uuid,
        key: t.uuid,
        name: t.name,
        title: t.name,
        type: "host",
        parentUuid: t.cluster?.uuid,
        attr: t,
      }));

      const list2tree = (data: any[], pid: string): ITreeNode[] => {
        const result: ITreeNode[] = [];
        for (const node of data) {
          if (node.parentUuid === pid) {
            const children = list2tree(data, node.uuid);
            if (children.length) {
              node.children = children;
            }
            result.push(node);
          }
        }
        return result;
      };

      // 本地存储锁定主机后，只展示被锁定的主机节点
      if (lockedHostUuid) {
        const lockedHost = hostsList.find(
          (h: any) => h.uuid === lockedHostUuid,
        );
        if (lockedHost) {
          onChange?.([lockedHost]);
        }
        setRunPathTreeData([]);
        setLoading(false);
        return;
      }

      const treeData = list2tree(
        clusterTreeItems.concat(hostTreeItems),
        "",
      ) as ITreeNode[];
      setRunPathTreeData(treeData ?? []);
      setLoading(false);
    }
  }, [clusterData, hostData, lockedHostUuid]);

  // 默认回显：第一次有数据且当前没有选中值时，自动选中第一个有主机的集群
  useEffect(() => {
    if (lockedHostUuid) {
      return;
    } // 锁定时由父组件设置，不执行默认选中
    if (value && value.length > 0) {
      return;
    }
    if (!runPathTreeData.length) {
      return;
    }

    // 深度优先找到第一个包含主机子节点的集群
    const findFirstClusterWithHost = (nodes: ITreeNode[]): ITreeNode | null => {
      for (const node of nodes) {
        if (
          node.type === "cluster" &&
          node.children &&
          node.children.length > 0
        ) {
          return node;
        }
        if (node.children && node.children.length > 0) {
          const found = findFirstClusterWithHost(node.children);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };

    const firstCluster = findFirstClusterWithHost(runPathTreeData);
    if (firstCluster) {
      onChange?.([firstCluster]);
    }
  }, [onChange, runPathTreeData, value]);

  const openModal = useCallback(() => {
    if (loading || lockedHostUuid) {
      return;
    }
    setTempSelected(value ?? []);
    setVisible(true);
  }, [loading, value]);

  const closeModal = useCallback(() => {
    setVisible(false);
    setTempSelected([]);
  }, []);

  const showRestrictionWarning = useCallback(
    (type: "cluster" | "host") => {
      setWarningType(type);
      setWarningContent(
        intl.formatMessage({
          id:
            type === "cluster"
              ? "primaryStorage.registerVm.runLocation.restrict.cluster.content"
              : "primaryStorage.registerVm.runLocation.restrict.host.content",
          defaultMessage:
            type === "cluster"
              ? "所选集群下无主机可访问配置文件所在数据存储，请重新选择后重试。"
              : "所选主机不可访问配置文件所在数据存储，请重新选择后重试。",
        }),
      );
      setWarningVisible(true);
    },
    [intl],
  );

  const validateSelection = useCallback(
    async (
      selected: any,
    ): Promise<{ ok: boolean; type?: "cluster" | "host" }> => {
      if (!selected) {
        return { ok: false, type: "cluster" };
      }

      // 1. 主机：只校验连接状态为 Connected
      if (selected.__typename === "HostVO") {
        const isUsableHost =
          selected.status === HostStatus.Connected &&
          selected.state === HostState.Enabled;
        return {
          ok: isUsableHost,
          type: "host",
        };
      }

      // 2. 集群：必须存在至少一台主机满足 Connected 且 Enabled
      if (selected.__typename === "Cluster") {
        const clusterHasConnectedHost = selected?.hasConnectedHost;
        const clusterEnabled = selected?.state === "Enabled";
        return {
          ok: clusterHasConnectedHost && clusterEnabled,
          type: "cluster",
        };
      }

      return { ok: true };
    },
    [hostData],
  );

  const onOk = useCallback(async () => {
    const selected = tempSelected?.[0];
    const res = await validateSelection(selected);
    if (!res.ok) {
      showRestrictionWarning(res?.type ?? "cluster");
      return;
    }

    onChange?.([selected]);
    setVisible(false);
  }, [
    closeModal,
    onChange,
    showRestrictionWarning,
    tempSelected,
    validateSelection,
  ]);

  return (
    <>
      <div
        onClick={openModal}
        className={classNames(`${baseCls}-select-input`, {
          [`${baseCls}-select-disabled-input`]: loading || !!lockedHostUuid,
        })}
        style={{ width: 320 }}
      >
        {loading ? (
          <Spin className={classNames(`${baseCls}-select-input-spin`)} />
        ) : (
          <>
            <div className={classNames(`${baseCls}-select-input-value`)}>
              <div
                className={classNames(`${baseCls}-select-input-value-title`)}
              >
                <Text value={currentDisplayName} ellipsis />
              </div>
            </div>
            <Button
              style={{
                width: 40,
                height: 30,
                padding: "4px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon type="select" color="neutral" colorNumber={700} />
            </Button>
          </>
        )}
      </div>

      <Modal
        title={
          <span style={{ fontSize: 16, color: "##1A2736" }}>
            {intl.formatMessage({
              id: "primaryStorage.registerVm.selectRunLocation.title",
              defaultMessage: "Select Location",
            })}
          </span>
        }
        width={600}
        closeIcon={<Icon type="close" />}
        getContainer="body"
        open={visible}
        onCancel={closeModal}
        onOk={onOk}
        destroyOnClose
        className={`${baseCls}-modal`}
        zIndex={1010}
      >
        <div
          className={`${baseCls}-virtualization-modal-body`}
          style={{ display: "flex", justifyContent: "center" }}
        >
          <RunPathTree
            treeHeight={320}
            treeData={runPathTreeData as any}
            selectedKeys={
              tempSelected && tempSelected[0]?.uuid
                ? [tempSelected[0].uuid]
                : []
            }
            onSelectNode={setTempSelected}
          />
        </div>
      </Modal>

      <DialogWeak
        visible={warningVisible}
        setVisible={setWarningVisible}
        title={intl.formatMessage({
          id:
            warningType === "cluster"
              ? "primaryStorage.registerVm.runLocation.restrict.cluster.title"
              : "primaryStorage.registerVm.runLocation.restrict.host.title",
          defaultMessage:
            warningType === "cluster" ? "无法选择当前集群" : "无法选择当前主机",
        })}
        description={warningContent}
        onConfirm={() => setWarningVisible(false)}
        onCancel={() => setWarningVisible(false)}
        zIndex={2000}
      />
    </>
  );
};

export default RunLocationSelect;
