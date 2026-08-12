import { useLazyQuery } from "@apollo/client";
import { Op, HostState } from "@zstack/zsphere-types";
import { Zone } from "@zstack/zsphere-types/graphql";
import type { FormInstance } from "antd/es/form";
import { useCallback, useEffect, useState } from "react";

import {
  getZoneList,
  queryClusterForZSVCreateInstance,
  queryHostForZSVCreateInstance,
} from "./queries";

export interface TreeNode {
  uuid: string;
  key: string;
  name: string;
  title: string;
  value: string;
  type: "cluster" | "host";
  parentUuid: string;
  attr: Record<string, unknown>;
  children?: TreeNode[];
}

type LazyQueryTrigger = (options: {
  variables: {
    conditions: Array<{
      key: string;
      op: string;
      value?: string;
      values?: string[];
    }>;
  };
}) => void;

const fetchClusterAndHostsByZone = (
  zoneUuid: string,
  getClusters: LazyQueryTrigger,
  getHosts: LazyQueryTrigger,
) => {
  getClusters({
    variables: {
      conditions: [{ key: "zoneUuid", op: Op.eq, value: zoneUuid }],
    },
  });
  getHosts({
    variables: {
      conditions: [
        { key: "zoneUuid", op: Op.eq, value: zoneUuid },
        { key: "status", op: Op.in, values: ["Connected"] },
        { key: "state", op: Op.eq, value: HostState.Enabled },
      ],
    },
  });
};

const list2tree = (data: TreeNode[], pid: string): TreeNode[] => {
  const result: TreeNode[] = [];
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

interface UseZoneClusterHostResult {
  zoneList: Zone[];
  runPathTreeData: TreeNode[];
  loading: boolean;
  handleDataCenterChange: (zoneUuid: string) => void;
}

export function useZoneClusterHost(
  form: FormInstance,
  visible: boolean,
): UseZoneClusterHostResult {
  const [loading, setLoading] = useState(true);
  const [runPathTreeData, setRunPathTreeData] = useState<TreeNode[]>([]);
  const [zoneList, setZoneList] = useState<Zone[]>([]);

  const [getClusters, { data: clusterData }] = useLazyQuery(
    queryClusterForZSVCreateInstance,
    { fetchPolicy: "no-cache" },
  );

  const [getHosts, { data: hostData }] = useLazyQuery(
    queryHostForZSVCreateInstance,
    { fetchPolicy: "no-cache" },
  );

  const [fetchZoneList] = useLazyQuery(getZoneList, {
    fetchPolicy: "no-cache",
    notifyOnNetworkStatusChange: true,
    variables: {
      sortBy: "createDate",
      sortDirection: "asc",
    },
    errorPolicy: "ignore",
    onCompleted(data) {
      const list = data?.zoneList?.list ?? [];
      const transformList = list?.map((zone: Zone) => ({
        name: zone?.name,
        uuid: zone?.uuid,
      }));
      setZoneList(transformList);

      if (transformList.length > 0) {
        const firstZoneUuid = transformList[0].uuid;
        form.setFieldsValue({ zoneUuid: firstZoneUuid });
        setLoading(true);
        fetchClusterAndHostsByZone(firstZoneUuid, getClusters, getHosts);
      }
    },
  });

  useEffect(() => {
    if (clusterData && hostData) {
      const clusterList =
        clusterData?.clusterList?.list.filter(
          (t: Record<string, unknown>) => t.hostNum !== 0,
        ) ?? [];
      const hostsList = hostData?.hostList?.list ?? [];

      const clusterTreeItems: TreeNode[] = clusterList.map(
        (t: Record<string, unknown>) => ({
          uuid: t.uuid as string,
          key: t.uuid as string,
          name: t.name as string,
          title: t.name as string,
          value: t.name as string,
          type: "cluster" as const,
          parentUuid: "",
          attr: t,
        }),
      );

      const hostTreeItems: TreeNode[] = hostsList.map(
        (t: Record<string, unknown> & { cluster?: { uuid: string } }) => ({
          uuid: t.uuid as string,
          key: t.uuid as string,
          name: t.name as string,
          title: t.name as string,
          value: t.name as string,
          type: "host" as const,
          parentUuid: t.cluster?.uuid ?? "",
          attr: t,
        }),
      );

      const treeData =
        list2tree(clusterTreeItems.concat(hostTreeItems), "") ?? [];
      setRunPathTreeData(treeData);
      setLoading(false);
    }
  }, [clusterData, hostData]);

  useEffect(() => {
    if (visible) {
      fetchZoneList();
    }
  }, [visible]);

  const handleDataCenterChange = useCallback(
    (zoneUuid: string) => {
      form.setFieldsValue({
        runPath: undefined,
        storePath: undefined,
        migrationNetwork: undefined,
        ipv4Address: undefined,
      });
      setLoading(true);
      fetchClusterAndHostsByZone(zoneUuid, getClusters, getHosts);
    },
    [form, getClusters, getHosts],
  );

  return { zoneList, runPathTreeData, loading, handleDataCenterChange };
}
