import { useSuspenseQuery } from "@apollo/client";
import { primaryStorageList } from "@zstack/virtualization-resource/src/gql/primary-storage.gql";
import CephMonList from "@zstack/virtualization-resource/src/pages/ceph-mon/list";
import Config from "@zstack/virtualization-resource/src/pages/primary-storage/detail/config";
import SharedBlockList from "@zstack/virtualization-resource/src/pages/shared-block/list";
import TrashList from "@zstack/virtualization-resource/src/pages/trash/list";
import { processCache } from "@zstack/virtualization-resource/src/utils/page-cache";
import { AuthTabs, type AuthTabsListItem } from "@zstack/zsphere-design-biz";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { useVirtualizationResourceStore } from "@zstack/zsphere-platform-store";
import {
  CephMonType,
  Op,
  TrashQueryType,
  CephPrimaryStoragePoolType,
} from "@zstack/zsphere-types";
import type { CephPrimaryStoragePool as ICephPrimaryStoragePool } from "@zstack/zsphere-types/graphql";
import { isVhostStorage, isZbsStorage } from "@zstack/zsphere-utils";
import { includes } from "lodash-es";
import React, { useMemo, useEffect } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";
import AuditList from "zsv_auditing/auditing-sub-list";
import ZWatch from "zsv_shared/zwatch-alarm/alarm-tab";
import { useShallow } from "zustand/react/shallow";

import { AuthCheck } from "../../../components/no-permission-page/context";
import CBDPrimaryStorageList from "../../cbd-primary-storage-pool/list";
import CephPrimaryStoragePoolList from "../../ceph-primary-storage-pool/list";
import VHostPrimaryStorageList from "../../vhost-primary-storage-pool/list";
import CbdMdsList from "../../zbs-mds/list";
import Header from "./header";
import Monitoring from "./monitoring";
import Overview from "./overview";

const currentPlaceholder = {
  __typename: "PrimaryStorageVO",
  uuid: "",
  name: "",
  description: "",
  createDate: "",
  lastOpDate: "",
  attachedClusterUuids: [""],
  availableCapacity: 0,
  availablePhysicalCapacity: 0,
  fsid: null,
  mons: null,
  mountPath: "",
  pools: null,
  sharedBlockGroupType: null,
  sharedBlocks: null,
  state: "Enabled",
  status: "Connected",
  systemUsedCapacity: 0,
  totalCapacity: 0,
  totalPhysicalCapacity: 0,
  type: "",
  url: "",
  volumeCount: 0,
  vmInstanceCount: 0,
  baremetal2InstancesCount: 0,
  systemTag: {
    __typename: "PrimaryStorageSystemTag",
    nocephx: false,
    thinProvision: false,
    thinProvisionUuid: null,
    gatewayCidr: null,
    rootVolumePoolName: null,
    dataVolumePoolName: null,
    imageCachePoolName: null,
    nfsMountOptions: null,
    cephToken: null,
    cephVendor: null,
  },
  expired: null,
  zone: { __typename: "Zone", uuid: "", name: "" },
  clusters: [{ __typename: "Cluster", uuid: "", name: "" }],
  zoneUuid: "",
};

const PrimaryStorageDetail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") ?? "";
  const intl = useIntl();

  const { data, refetch: primaryStorageRefetch } = useSuspenseQuery(
    primaryStorageList,
    {
      fetchPolicy: "cache-and-network",
      variables: {
        conditions: [
          {
            key: "uuid",
            op: Op.eq,
            value: uuid,
          },
        ],
      },
    },
  );

  const refetch = () => {
    primaryStorageRefetch();
  };

  const [currentResource, cachedPrimaryStorages, setCachedPrimaryStorages] =
    useVirtualizationResourceStore(
      useShallow((state) => [
        state.currentResource,
        state.cachedPrimaryStorages,
        state.setCachedPrimaryStorages,
      ]),
    );

  // Update cache in useEffect to avoid updating state during render
  useEffect(() => {
    const newData = data?.primaryStorageList?.list?.[0];
    if (newData && uuid) {
      const currentCachedPrimaryStorages =
        useVirtualizationResourceStore.getState().cachedPrimaryStorages;
      processCache(
        uuid,
        currentCachedPrimaryStorages,
        setCachedPrimaryStorages,
        newData,
      );
    }
  }, [data?.primaryStorageList?.list, uuid, setCachedPrimaryStorages]);

  // Only compute value in useMemo, no side effects
  const current = useMemo(() => {
    const newData = data?.primaryStorageList?.list?.[0];
    if (newData) {
      // 当有查询数据时，优先使用查询返回的 name
      return { ...currentPlaceholder, ...newData };
    }
    // Get cached primary storage without updating state
    const cachedInstanceIndex = cachedPrimaryStorages.findIndex(
      (item) => item?.data?.uuid === uuid,
    );
    const cachedPrimaryStorage =
      cachedInstanceIndex > -1
        ? cachedPrimaryStorages[cachedInstanceIndex].data
        : null;
    // 只有在没有查询数据时，才使用 currentResource?.name 作为占位符
    return {
      ...currentPlaceholder,
      ...cachedPrimaryStorage,
      name: cachedPrimaryStorage?.name || currentResource?.name,
    };
  }, [
    data?.primaryStorageList?.list,
    uuid,
    cachedPrimaryStorages,
    currentResource?.name,
  ]);

  const defaultQuery = useMemo(
    () => ({
      conditions: [
        {
          key: "resourceUuid",
          op: Op.eq,
          value: uuid,
        },
      ],
    }),
    [uuid],
  );

  useActionSubscribe({
    resourceTypeList: ["PrimaryStorageVO", "CephPrimaryStoragePool", "HostVO"],
    onFinish: () => {
      refetch?.();
    },
  });

  const tabsList = useMemo<AuthTabsListItem[]>(
    () => [
      {
        label: intl.formatMessage({
          id: "virtualization.overview",
          defaultMessage: "Overview",
        }),
        value: "overview",
        content: () => <Overview current={current!} refetch={refetch} />,
      },
      {
        label: intl.formatMessage({ id: "monitor", defaultMessage: "Monitoring" }),
        value: "monitoring",
        content: () => <Monitoring uuid={uuid} />,
      },
      {
        label: intl.formatMessage({
          id: "monitoringNode",
          defaultMessage: "Monitoring Node",
        }),
        value: "cephMon",
        condition: !!includes(["Ceph", "Fusionstor"], current?.type),
        content: () => (
          <CephMonList
            source={current}
            view="sub.primary.storage"
            defaultQuery={{
              conditions: [
                {
                  key: "uuid",
                  value: current.uuid,
                  op: Op.eq,
                },
              ],
              type: CephMonType.PrimaryStorage,
            }}
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "mds.node",
          defaultMessage: "MDS Node",
        }),
        value: "mdsNode",
        condition: !!isZbsStorage(current),
        content: () => (
          <CbdMdsList
            view="virtualization.main"
            source={current}
            defaultQuery={{
              conditions: [
                { key: "primaryStorageUuid", op: Op.eq, value: current.uuid },
              ],
            }}
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "relatedResource",
          defaultMessage: "Associated Resource",
        }),
        value: "config",
        noPadding: true,
        content: () => <Config current={current} />,
      },
      {
        label: intl.formatMessage({
          id: "storagePools",
          defaultMessage: "Storage Pool",
        }),
        value: "ceph-pools",
        condition: !!includes(["Ceph"], current?.type),
        auth: {
          type: "block",
          resource: "primary.storage",
          authKey: "storagePools",
        },
        content: () => (
          <CephPrimaryStoragePoolList
            view="sub.virtualization.primary.storage"
            source={current}
            rowSelection={{
              getCheckboxProps: (record: ICephPrimaryStoragePool) => ({
                disabled: record.type !== "Data",
              }),
            }}
            defaultQuery={{
              conditions: [
                {
                  key: "primaryStorageUuid",
                  op: Op.eq,
                  value: current.uuid,
                },
                {
                  key: "type",
                  op: Op.ne,
                  value: CephPrimaryStoragePoolType.Root,
                },
              ],
            }}
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "sharedblock",
          defaultMessage: "LUN",
        }),
        value: "sharedblock",
        condition: !!includes(["SharedBlock"], current?.type),
        auth: {
          type: "block",
          resource: "primary.storage",
          authKey: "sharedBlock",
        },
        content: () => (
          <SharedBlockList
            view="sub"
            source={current}
            defaultQuery={{
              conditions: [
                {
                  key: "sharedBlockGroupUuid",
                  op: Op.eq,
                  value: current.uuid,
                },
              ],
            }}
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "storagePools",
          defaultMessage: "Storage Pool",
        }),
        value: "vhost-pools",
        condition: !!isVhostStorage(current),
        auth: {
          type: "block",
          resource: "primary.storage",
          authKey: "storagePools",
        },
        content: () => (
          <VHostPrimaryStorageList
            view="virtualization.main"
            source={current}
            defaultQuery={{
              conditions: [
                {
                  key: "__primaryStorageUuid__",
                  value: current.uuid,
                  op: Op.eq,
                },
                {
                  key: "__isGetAddedPools__",
                  value: true,
                  op: Op.eq,
                },
              ],
            }}
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "storagePools",
          defaultMessage: "Storage Pool",
        }),
        value: "zbs-pools",
        condition: !!isZbsStorage(current),
        auth: {
          type: "block",
          resource: "primary.storage",
          authKey: "storagePools",
        },
        content: () => (
          <CBDPrimaryStorageList
            view="virtualization.main"
            source={current}
            defaultQuery={{
              conditions: [
                {
                  key: "__PrimaryStorageUuid__",
                  value: current.uuid,
                  op: Op.eq,
                },
              ],
            }}
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "alarm.tabName",
          defaultMessage: "Alarm",
        }),
        value: "zwatch.alarm",
        content: () => (
          <AuthCheck
            resourceTypes={[
              "virtualization.zwatch.alarm",
              "virtualization.alarm.message",
            ]}
          >
            <ZWatch
              source={current}
              view="sub.primary.storage"
              nameSpace="ZStack/PrimaryStorage"
              defaultQuery={{
                extraConditions: [
                  { key: "resourceUuid", op: Op.eq, value: current?.uuid },
                ],
              }}
            />
          </AuthCheck>
        ),
      },
      {
        label: intl.formatMessage({
          id: "dataCleanup",
          defaultMessage: "Cleanup Data",
        }),
        value: "data.cleanup",
        auth: {
          type: "block",
          resource: "primary.storage",
          authKey: "data.cleanup",
        },
        content: () => (
          <TrashList
            view="sub.primary.storage"
            defaultQuery={{
              conditions: [
                {
                  key: "uuid",
                  value: current.uuid,
                  op: Op.eq,
                },
              ],
              type: TrashQueryType.PrimaryStorage,
            }}
          />
        ),
      },
      {
        label: intl.formatMessage({ id: "audit", defaultMessage: "Event" }),
        value: "auditing",
        auth: {
          type: "view",
          authKey: "list",
          resource: "virtualization.auditing",
        },
        content: () => <AuditList view="sub" defaultQuery={defaultQuery} />,
      },
    ],
    [current, defaultQuery, intl, refetch, uuid],
  );

  return (
    <div className="zsv-detail-container">
      <Header current={current} refetch={refetch} />
      <AuthTabs
        variant="line"
        tabsList={tabsList}
        contentId="main-tab"
        rootClassName="flex flex-col flex-1"
        listClassName="pl-6"
        contentClassName="px-6 py-5 flex-1 flex min-w-0 flex-col"
      />
    </div>
  );
};

export default React.memo(PrimaryStorageDetail);
