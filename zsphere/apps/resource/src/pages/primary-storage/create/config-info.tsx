import { useLazyQuery, useQuery } from "@apollo/client";
import { queryClusterList } from "@zstack/virtualization-resource/src/gql/cluster.gql";
import { hostList as queryHostList } from "@zstack/virtualization-resource/src/gql/host.gql";
import ClusterCreate from "@zstack/virtualization-resource/src/pages/cluster/create";
import { Form, Select, ZSVForm } from "@zstack/zsphere-components";
import { IIsRequiredType, useValidator } from "@zstack/zsphere-hooks";
import type { IQuery } from "@zstack/zsphere-types";
import {
  ClusterQueryType,
  HostState,
  HostStatus,
  Op,
  PrimaryStorageType,
} from "@zstack/zsphere-types";
import type { Host, Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import type { FormProps } from "antd/es/form";
import {
  find as _find,
  forEach as _forEach,
  includes as _includes,
  map as _map,
} from "lodash-es";
import type { FC } from "react";
import React, { useContext, useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";

import LocalStorageDeviceInfo from "../components/local-stroage-device-info";
import NfsStorageDeviceInfo from "../components/nfs-storage-device-info";
import SharedBlockStorageDeviceInfo from "../components/sharedBlock-storage-device-info";
import ZceStorageDeviceInfo from "../components/zce-storage-device-info";
import { getPrimaryStorageType } from "../utils";
import {
  PrimaryStorageResourceContext,
  PrimaryStorageTypeContext,
  SharedResourceDataContext,
} from "./contexts/storageContexts";
import type {
  IPrimaryStorageResourceContext,
  IPrimaryStorageTypeContext,
  ISharedResourceDataContext,
} from "./type";

import styles from "./style.module.less";

const { Card } = ZSVForm;
const EMPTY_LIST: never[] = [];
interface IProps {
  form: FormProps["form"];
}

const ConfigInfo: FC<IProps> = ({ form }) => {
  const intl = useIntl();
  const { isRequired } = useValidator(intl);
  const {
    resource,
    zone,
    initCluster,
    selectedRowKeys,
    setSelectedRowKeys,
    cluster,
    setCluster,
  } = useContext(
    PrimaryStorageResourceContext,
  ) as IPrimaryStorageResourceContext;
  const { setDiskInfo, setHostDataInTable } = useContext(
    SharedResourceDataContext,
  ) as ISharedResourceDataContext;
  const { primaryStorageType, subPrimaryStorageType } = useContext(
    PrimaryStorageTypeContext,
  ) as IPrimaryStorageTypeContext;
  const [clusterVisible, setClusterVisible] = useState<boolean>(false);

  const resolvedStorageType = useMemo(() => {
    if (primaryStorageType === PrimaryStorageType.Ceph) {
      switch (subPrimaryStorageType) {
        case "ZCE":
          return "Ceph";
        default:
          return primaryStorageType;
      }
    }

    return primaryStorageType;
  }, [primaryStorageType, subPrimaryStorageType]);

  const clusterDefaultQuery = useMemo(() => {
    const conditions: IQuery["conditions"] = [];

    const extraConditions: IQuery["extraConditions"] = [
      {
        key: "type",
        op: Op.eq,
        value: resolvedStorageType,
      },
      {
        key: "cephToken",
        op: Op.eq,
        value: form?.getFieldValue("token") ?? "",
      },
      {
        key: "isOpensource",
        op: Op.eq,
        value: "true",
      },
    ];

    if (
      !!resource?.iscsiClusterRefs &&
      resource?.iscsiClusterRefs?.length > 0
    ) {
      conditions.push({
        key: "uuid",
        op: Op.in,
        values: _map(resource?.iscsiClusterRefs || [], (it) => it?.clusterUuid),
      });
    }

    const hostUuids: string[] = [];
    if (
      !!resource?.fiberChannelLuns &&
      resource?.fiberChannelLuns?.length > 0
    ) {
      for (const fiberChannelLun of resource?.fiberChannelLuns ?? []) {
        if (
          fiberChannelLun?.scsiLunHostRefs &&
          fiberChannelLun?.scsiLunHostRefs?.length > 0
        ) {
          for (const scsiLunHostRef of fiberChannelLun?.scsiLunHostRefs ?? []) {
            hostUuids.push(scsiLunHostRef?.hostUuid);
          }
        }
      }
    }
    if (!!resource?.nvmeLuns && resource?.nvmeLuns?.length > 0) {
      for (const nvmeLun of resource?.nvmeLuns ?? []) {
        if (nvmeLun?.nvmeLunHostRefs && nvmeLun?.nvmeLunHostRefs?.length > 0) {
          for (const nvmeLunHostRef of nvmeLun?.nvmeLunHostRefs ?? []) {
            hostUuids.push(nvmeLunHostRef?.hostUuid);
          }
        }
      }
    }
    if (hostUuids?.length > 0) {
      conditions.push({
        key: "host.uuid",
        op: Op.in,
        values: hostUuids,
      });
    }

    if (initCluster?.uuid) {
      conditions.push({
        key: "uuid",
        op: Op.eq,
        value: initCluster?.uuid,
      });
    }

    if (zone?.uuid) {
      conditions.push({
        key: "zoneUuid",
        op: Op.eq,
        value: zone?.uuid,
      });
    }

    if (
      _includes(
        [PrimaryStorageType.SharedBlock, `${PrimaryStorageType.Ceph}-ZCE`],
        getPrimaryStorageType(primaryStorageType, subPrimaryStorageType),
      )
    ) {
      conditions.push({
        key: "hypervisorType",
        op: Op.notIn,
        values: ["ESX", "baremetal"],
      });
    } else {
      conditions.push({
        key: "hypervisorType",
        op: Op.notIn,
        values: ["baremetal2", "baremetal", "ESX"],
      });
    }

    return {
      type: ClusterQueryType.PsAttachableCluster,
      conditions,
      extraConditions,
    };
  }, [
    primaryStorageType,
    subPrimaryStorageType,
    zone?.uuid,
    resource,
    initCluster?.uuid,
  ]);

  const {
    loading: clusterLoading,
    data,
    refetch: refetchCluster,
  } = useQuery(queryClusterList, {
    variables: clusterDefaultQuery,
    fetchPolicy: "no-cache",
  });

  const clusterListMemo = useMemo<ICluster[]>(
    () => data?.clusterList?.list ?? [],
    [data],
  );

  useEffect(() => {
    if (!initCluster?.uuid) {
      const _clusterUuid = form?.getFieldValue("clusterUuid");

      const clusterInfo = _find(clusterListMemo || [], { uuid: _clusterUuid });

      if (!clusterInfo) {
        form?.setFields([
          {
            name: "clusterUuid",
            value: null,
          },
        ]);
      }
    }
  }, [clusterListMemo, initCluster?.uuid]);

  const [_queryHostList] = useLazyQuery(queryHostList, {
    onCompleted: (_data: any) => {
      const _hostList = _data?.hostList?.list;
      setHostDataInTable(_hostList);
      setSelectedRowKeys(_hostList?.map((it: Host) => it.uuid));
    },
    fetchPolicy: "no-cache",
    errorPolicy: "ignore",
  });

  useEffect(() => {
    if (
      cluster?.[0]?.uuid &&
      zone.uuid &&
      primaryStorageType === PrimaryStorageType.LocalStorage
    ) {
      _queryHostList({
        variables: {
          conditions: [
            {
              key: "zoneUuid",
              op: Op.eq,
              value: zone?.uuid,
            },
            {
              key: "clusterUuid",
              op: Op.eq,
              value: cluster?.[0]?.uuid,
            },
            { key: "state", op: Op.eq, value: HostState.Enabled },
            { key: "status", op: Op.eq, value: HostStatus.Connected },
            { key: "hypervisorType", op: Op.ne, value: "ESX" },
          ],
        },
      });
    }
  }, [cluster, zone, primaryStorageType]);

  return (
    <Card
      title={intl.formatMessage({
        id: "config.info",
        defaultMessage: "Configurations",
      })}
    >
      {/* 集群 */}
      <Form.Item
        name="clusterUuid"
        label={intl.formatMessage({
          id: "cluster",
          defaultMessage: "Cluster",
        })}
        rules={initCluster?.uuid ? [] : [isRequired(IIsRequiredType.select)]}
      >
        {initCluster?.uuid ? (
          <>{initCluster?.name}</>
        ) : (
          <Select
            helper={{
              gql: queryClusterList,
              type: "Cluster",
              resource: "cluster",
              defaultQuery: clusterDefaultQuery,
            }}
            allowClear
            className={styles["width-400"]}
            loading={clusterLoading}
            value={clusterLoading ? undefined : cluster?.[0]?.uuid}
            onChange={(uuid) => {
              setDiskInfo([]);
              _forEach(selectedRowKeys, (value) => {
                form?.resetFields([`disk-${value}`]);
              });

              if (!uuid) {
                setHostDataInTable([]);
                setCluster([]);
                return;
              }

              const findObj = clusterListMemo.find(
                (item) => item.uuid === uuid,
              );
              setCluster(findObj ? [findObj] : []);
            }}
            options={clusterListMemo?.map((item: ICluster) => ({
              label: item.name,
              value: item.uuid,
            }))}
          />
        )}
      </Form.Item>

      {/* SharedBlock */}
      {_includes([PrimaryStorageType.SharedBlock], primaryStorageType) ? (
        <SharedBlockStorageDeviceInfo form={form} />
      ) : null}

      {/* Ceph（内部兼容值仍为 ZCE） */}
      {_includes(
        [`${PrimaryStorageType.Ceph}-ZCE`],
        getPrimaryStorageType(primaryStorageType, subPrimaryStorageType),
      ) ? (
        <ZceStorageDeviceInfo form={form} />
      ) : null}

      {/* LocalStorage */}
      {_includes([PrimaryStorageType.LocalStorage], primaryStorageType) ? (
        <LocalStorageDeviceInfo form={form} />
      ) : null}

      {/* NFS */}
      {_includes([PrimaryStorageType.NFS], primaryStorageType) ? (
        <NfsStorageDeviceInfo form={form} />
      ) : null}

      <ClusterCreate
        source={resource}
        visible={clusterVisible}
        setVisible={setClusterVisible}
        refetch={refetchCluster}
        view=""
        selectedList={EMPTY_LIST}
        position="header"
      />
    </Card>
  );
};

export default ConfigInfo;
