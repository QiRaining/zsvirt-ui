import { useQuery } from "@apollo/client";
import { backupStorage } from "@zstack/virtualization-resource/src/gql/backup-storage.gql";
import CephMonList from "@zstack/virtualization-resource/src/pages/ceph-mon/list";
import ImageList from "@zstack/virtualization-resource/src/pages/image/list";
import TrashList from "@zstack/virtualization-resource/src/pages/trash/list";
import { processCache } from "@zstack/virtualization-resource/src/utils/page-cache";
import { AuthTabs, type AuthTabsListItem } from "@zstack/zsphere-design-biz";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { useVirtualizationResourceStore } from "@zstack/zsphere-platform-store";
import {
  CephMonType,
  Op,
  TrashQueryType,
  BackupStorageType,
} from "@zstack/zsphere-types";
import type { BackupStorage as IBackupStorage } from "@zstack/zsphere-types/graphql";
import qs from "qs";
import React, { useMemo, useState, useEffect } from "react";
import { useIntl } from "react-intl";
import { useNavigate, useLocation, useSearchParams } from "react-router";
import AuditList from "zsv_auditing/auditing-sub-list";
import ZWatchAlarmInDetailTab from "zsv_shared/zwatch-alarm/alarm-tab";
import { useShallow } from "zustand/react/shallow";

import Header from "./header";
import Monitoring from "./monitoring";
import Overview from "./overview";

const currentPlaceholder = {
  __typename: "BackupStorage",
  uuid: "",
  state: "",
  status: "",
  availableCapacity: 0,
  totalCapacity: 0,
  createDate: "",
  lastOpDate: "",
  dataNetwork: null,
  syncImageNetwork: null,
  systemTag: [""],
  name: "",
  description: null,
  type: "",
  hostname: "",
  url: "",
  sshPort: 22,
  username: "root",
  poolName: null,
  poolAvailableCapacity: null,
  poolUsedCapacity: null,
  poolReplicatedSize: null,
  zone: { __typename: "Zone", name: "", uuid: "" },
  mons: null,
};

const BackupStorageDetail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const uuid = searchParams.get("uuid") || "";
  const intl = useIntl();
  const navigate = useNavigate();
  const location = useLocation();
  const [routerTabTarget, setRouterTabTarget] = useState("");

  useEffect(() => {
    const { pathname, search, state } = location;
    const searchObj = qs.parse(search, { ignoreQueryPrefix: true });
    const { uuid: _uuid, toExport, ...rest } = searchObj;
    let searchStr = _uuid ? `?uuid=${_uuid}&` : "?";
    searchStr += Object.keys(rest ?? {})
      .map((key) => `${key}=${rest[key]}`)
      .join("&");
    if (toExport) {
      const locationState = (state ?? {}) as Record<string, unknown>;
      navigate(`${pathname}${searchStr}`, {
        replace: true,
        state: {
          ...locationState,
          _keyArr: ["exportRecord"],
          toExport,
        },
      });
      setRouterTabTarget("exportRecord");
    }
  }, [location, navigate]);

  const { data, refetch } = useQuery<{ backupStorage: IBackupStorage }>(
    backupStorage,
    {
      variables: { uuid },
    },
  );

  const [currentResource, cachedBackupStorages, setCachedBackupStorages] =
    useVirtualizationResourceStore(
      useShallow((state) => [
        state.currentResource,
        state.cachedBackupStorages,
        state.setCachedBackupStorages,
      ]),
    );

  // Update cache in useEffect to avoid updating state during render
  useEffect(() => {
    const newData = data?.backupStorage;
    if (newData && uuid) {
      const currentCachedBackupStorages =
        useVirtualizationResourceStore.getState().cachedBackupStorages;
      processCache(
        uuid,
        currentCachedBackupStorages,
        setCachedBackupStorages,
        newData,
      );
    }
  }, [data?.backupStorage, uuid, setCachedBackupStorages]);

  // Only compute value in useMemo, no side effects
  const current = useMemo(() => {
    const newData = data?.backupStorage;
    if (newData) {
      // 当有查询数据时，优先使用查询返回的 name
      return {
        ...currentPlaceholder,
        ...newData,
      };
    }
    // Get cached backup storage without updating state
    const cachedInstanceIndex = cachedBackupStorages.findIndex(
      (item) => item?.data?.uuid === uuid,
    );
    const cachedBackupStorage =
      cachedInstanceIndex > -1
        ? cachedBackupStorages[cachedInstanceIndex].data
        : null;
    // 只有在没有查询数据时，才使用 currentResource?.name 作为占位符
    return {
      ...currentPlaceholder,
      ...cachedBackupStorage,
      name: cachedBackupStorage?.name || currentResource?.name,
    };
  }, [data?.backupStorage, uuid, cachedBackupStorages, currentResource?.name]);

  const defaultQueryImage = useMemo(
    () => ({
      conditions: [
        {
          key: "backupStorage.uuid",
          op: Op.eq,
          value: uuid,
        },
        {
          key: "status",
          op: Op.ne,
          value: "Deleted",
        },
        {
          key: "__systemTag__",
          op: Op.ne,
          value: "remote",
        },
        {
          key: "system",
          op: Op.eq,
          value: "false",
        },
      ],
    }),
    [uuid],
  );

  const defaultQueryCephMon = useMemo(
    () => ({
      conditions: [
        {
          key: "uuid",
          value: uuid,
          op: Op.eq,
        },
      ],
      type: CephMonType.BackupStorage,
    }),
    [uuid],
  );

  const defaultQueryTrash = useMemo(
    () => ({
      conditions: [
        {
          key: "uuid",
          value: uuid,
          op: Op.eq,
        },
      ],
      type: TrashQueryType.BackupStorage,
    }),
    [uuid],
  );

  const defaultQueryAlarm = useMemo(
    () => ({
      extraConditions: [{ key: "resourceUuid", op: Op.eq, value: uuid }],
    }),
    [uuid],
  );

  const defaultQueryAudit = useMemo(
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

  const isCeph = useMemo(
    () => current?.type === BackupStorageType.Ceph,
    [current?.type],
  );

  useActionSubscribe({
    resourceTypeList: ["ResourceConfigInPage", "Image"],
    onFinish: () => {
      refetch?.();
    },
  });

  const tabsList = useMemo<AuthTabsListItem[]>(
    () => [
      {
        label: intl.formatMessage({ id: "overview", defaultMessage: "Overview" }),
        value: "overview",
        content: () => <Overview current={current!} refetch={refetch} />,
      },
      {
        label: intl.formatMessage({ id: "monitor", defaultMessage: "Monitoring" }),
        value: "monitoring",
        content: () => <Monitoring uuid={uuid} isCeph={isCeph} />,
      },
      {
        label: intl.formatMessage({ id: "image", defaultMessage: "Image" }),
        value: "image",
        auth: {
          type: "view",
          authKey: "list",
          resource: "virtualization.image",
        },
        content: () => (
          <ImageList
            source={current}
            view="sub.virtualization.backup-storage"
            defaultQuery={defaultQueryImage}
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "monitorNode",
          defaultMessage: "Monitoring Node",
        }),
        value: "monitoringNode",
        condition: isCeph,
        content: () => (
          <CephMonList
            source={current}
            view="sub.virtualization.backup-storage"
            defaultQuery={defaultQueryCephMon}
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "data.clean",
          defaultMessage: "Cleanup Data",
        }),
        value: "cleanup",
        condition: isCeph,
        content: () => (
          <TrashList
            view="sub.backup.storage"
            defaultQuery={defaultQueryTrash}
          />
        ),
      },
      {
        label: intl.formatMessage({
          id: "alarm.tabName",
          defaultMessage: "Alarm",
        }),
        value: "zwatch",
        condition: true,
        content: () => (
          <ZWatchAlarmInDetailTab
            source={current}
            view="sub.backup.storage"
            nameSpace="ZStack/BackupStorage"
            defaultQuery={defaultQueryAlarm}
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
        content: () => (
          <AuditList view="sub" defaultQuery={defaultQueryAudit} />
        ),
      },
    ],
    [
      intl,
      current,
      refetch,
      uuid,
      isCeph,
      defaultQueryImage,
      defaultQueryCephMon,
      defaultQueryTrash,
      defaultQueryAlarm,
      defaultQueryAudit,
    ],
  );

  return (
    <div className="zsv-detail-container">
      <Header current={current} refetch={refetch} />
      <AuthTabs
        variant="line"
        tabsList={tabsList}
        contentId="main-tab"
        routerTarget={routerTabTarget}
        rootClassName="flex flex-col flex-1"
        listClassName="pl-6"
        contentClassName="px-6 py-5 flex-1 flex min-w-0 flex-col"
      />
    </div>
  );
};

export default BackupStorageDetail;
