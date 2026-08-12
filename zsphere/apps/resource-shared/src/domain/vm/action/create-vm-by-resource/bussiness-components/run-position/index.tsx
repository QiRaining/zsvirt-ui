import { gql, useLazyQuery } from "@apollo/client";
import { Form } from "@zstack/zsphere-components";
import type { FormCreateType, IQuery } from "@zstack/zsphere-types";
import { HostState, Op } from "@zstack/zsphere-types";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";

import ModalTreeSelect from "./modal-tree-select";

interface IProps {
  hideTag?: boolean;
  hideDescription?: boolean;
  hideQuantity?: boolean;
  setFields?: Function;
  formCreateType?: FormCreateType;
  form: any;
  zoneUuid: string;
  source: any;
  relateSource?: any; //这里实际上是模板
}

const queryClusterForZSVCreateInstance = gql`
  query queryClusterForZSVCreateInstance(
    $start: Int
    $limit: Int
    $type: ClusterQueryType
    $sortBy: String
    $sortDirection: SortDirectionValidValues
    $conditions: [Condition!]
    $extraConditions: [Condition!]
  ) {
    clusterList(
      start: $start
      limit: $limit
      type: $type
      sortBy: $sortBy
      sortDirection: $sortDirection
      conditions: $conditions
      extraConditions: $extraConditions
      replyWithCount: true
    ) {
      total
      list {
        name
        uuid
        architecture
        clusterKVMCpuModel
        type
        state
        hypervisorType
        hostNum
        zoneUuid
        resourceConfigValue {
          hostCpuOverProvisioningRatio
          mevocoOverProvisioningMemory
          kvmIgnoreMsrs
          premiumClusterEnableZeroCopy
          kvmReservedMemory
          premiumClusterHugepageEnable
          haVmHaLevel
          vmVmHaAcrossClusters
          vmEmulateHyperV
          vmVideoType
          kvmAutoSetVmNicMultiqueue
        }
      }
    }
  }
`;

const queryHostForZSVCreateInstance = gql`
  query queryHostForZSVCreateInstance(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $start: Int
    $limit: Int
    $topNumber: Int
    $fields: [String!]
    $type: HostQueryType
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    hostList(
      conditions: $conditions
      extraConditions: $extraConditions
      start: $start
      fields: $fields
      limit: $limit
      topNumber: $topNumber
      type: $type
      sortBy: $sortBy
      sortDirection: $sortDirection
      replyWithCount: true
    ) {
      list {
        name
        uuid
        architecture
        hypervisorType
        state
        status
        hostNodeInfo {
          nodeType
        }
        cluster {
          name
          uuid
          clusterKVMCpuModel
          resourceConfigValue {
            vmVideoType
            haVmHaLevel
            vmVmHaAcrossClusters
            vmEmulateHyperV
            kvmAutoSetVmNicMultiqueue
          }
        }
        hostSystemInfo {
          hostCpuModelName
          cpuGHz
        }
        globalConifg {
          memoryOverProvisioning
          overProvisioningTotalMemory
          overProvisioningAvailableMemory
          reservedMemory
          availableCpuMemoryCapacity
          availableCpu
          availableMemory
          managedCpuNum
          totalCpu
          totalMemory
        }
      }
      total
    }
  }
`;

const { Item } = Form;

const list2tree = (data: any[], pid: string) => {
  const result = [];
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

//实际上这里只需要传source即可
const RunInPosition: React.FC<IProps> = ({
  form,
  zoneUuid,
  source,
  relateSource,
}) => {
  const intl = useIntl();
  const [runPathName, setRunPathName] = useState("");
  const [loading, setLoading] = useState(true);
  const [runPathTreeData, setRunPathTreeData] = useState<any[]>([]);

  const templateHasLocalStorage = useMemo(() => {
    if (!relateSource) {
      // 不是模板
      return false;
    }
    const volumes = relateSource[0]?.allVolumes ?? [];
    return volumes.some(
      (volume: any) => volume.primaryStorage?.type === "LocalStorage",
    );
  }, [relateSource]);

  const [getClusters, { data: clusterData }] = useLazyQuery(
    queryClusterForZSVCreateInstance,
    {
      fetchPolicy: "no-cache",
    },
  );

  const [getHosts, { data: hostData }] = useLazyQuery(
    queryHostForZSVCreateInstance,
    {
      fetchPolicy: "no-cache",
    },
  );

  const fetchClusterAndHosts = useCallback(
    (
      clusterConditions: IQuery["conditions"],
      hostConditions: IQuery["conditions"],
    ) => {
      getClusters({ variables: { conditions: clusterConditions } });
      getHosts({ variables: { conditions: hostConditions } });
    },
    [getClusters, getHosts],
  );

  useEffect(() => {
    // Cluster和PrimaryStorage 都是自带zoneUuid
    const {
      __typename,
      zoneUuid: sourceZoneUuid,
      uuid: sourceUuid,
    } = source || {};

    const _zoneUuid = sourceZoneUuid || zoneUuid;

    if (__typename === "PrimaryStorageVO") {
      setLoading(true);
      fetchClusterAndHosts(
        [
          { key: "zoneUuid", op: Op.eq, value: _zoneUuid },
          { key: "primaryStorage.uuid", op: Op.eq, value: sourceUuid },
          { key: "hasL3Network", op: Op.eq, value: true },
        ],
        [
          { key: "zoneUuid", op: Op.eq, value: _zoneUuid },
          { key: "cluster.primaryStorage.uuid", op: Op.eq, value: sourceUuid },
          { key: "status", op: Op.in, values: ["Connected"] },
          { key: "state", op: Op.eq, value: HostState.Enabled },
        ],
      );
    } else if (__typename === "Cluster") {
      setLoading(true);
      fetchClusterAndHosts(
        [
          { key: "zoneUuid", op: Op.eq, value: _zoneUuid },
          { key: "uuid", op: Op.eq, value: sourceUuid },
        ],
        [
          { key: "zoneUuid", op: Op.eq, value: _zoneUuid },
          { key: "clusterUuid", op: Op.eq, value: sourceUuid },
          { key: "status", op: Op.in, values: ["Connected"] },
          { key: "state", op: Op.eq, value: HostState.Enabled },
        ],
      );
    } else if (zoneUuid && !["HostVO", "Cluster"].includes(__typename)) {
      setLoading(true);
      const clusterConditionArr = [
        { key: "zoneUuid", op: Op.eq, value: zoneUuid },
        { key: "hasL3Network", op: Op.eq, value: true },
      ];
      if (relateSource) {
        clusterConditionArr.push({
          key: "primaryStorage.uuid",
          op: Op.eq,
          value: relateSource?.[0]?.primaryStorage?.uuid,
        });
      }
      fetchClusterAndHosts(clusterConditionArr, [
        { key: "zoneUuid", op: Op.eq, value: zoneUuid },
        { key: "status", op: Op.in, values: ["Connected"] },
        { key: "state", op: Op.eq, value: HostState.Enabled },
      ]);
    } else if (__typename === "HostVO") {
      setLoading(false);
      setRunPathName(source?.name);
    } else if (__typename === "VmTemplate") {
      setLoading(true);

      const clusterConditionArr = [
        { key: "zoneUuid", op: Op.eq, value: zoneUuid },
        { key: "hasL3Network", op: Op.eq, value: true },
      ];

      if (source?.primaryStorage?.type === "Ceph") {
        clusterConditionArr.push({
          key: "primaryStorage.uuid",
          op: Op.eq,
          value: source?.primaryStorage.uuid,
        });
      }

      fetchClusterAndHosts(clusterConditionArr, [
        { key: "zoneUuid", op: Op.eq, value: zoneUuid },
        { key: "status", op: Op.in, values: ["Connected"] },
        { key: "state", op: Op.eq, value: HostState.Enabled },
      ]);
    } else if (__typename === "BackupData") {
      setLoading(true);
      fetchClusterAndHosts(
        [{ key: "hasL3Network", op: Op.eq, value: true }],
        [
          { key: "status", op: Op.in, values: ["Connected"] },
          { key: "state", op: Op.eq, value: HostState.Enabled },
        ],
      );
    }
  }, [zoneUuid, source, relateSource, fetchClusterAndHosts]);

  useEffect(() => {
    if (clusterData && hostData) {
      if (source?.__typename !== "HostVO" && !templateHasLocalStorage) {
        const clusterList =
          clusterData?.clusterList?.list.filter((t: any) => t.hostNum !== 0) ??
          [];
        const hostsList = hostData?.hostList?.list ?? [];

        const currentRunPath = form.getFieldValue("runPath");
        if (!currentRunPath && clusterList?.length > 0) {
          form.setFields([
            {
              name: "runPath",
              value: [clusterList[0]],
              touched: false,
            },
          ]);
        }

        const clusterTreeItems = clusterList.map((t: any) => {
          return {
            uuid: t.uuid,
            key: t.uuid,
            name: t.name,
            title: t.name,
            type: "cluster",
            parentUuid: "",
            attr: t,
          };
        });

        const hostTreeItems = hostsList.map((t: any) => {
          return {
            uuid: t.uuid,
            key: t.uuid,
            name: t.name,
            title: t.name,
            type: "host",
            parentUuid: t.cluster?.uuid,
            attr: t,
          };
        });

        const treeData =
          list2tree(clusterTreeItems.concat(hostTreeItems), "") ?? [];

        setRunPathTreeData(treeData);
      }
      setLoading(false);
    }
  }, [clusterData, hostData, source, templateHasLocalStorage]);

  useEffect(() => {
    if (relateSource) {
      let runPath = "";
      //
      if (templateHasLocalStorage) {
        runPath =
          relateSource?.[0]?.host?.name || relateSource?.[0]?.lastHost?.name;
        setRunPathName(runPath);
      }
    }
  }, [relateSource, templateHasLocalStorage]);

  return (
    <Item
      label={intl.formatMessage({
        id: "virtualization.create.instance.run.path",
        defaultMessage: "Location",
      })}
      name="runPath"
    >
      {runPathName || (
        <ModalTreeSelect
          treeData={runPathTreeData}
          loading={loading}
          modalWidth={800}
          title={intl.formatMessage({
            id: "virtualization.create.instance.run.path.select.modal.title",
            defaultMessage: "Select Location",
          })}
        />
      )}
    </Item>
  );
};

export default React.memo(RunInPosition);
